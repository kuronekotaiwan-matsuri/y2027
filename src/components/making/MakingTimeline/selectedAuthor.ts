/**
 * /making/ の「顔で絞る」の選択状態。
 * 選択中の書き手 ID は URL のクエリ ?by=<id> に持ち、共有できるようにする（仕様書 5.3）。
 * window を使うので、フックと setter は client component からだけ呼ぶ
 * （MakingTimeline と LatestRecordLink で共有する）。純粋関数はテストからも使う。
 */
import { useSyncExternalStore } from 'react';

/** 「すべて」を表す選択値 */
export const FACES_ALL = 'all';

const QUERY_KEY = 'by';
const CHANGE_EVENT = 'making:by-change';

function subscribe(callback: () => void): () => void {
  window.addEventListener('popstate', callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener('popstate', callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function readSelectedFromUrl(): string {
  return new URLSearchParams(window.location.search).get(QUERY_KEY) ?? FACES_ALL;
}

function readSelectedOnServer(): string {
  return FACES_ALL;
}

/** URL にある選択値（未解決。登録に無い ID もそのまま返す）。resolveSelectedAuthor で書き手に解決する */
export function useSelectedAuthorRaw(): string {
  return useSyncExternalStore(subscribe, readSelectedFromUrl, readSelectedOnServer);
}

/** 選択を URL に書き、購読している部品に知らせる */
export function setSelectedAuthor(id: string): void {
  const url = new URL(window.location.href);
  if (id === FACES_ALL) {
    url.searchParams.delete(QUERY_KEY);
  } else {
    url.searchParams.set(QUERY_KEY, id);
  }
  window.history.replaceState(window.history.state, '', url.toString());
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** URL の値を登録済みの書き手 ID に解決する。登録に無い ID は「すべて」に倒す */
export function resolveSelectedAuthor(registeredIds: readonly string[], raw: string): string {
  return registeredIds.includes(raw) ? raw : FACES_ALL;
}

/** 記録がいまの選択に含まれるか（「すべて」なら常に true） */
export function matchesSelectedAuthor(author: string, selected: string): boolean {
  return selected === FACES_ALL || author === selected;
}
