import type { RoleKey, TopicKey } from '@/config/site';

/** 書き手の種類。group は組織（署名に立場を添えず、顔は黒猫のマーク） */
export type PersonKind = 'person' | 'group';

/** 書き手（仕様書 3.2）。content/people/<id>.md */
export interface Person {
  /** ファイル名から .md を除いたもの。記録の author から参照する */
  id: string;
  name: string;
  /** 顔の下や「〇〇の記録」の見出しで使う短い名前（任意。組織名が長いとき）。無ければ name を使う */
  shortName?: string;
  role: RoleKey;
  kind: PersonKind;
  /** basePath 付与済み */
  avatar?: string;
  /** 一言の自己紹介 */
  bio?: string;
  instagram?: string;
  /** 並び順（任意。無い人は ID 順で後ろ） */
  order?: number;
  isDraft: boolean;
  /** 長めの自己紹介（本文）。無ければ空文字 */
  bodyHtml: string;
  /** リポジトリ基準の相対パス（エラー表示用） */
  filePath: string;
}

/** クライアントに渡す用（本文なし） */
export type PersonSummary = Omit<Person, 'bodyHtml'>;

/**
 * 記録（仕様書 3.1）。content/records/YYYY-MM-DD-<name>.md
 * TypeScript の組み込み型 Record と衝突するため MakingRecord と呼ぶ。
 */
export interface MakingRecord {
  /** ファイル名から .md を除いたもの。サイト全体で一意 */
  slug: string;
  title: string;
  /** YYYY-MM-DD。出来事の日 */
  date: string;
  /** 書き手の ID（content/people/ に存在することを検証済み） */
  author: string;
  summary: string;
  tags: string[];
  topics: TopicKey[];
  /** basePath 付与済み */
  thumbnail?: string;
  instagram: string[];
  /** 記録自身が draft、または書き手が draft */
  isDraft: boolean;
  bodyHtml: string;
  filePath: string;
}

/** クライアントに渡す用（本文なし） */
export type RecordSummary = Omit<MakingRecord, 'bodyHtml'>;

export interface ContentData {
  /** order → id 順 */
  people: Person[];
  /** 日付昇順 */
  records: MakingRecord[];
}
