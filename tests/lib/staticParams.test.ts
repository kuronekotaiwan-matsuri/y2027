import { describe, expect, it } from 'vitest';
import {
  EMPTY_PLACEHOLDER_SLUG,
  idParamsOrPlaceholder,
  paramsOrPlaceholder,
  slugParamsOrPlaceholder,
} from '@/lib/staticParams';

describe('slugParamsOrPlaceholder / idParamsOrPlaceholder', () => {
  it('値があればそのまま params にする', () => {
    expect(slugParamsOrPlaceholder(['a', 'b'])).toEqual([{ slug: 'a' }, { slug: 'b' }]);
    expect(idParamsOrPlaceholder(['ikeda', 'committee'])).toEqual([
      { id: 'ikeda' },
      { id: 'committee' },
    ]);
  });

  it('0 件ならダミーを1件返す（output: export でビルドを落とさない）', () => {
    expect(slugParamsOrPlaceholder([])).toEqual([{ slug: EMPTY_PLACEHOLDER_SLUG }]);
    expect(idParamsOrPlaceholder([])).toEqual([{ id: EMPTY_PLACEHOLDER_SLUG }]);
    expect(paramsOrPlaceholder('key', [])).toEqual([{ key: EMPTY_PLACEHOLDER_SLUG }]);
  });

  it('ダミーの値は記録 slug・書き手 ID の規則（英小文字・数字・ハイフン）に当たらない', () => {
    expect(/^[a-z0-9-]+$/.test(EMPTY_PLACEHOLDER_SLUG)).toBe(false);
  });
});
