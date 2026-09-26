/**
 * content/stories/ を読み、検証し、HTML に変換する。
 * fs を使うのでサーバー側（ビルド時）専用。client component から import しないこと。
 */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { site } from '@/config/site';
import { isAbsoluteUrl, withBasePath } from '@/lib/urls';
import { markdownToHtml } from './markdown';
import { parseRecordFrontMatter, parseStoryFrontMatter, type ContentIssue } from './schema';
import { assignStoryColors, sortRecordsByDate, sortStoriesByOrder } from './select';
import type { ContentData, StoryBase, StoryRecord } from './types';

export interface LoadOptions {
  /** content/stories の場所（テストで差し替える） */
  storiesDir?: string;
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

const SLUG_RE = /^[a-z0-9-]+$/;
const RECORD_FILE_RE = /^\d{4}-\d{2}-\d{2}-[a-z0-9-]+\.md$/;

function toPosix(value: string): string {
  return value.split(path.sep).join('/');
}

export function loadContent(options: LoadOptions = {}): ContentData {
  const storiesDir = options.storiesDir ?? path.join(process.cwd(), 'content', 'stories');
  const publicDir = options.publicDir ?? path.join(process.cwd(), 'public');
  const includeDrafts =
    options.includeDrafts ??
    (process.env.CONTENT_INCLUDE_DRAFTS === '1' || process.env.NODE_ENV !== 'production');
  const basePath = options.basePath ?? site.basePath;
  const warn = options.warn ?? ((message: string) => console.warn(message));

  const issues: ContentIssue[] = [];
  const stories: StoryBase[] = [];
  const records: StoryRecord[] = [];
  const seenSlugs = new Map<string, string>();

  const relativePath = (...segments: string[]) =>
    toPosix(path.relative(process.cwd(), path.join(storiesDir, ...segments)));

  const checkImage = (imagePath: string, file: string, field: string) => {
    if (isAbsoluteUrl(imagePath) || !imagePath.startsWith('/')) return;
    if (!fs.existsSync(path.join(publicDir, imagePath))) {
      warn(`${file} [${field}]: 画像 ${imagePath} が public にありません`);
    }
  };

  if (!fs.existsSync(storiesDir)) {
    return { stories: [], records: [] };
  }

  const storyDirs = fs
    .readdirSync(storiesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const storySlug of storyDirs) {
    const storyDir = path.join(storiesDir, storySlug);
    const storyFile = relativePath(storySlug, 'story.md');
    const recordFiles = fs
      .readdirSync(storyDir)
      .filter((name) => name.endsWith('.md') && name !== 'story.md')
      .sort();

    if (!SLUG_RE.test(storySlug)) {
      issues.push({
        file: relativePath(storySlug),
        message: `物語のフォルダ名 "${storySlug}" は英小文字・数字・ハイフンだけにしてください`,
      });
      continue;
    }

    if (!fs.existsSync(path.join(storyDir, 'story.md'))) {
      issues.push({
        file: storyFile,
        message: `story.md がありません（このフォルダの記録 ${recordFiles.length} 件が物語に属していません）`,
      });
      continue;
    }

    const storyRaw = matter(fs.readFileSync(path.join(storyDir, 'story.md'), 'utf8'));
    const parsedStory = parseStoryFrontMatter(storyRaw.data, storyFile);
    if (!parsedStory.ok) {
      issues.push(...parsedStory.issues);
      continue;
    }
    const storyMeta = parsedStory.data;
    const storyIsDraft = storyMeta.draft;

    // 記録は物語が draft でなくても検証する（重複 slug などを早く知らせる）
    const storyRecords: StoryRecord[] = [];
    for (const fileName of recordFiles) {
      const file = relativePath(storySlug, fileName);
      if (!RECORD_FILE_RE.test(fileName)) {
        issues.push({
          file,
          message: '記録のファイル名は YYYY-MM-DD-<英小文字の名前>.md にしてください',
        });
        continue;
      }
      const slug = fileName.slice(0, -3);
      const raw = matter(fs.readFileSync(path.join(storyDir, fileName), 'utf8'));
      const parsed = parseRecordFrontMatter(raw.data, file);
      if (!parsed.ok) {
        issues.push(...parsed.issues);
        continue;
      }
      const seenIn = seenSlugs.get(slug);
      if (seenIn) {
        issues.push({ file, message: `記録 slug "${slug}" が ${seenIn} と重複しています` });
        continue;
      }
      seenSlugs.set(slug, file);

      const meta = parsed.data;
      const isDraft = meta.draft || storyIsDraft;
      if (isDraft && !includeDrafts) continue;

      if (meta.thumbnail) checkImage(meta.thumbnail, file, 'thumbnail');
      storyRecords.push({
        slug,
        storySlug,
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

    if (storyIsDraft && !includeDrafts) continue;

    if (storyMeta.cover) checkImage(storyMeta.cover, storyFile, 'cover');
    stories.push({
      slug: storySlug,
      title: storyMeta.title,
      subtitle: storyMeta.subtitle,
      kind: storyMeta.kind,
      owner: storyMeta.owner,
      startDate: storyMeta.startDate,
      status: storyMeta.status,
      customColor: storyMeta.color,
      cover: storyMeta.cover ? withBasePath(storyMeta.cover, basePath) : undefined,
      order: storyMeta.order,
      isDraft: storyIsDraft,
      bodyHtml: markdownToHtml(storyRaw.content, {
        basePath,
        onLocalImage: (imagePath) => checkImage(imagePath, storyFile, '本文'),
      }),
      filePath: storyFile,
    });
    records.push(...storyRecords);
  }

  if (issues.length > 0) {
    throw new ContentValidationError(issues);
  }

  return {
    stories: assignStoryColors(sortStoriesByOrder(stories)),
    records: sortRecordsByDate(records, 'asc'),
  };
}
