/**
 * サイト全体の設定。
 *
 * - phase（トップの主役の切り替え）
 * - 開催情報（未定の項目も「未定」という値を持つ。表示側で判断しない）
 * - 準備中ページの状況文
 * - role / topics の語彙（検証と表示の両方がここを参照する）
 *
 * 文面や状態の更新はこのファイルだけを書き換える（docs/specification.md 8.3）。
 */

export type Phase = 'making' | 'event' | 'archive';

export type RoleKey =
  | 'committee'
  | 'youth'
  | 'shop'
  | 'performer'
  | 'volunteer'
  | 'local'
  | 'taiwan'
  | 'other';

export type TopicKey =
  | 'event'
  | 'shops'
  | 'programs'
  | 'venue'
  | 'access'
  | 'volunteer'
  | 'poster';

export interface RoleDefinition {
  key: RoleKey;
  label: string;
}

export interface TopicDefinition {
  key: TopicKey;
  label: string;
  /** 対応する主コンテンツのパス。ページがまだ無いときは省略 */
  path?: string;
}

export type TagStatus = 'consider' | 'trial' | 'decided' | 'rejected' | 'recruit' | 'info';

export interface TagDefinition {
  label: string;
  status: TagStatus;
}

export type EventInfoKey = 'date' | 'time' | 'venue' | 'fee';

export interface EventInfoItem {
  key: EventInfoKey;
  label: string;
  /** 表示する値。未定のときも「未定」という文字列を持たせる（表示側で判断しない） */
  value: string;
  /** 確定しているか */
  decided: boolean;
}

/**
 * タイムライン最下部のゴールマーカー。語の途中で折り返さないよう、日付・名前・状態を分けて持つ。
 * 設定の goal は3つとも書く。開催後（archive）は heldLabel を title に入れた形になる（lib/phase.ts）
 */
export interface GoalMarker {
  /** 例: 2027.05 */
  date?: string;
  /** 例: 黒猫台湾まつり2027 */
  title: string;
  /** 例: 開催（予定） */
  status?: string;
  note?: string;
}

export interface EventConfig {
  year: number;
  /** 第◯回 */
  edition: number;
  /** 準備中の表示文（例: 2027年5月 開催予定） */
  scheduleLabel: string;
  /** 準備中の補足（例: 日程・会場未定） */
  scheduleNote: string;
  /** 開催後の表示文（archive で使う）。未開催なら省略 */
  heldLabel?: string;
  /** タイムライン最下部のゴールマーカー */
  goal: GoalMarker;
  items: EventInfoItem[];
}

export interface PreparingStatus {
  title: string;
  /** いまの状況（短い文） */
  text: string;
  /** 状況文の更新日（YYYY-MM-DD） */
  updated: string;
  /** 決まったらここに載る項目 */
  plannedItems: string[];
  /** 参考: 2026年のページ */
  referenceUrl?: string;
  referenceLabel?: string;
}

export interface NavItem {
  label: string;
  href: string;
  /** 準備中の印を付ける */
  preparing?: boolean;
}

export interface GuideMenuItem {
  key: TopicKey;
  title: string;
  href: string;
  status: 'preparing' | 'published';
  description: string;
}

export interface PastSite {
  year: number;
  url: string;
}

export interface SiteConfig {
  name: string;
  url: string;
  basePath: string;
  description: string;
  catchphrase: string;
  organizer: string;
  instagram: string;
  email: string;
  /** OGP の共通画像（/images/... の形。basePath は付けない） */
  ogImage: string;
  /** Google Analytics 測定ID。未確認のあいだは undefined（読み込まない） */
  gaMeasurementId?: string;
  phase: Phase;
  event: EventConfig;
  preparing: {
    shops: PreparingStatus;
    programs: PreparingStatus;
  };
  nav: NavItem[];
  guideMenu: GuideMenuItem[];
  roles: RoleDefinition[];
  topics: TopicDefinition[];
  tags: TagDefinition[];
  pastSites: PastSite[];
}

export const site: SiteConfig = {
  name: '黒猫台湾まつり2027',
  url: 'https://kuronekotaiwan-matsuri.github.io/y2027/',
  basePath: '/y2027',
  description:
    '2027年5月開催予定の黒猫台湾まつり2027 公式サイト。川崎・二子新地の大山街道沿いで開かれてきた台湾カルチャーフェスティバルの案内と、祭りができるまでの記録。',
  catchphrase: '黒猫台湾まつりは、5月に始まるのではない。',
  organizer: '黒猫台湾まつり実行委員会',
  instagram: 'https://www.instagram.com/kuronekotw_fes/',
  email: 'kuronekotaiwan.matsuri@gmail.com',
  ogImage: '/images/og.png',
  gaMeasurementId: undefined,

  phase: 'making',

  event: {
    year: 2027,
    edition: 5,
    scheduleLabel: '2027年5月 開催予定',
    scheduleNote: '日程・会場未定',
    heldLabel: undefined,
    goal: {
      date: '2027.05',
      title: '黒猫台湾まつり2027',
      status: '開催（予定）',
      note: '日程が決まったら、ここに日付が入ります。',
    },
    items: [
      { key: 'date', label: '日程', value: '未定', decided: false },
      { key: 'time', label: '時間', value: '未定', decided: false },
      { key: 'venue', label: '会場', value: '未定', decided: false },
      { key: 'fee', label: '入場料', value: '未定', decided: false },
    ],
  },

  preparing: {
    shops: {
      title: '出店情報',
      text: '出店者はまだ決まっていません。2027年1月ごろに募集を始める予定です。',
      updated: '2026-10-01',
      plannedItems: [
        '出店者名',
        'カテゴリ（フード・雑貨・ワークショップなど）',
        '出店日',
        '紹介文',
        'SNS・Webサイト',
      ],
      referenceUrl: 'https://kuronekotaiwan-matsuri.github.io/y2026/shops',
      referenceLabel: '2026年の出店情報',
    },
    programs: {
      title: 'プログラム',
      text: 'ステージやワークショップの内容はまだ決まっていません。2027年2月ごろから順に決めていく予定です。',
      updated: '2026-10-01',
      plannedItems: [
        '出演者・講師',
        'ステージ／ワークショップ／トークの区分',
        '開催日と時間',
        '内容の紹介',
        '参加方法（申込の要否）',
      ],
      referenceUrl: 'https://kuronekotaiwan-matsuri.github.io/y2026/timetable',
      referenceLabel: '2026年のタイムテーブル',
    },
  },

  // ナビの順序は phase によらず固定（仕様書 6.1）
  nav: [
    { label: '出店情報', href: '/shops/', preparing: true },
    { label: 'プログラム', href: '/programs/', preparing: true },
    { label: '黒猫台湾まつりとは', href: '/about/' },
    { label: 'できるまで', href: '/making/' },
  ],

  // 存在するページだけをカードにする（仕様書 5.1）
  guideMenu: [
    {
      key: 'shops',
      title: '出店情報',
      href: '/shops/',
      status: 'preparing',
      description: '出店者の一覧。カテゴリ、出店日、紹介、SNS。',
    },
    {
      key: 'programs',
      title: 'プログラム',
      href: '/programs/',
      status: 'preparing',
      description: '出演者、ワークショップ、ステージ、トーク。',
    },
  ],

  roles: [
    { key: 'committee', label: '実行委員' },
    { key: 'youth', label: '若者チーム' },
    { key: 'shop', label: '出店者' },
    { key: 'performer', label: '出演者' },
    { key: 'volunteer', label: 'ボランティア' },
    { key: 'local', label: '地域の人・お店' },
    { key: 'taiwan', label: '台湾関係者' },
    { key: 'other', label: 'その他' },
  ],

  topics: [
    { key: 'event', label: '開催情報' },
    { key: 'shops', label: '出店情報', path: '/shops/' },
    { key: 'programs', label: 'プログラム', path: '/programs/' },
    { key: 'venue', label: '会場マップ' },
    { key: 'access', label: 'アクセス' },
    { key: 'volunteer', label: 'ボランティア募集' },
    { key: 'poster', label: 'ポスター・チラシ' },
  ],

  // 推奨タグ（仕様書 3.3）。自由記述も許すが、ここにあるものは状態に応じた見た目になる
  tags: [
    { label: '検討中', status: 'consider' },
    { label: '試作中', status: 'trial' },
    { label: '決定', status: 'decided' },
    { label: 'ボツ', status: 'rejected' },
    { label: '募集中', status: 'recruit' },
    { label: '開催情報', status: 'info' },
  ],

  pastSites: [
    { year: 2025, url: 'https://kuronekotaiwan-matsuri.github.io/y2025/' },
    { year: 2026, url: 'https://kuronekotaiwan-matsuri.github.io/y2026/' },
  ],
};

/** role の語彙（検証用） */
export const roleKeys: RoleKey[] = site.roles.map((r) => r.key);

/** topics の語彙（検証用） */
export const topicKeys: TopicKey[] = site.topics.map((t) => t.key);

export function getRoleLabel(role: RoleKey): string {
  return site.roles.find((r) => r.key === role)?.label ?? role;
}

export function getTopic(key: TopicKey): TopicDefinition | undefined {
  return site.topics.find((t) => t.key === key);
}

/** タグの表示状態。推奨語彙にないタグは undefined */
export function getTagStatus(label: string): TagStatus | undefined {
  return site.tags.find((t) => t.label === label)?.status;
}
