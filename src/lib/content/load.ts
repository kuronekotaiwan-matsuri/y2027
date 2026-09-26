/**
 * content/people/ と content/records/ を読み、検証し、HTML に変換する。
 * fs を使うのでサーバー側（ビルド時）専用。client component から import しないこと。
 */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { site } from '@/config/site';
import { isAbsoluteUrl, withBasePath } from '@/lib/urls';
import { markdownToHtml } from './markdown';
import { parsePersonFrontMatter, parseRecordFrontMatter, type ContentIssue } from './schema';
import { sortPeople, sortRecordsByDate } from './select';
import type { ContentData, MakingRecord, Person } from './types';

export interface LoadOptions {
  /** content/people の場所（テストで差し替える） */
  peopleDir?: string;
  /** content/records の場所（テストで差し替える） */
  recordsDir?: string;
  /** public の場所（画像の存在確認に使う） */
  publicDir?: string;
  /**
   * draft を含めるか。既定は NODE_ENV !== 'production'。
   * 本番ビルドで下書きを確認したいときは環境変数 CONTENT_INCLUDE_DRAFTS=1 を付ける
   * （例: `CONTENT_INCLUDE_DRAFTS=1 npm run build`。公開用のビルドでは使わない）
   */
  includeDrafts?: boolean;
  basePath?: string;
  /** 警告の出力先。既定は console.warn */
  warn?: (message: string) => void;
}

export class ContentValidationError extends Error {
  readonly issues: ContentIssue[];

  constructor(issues: ContentIssue[]) {
    const lines = issues.map(
      (issue) => `  - ${issue.file}${issue.field ? ` [${issue.field}]` : ''}: ${issue.message}`,
    );
    super([`content の検証に失敗しました（${issues.length} 件）:`, ...lines].join('\n'));
    this.name = 'ContentValidationError';
    this.issues = issues;
  }
}

/** 書き手 ID: 英小文字・数字・ハイフン */
const PERSON_FILE_RE = /^[a-z0-9-]+\.md$/;
const RECORD_FILE_RE = /^\d{4}-\d{2}-\d{2}-[a-z0-9-]+\.md$/;

function toPosix(value: string): string {
  return value.split(path.sep).join('/');
}

function listMarkdown(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.md'))
    .sort();
}

export function loadContent(options: LoadOptions = {}): ContentData {
  const contentDir = path.join(process.cwd(), 'content');
  const peopleDir = options.peopleDir ?? path.join(contentDir, 'people');
  const recordsDir = options.recordsDir ?? path.join(contentDir, 'records');
  const publicDir = options.publicDir ?? path.join(process.cwd(), 'public');
  const includeDrafts =
    options.includeDrafts ??
    (process.env.CONTENT_INCLUDE_DRAFTS === '1' || process.env.NODE_ENV !== 'production');
  const basePath = options.basePath ?? site.basePath;
  const warn = options.warn ?? ((message: string) => console.warn(message));

  const issues: ContentIssue[] = [];

  const relativePath = (dir: string, fileName: string) =>
    toPosix(path.relative(process.cwd(), path.join(dir, fileName)));

  const checkImage = (imagePath: string, file: string, field: string) => {
    if (isAbsoluteUrl(imagePath) || !imagePath.startsWith('/')) return;
    if (!fs.existsSync(path.join(publicDir, imagePath))) {
      warn(`${file} [${field}]: 画像 ${imagePath} が public にありません`);
    }
  };

  // ---- 書き手（draft も含めて全員読む。記録の author の照合に使う） ----
  const peopleById = new Map<string, Person>();
  /** ファイル名が正しい書き手の ID。front-matter が不正でも数える（記録側で二重に報告しないため） */
  const knownIds = new Set<string>();

  for (const fileName of listMarkdown(peopleDir)) {
    const file = relativePath(peopleDir, fileName);
    if (!PERSON_FILE_RE.test(fileName)) {
      issues.push({
        file,
        message: `書き手のファイル名（ID）は英小文字・数字・ハイフンだけにしてください（現在: "${fileName}"）`,
      });
      continue;
    }
    const id = fileName.slice(0, -3);
    knownIds.add(id);

    const raw = matter(fs.readFileSync(path.join(peopleDir, fileName), 'utf8'));
    const parsed = parsePersonFrontMatter(raw.data, file);
    if (!parsed.ok) {
      issues.push(...parsed.issues);
      continue;
    }
    const meta = parsed.data;
    if (meta.avatar) checkImage(meta.avatar, file, 'avatar');
    peopleById.set(id, {
      id,
      name: meta.name,
      role: meta.role,
      kind: meta.kind,
      avatar: meta.avatar ? withBasePath(meta.avatar, basePath) : undefined,
      bio: meta.bio,
      instagram: meta.instagram,
      order: meta.order,
      isDraft: meta.draft,
      bodyHtml: markdownToHtml(raw.content, {
        basePath,
        onLocalImage: (imagePath) => checkImage(imagePath, file, '本文'),
      }),
      filePath: file,
    });
  }

  const registeredIds = [...knownIds].sort();
  const registeredText = registeredIds.length > 0 ? registeredIds.join(', ') : 'なし';

  // ---- 記録 ----
  const records: MakingRecord[] = [];
  const seenSlugs = new Map<string, string>();

  for (const fileName of listMarkdown(recordsDir)) {
    const file = relativePath(recordsDir, fileName);
    if (!RECORD_FILE_RE.test(fileName)) {
      issues.push({
        file,
        message: '記録のファイル名は YYYY-MM-DD-<英小文字の名前>.md にしてください',
      });
      continue;
    }
    const slug = fileName.slice(0, -3);
    const raw = matter(fs.readFileSync(path.join(recordsDir, fileName), 'utf8'));
    const parsed = parseRecordFrontMatter(raw.data, file);
    if (!parsed.ok) {
      issues.push(...parsed.issues);
      continue;
    }
    const meta = parsed.data;

    const author = peopleById.get(meta.author);
    if (!author) {
      // ID 自体はあるが書き手の検証に失敗している場合は、書き手側のエラーだけを報告する
      if (!knownIds.has(meta.author)) {
        issues.push({
          file,
          field: 'author',
          message: `author "${meta.author}" は content/people/ にありません（登録されているID: ${registeredText}）`,
        });
      }
      continue;
    }

    // 1フォルダなのでファイル名が同じ記録は置けないが、念のため重複を検出する（仕様書 9.4）
    const seenIn = seenSlugs.get(slug);
    if (seenIn) {
      issues.push({ file, message: `記録 slug "${slug}" が ${seenIn} と重複しています` });
      continue;
    }
    seenSlugs.set(slug, file);

    // 書き手が draft なら、その記録も draft 扱い（仕様書 3.2）
    const isDraft = meta.draft || author.isDraft;
    if (isDraft && !includeDrafts) continue;

    if (meta.thumbnail) checkImage(meta.thumbnail, file, 'thumbnail');
    records.push({
      slug,
      title: meta.title,
      date: meta.date,
      author: meta.author,
      summary: meta.summary,
      tags: meta.tags,
      topics: meta.topics,
      thumbnail: meta.thumbnail ? withBasePath(meta.thumbnail, basePath) : undefined,
      instagram: meta.instagram,
      isDraft,
      bodyHtml: markdownToHtml(raw.content, {
        basePath,
        onLocalImage: (imagePath) => checkImage(imagePath, file, '本文'),
      }),
      filePath: file,
    });
  }

  if (issues.length > 0) {
    throw new ContentValidationError(issues);
  }

  const people = [...peopleById.values()].filter((person) => includeDrafts || !person.isDraft);
  return {
    people: sortPeople(people),
    records: sortRecordsByDate(records, 'asc'),
  };
}
