import { z } from 'zod';
import { roleKeys, topicKeys } from '@/config/site';

/** 検証エラー1件。ファイルパスと項目名を必ず持つ */
export interface ContentIssue {
  file: string;
  field?: string;
  message: string;
}

export type ParseResult<T> = { ok: true; data: T } | { ok: false; issues: ContentIssue[] };

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * 日付。YAML は `2026-10-01` を Date に変換するため、Date と文字列の両方を受けて
 * YYYY-MM-DD の文字列に揃える。
 */
const dateField = z.union([z.string(), z.date()]).transform((value, ctx) => {
  const text = value instanceof Date ? value.toISOString().slice(0, 10) : value.trim();
  if (!DATE_RE.test(text) || Number.isNaN(Date.parse(text))) {
    ctx.addIssue({
      code: 'custom',
      message: `日付は YYYY-MM-DD の形式で書いてください（現在: "${String(value)}"）`,
    });
    return z.NEVER;
  }
  return text;
});

/** 文字列でも配列でも受けて配列に揃える */
const stringList = z
  .union([z.string(), z.array(z.string())])
  .default([])
  .transform((value) => (typeof value === 'string' ? [value] : value));

const URL_RE = /^https?:\/\//;

/** 語彙違反のメッセージ。何を書いたかも示す */
function vocabularyError(label: string, allowed: readonly string[]) {
  return (issue: { input?: unknown }) =>
    `${label} は次のいずれかです: ${allowed.join(', ')}（現在: "${String(issue.input)}"）`;
}

export const storyFrontMatterSchema = z.object({
  title: z.string().min(1, 'title を書いてください'),
  subtitle: z.string().optional(),
  kind: z.enum(['official', 'personal'], {
    error: vocabularyError('kind', ['official（公式）', 'personal（個人・団体）']),
  }),
  owner: z.string().min(1, 'owner を書いてください'),
  startDate: dateField,
  status: z.enum(['active', 'finished'], {
    error: vocabularyError('status', ['active（進行中）', 'finished（完了）']),
  }),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'color は "#RRGGBB" の形式で書いてください')
    .optional(),
  cover: z.string().min(1).optional(),
  order: z.number({ error: 'order は数値で書いてください' }).int('order は整数で書いてください'),
  draft: z.boolean({ error: 'draft は true か false です' }).default(false),
});

export const recordFrontMatterSchema = z.object({
  title: z.string().min(1, 'title を書いてください'),
  date: dateField,
  author: z.object({
    name: z.string().min(1, 'author.name を書いてください'),
    role: z.enum(roleKeys, { error: vocabularyError('author.role', roleKeys) }),
  }),
  summary: z.string().min(1, 'summary を書いてください'),
  tags: stringList,
  topics: stringList.pipe(z.array(z.enum(topicKeys, { error: vocabularyError('topics', topicKeys) }))),
  thumbnail: z.string().min(1).optional(),
  instagram: stringList.pipe(
    z.array(z.string().regex(URL_RE, 'instagram は https:// で始まる URL を書いてください')),
  ),
  draft: z.boolean({ error: 'draft は true か false です' }).default(false),
});

export type StoryFrontMatter = z.infer<typeof storyFrontMatterSchema>;
export type RecordFrontMatter = z.infer<typeof recordFrontMatterSchema>;

const STORY_REQUIRED = ['title', 'kind', 'owner', 'startDate', 'status', 'order'];
const RECORD_REQUIRED = ['title', 'date', 'author.name', 'author.role', 'summary'];

function getByPath(data: Record<string, unknown>, dotted: string): unknown {
  return dotted.split('.').reduce<unknown>((current, key) => {
    if (current && typeof current === 'object') {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, data);
}

/** 必須項目の欠落を、zod より先に分かりやすい文で報告する */
function missingIssues(
  data: Record<string, unknown>,
  required: string[],
  file: string,
): ContentIssue[] {
  return required
    .filter((field) => {
      const value = getByPath(data, field);
      return value === undefined || value === null || value === '';
    })
    .map((field) => ({ file, field, message: `必須項目 ${field} がありません` }));
}

function zodIssues(error: z.ZodError, file: string): ContentIssue[] {
  return error.issues.map((issue) => ({
    file,
    field: issue.path.map(String).join('.') || undefined,
    message: issue.message,
  }));
}

function parseWith<T>(
  schema: z.ZodType<T>,
  required: string[],
  data: unknown,
  file: string,
): ParseResult<T> {
  const record = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>;
  const missing = missingIssues(record, required, file);
  if (missing.length > 0) return { ok: false, issues: missing };
  const result = schema.safeParse(record);
  if (!result.success) return { ok: false, issues: zodIssues(result.error, file) };
  return { ok: true, data: result.data };
}

export function parseStoryFrontMatter(data: unknown, file: string): ParseResult<StoryFrontMatter> {
  return parseWith(storyFrontMatterSchema, STORY_REQUIRED, data, file);
}

export function parseRecordFrontMatter(
  data: unknown,
  file: string,
): ParseResult<RecordFrontMatter> {
  return parseWith(recordFrontMatterSchema, RECORD_REQUIRED, data, file);
}
