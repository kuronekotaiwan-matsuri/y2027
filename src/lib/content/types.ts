import type { RoleKey, StoryColor, TopicKey } from '@/config/site';

export type StoryKind = 'official' | 'personal';
export type StoryStatus = 'active' | 'finished';

/** 色を割り当てる前の物語 */
export interface StoryBase {
  slug: string;
  title: string;
  subtitle?: string;
  kind: StoryKind;
  owner: string;
  /** YYYY-MM-DD */
  startDate: string;
  status: StoryStatus;
  /** front-matter で指定された色（任意） */
  customColor?: string;
  /** basePath 付与済み */
  cover?: string;
  order: number;
  isDraft: boolean;
  bodyHtml: string;
  /** リポジトリ基準の相対パス（エラー表示用） */
  filePath: string;
}

export interface Story extends StoryBase {
  /** 割り当て済みの色 */
  color: StoryColor;
}

/** クライアントに渡す用（本文なし） */
export type StorySummary = Omit<Story, 'bodyHtml'>;

export interface RecordAuthor {
  name: string;
  role: RoleKey;
}

export interface StoryRecord {
  /** ファイル名から .md を除いたもの。サイト全体で一意 */
  slug: string;
  storySlug: string;
  title: string;
  /** YYYY-MM-DD。出来事の日 */
  date: string;
  author: RecordAuthor;
  summary: string;
  tags: string[];
  topics: TopicKey[];
  /** basePath 付与済み */
  thumbnail?: string;
  instagram: string[];
  isDraft: boolean;
  bodyHtml: string;
  filePath: string;
}

/** クライアントに渡す用（本文なし） */
export type RecordSummary = Omit<StoryRecord, 'bodyHtml'>;

export interface ContentData {
  /** order 順 */
  stories: Story[];
  /** 日付昇順 */
  records: StoryRecord[];
}
