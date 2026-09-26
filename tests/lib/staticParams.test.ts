import { describe, expect, it } from 'vitest';
import { EMPTY_PLACEHOLDER_SLUG, slugParamsOrPlaceholder } from '@/lib/staticParams';

describe('slugParamsOrPlaceholder', () => {
  it('slug があればそのまま params にする', () => {
    expect(slugParamsOrPlaceholder(['a', 'b'])).toEqual([{ slug: 'a' }, { slug: 'b' }]);
  });

  it('0 件ならダミーを1件返す（output: export でビルドを落とさない）', () => {
    expect(slugParamsOrPlaceholder([])).toEqual([{ slug: EMPTY_PLACEHOLDER_SLUG }]);
  });

  it('ダミーの slug は記録・物語の slug 規則（英小文字・数字・ハイフン）に当たらない', () => {
    expect(/^[a-z0-9-]+$/.test(EMPTY_PLACEHOLDER_SLUG)).toBe(false);
  });
});
