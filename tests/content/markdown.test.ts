import { describe, expect, it } from 'vitest';
import { markdownToHtml } from '@/lib/content/markdown';
import { absoluteUrl, isAbsoluteUrl, withBasePath } from '@/lib/urls';

describe('withBasePath', () => {
  it('/ で始まるサイト内パスに basePath を付ける', () => {
    expect(withBasePath('/images/a.jpg', '/y2027')).toBe('/y2027/images/a.jpg');
    expect(withBasePath('/making/', '/y2027')).toBe('/y2027/making/');
  });

  it('外部 URL、相対パス、付与済みはそのまま', () => {
    expect(withBasePath('https://example.com/a.jpg', '/y2027')).toBe('https://example.com/a.jpg');
    expect(withBasePath('//cdn.example.com/a.jpg', '/y2027')).toBe('//cdn.example.com/a.jpg');
    expect(withBasePath('images/a.jpg', '/y2027')).toBe('images/a.jpg');
    expect(withBasePath('/y2027/images/a.jpg', '/y2027')).toBe('/y2027/images/a.jpg');
    expect(withBasePath('mailto:a@example.com', '/y2027')).toBe('mailto:a@example.com');
  });

  it('basePath が空ならそのまま', () => {
    expect(withBasePath('/images/a.jpg', '')).toBe('/images/a.jpg');
  });

  it('既定の basePath は site.ts の値', () => {
    expect(withBasePath('/images/a.jpg')).toBe('/y2027/images/a.jpg');
  });

  it('isAbsoluteUrl', () => {
    expect(isAbsoluteUrl('https://a')).toBe(true);
    expect(isAbsoluteUrl('//a')).toBe(true);
    expect(isAbsoluteUrl('/a')).toBe(false);
  });
});

describe('absoluteUrl', () => {
  it('サイト内パスを公開 URL にする（basePath を二重に付けない）', () => {
    expect(absoluteUrl('/shops/')).toBe('https://kuronekotaiwan-matsuri.github.io/y2027/shops/');
    expect(absoluteUrl('/y2027/images/og.png')).toBe(
      'https://kuronekotaiwan-matsuri.github.io/y2027/images/og.png',
    );
    expect(absoluteUrl('/')).toBe('https://kuronekotaiwan-matsuri.github.io/y2027/');
  });

  it('外部 URL はそのまま', () => {
    expect(absoluteUrl('https://example.com/x')).toBe('https://example.com/x');
  });
});

describe('markdownToHtml', () => {
  it('画像の src に basePath を付け、lazy にする', () => {
    const html = markdownToHtml('text ![写真](/images/stories/m/r/01.jpg) text', {
      basePath: '/y2027',
    });
    expect(html).toContain('src="/y2027/images/stories/m/r/01.jpg"');
    expect(html).toContain('alt="写真"');
    expect(html).toContain('loading="lazy"');
  });

  it('リンクの href に basePath を付ける。外部リンクはそのまま', () => {
    const html = markdownToHtml('[内部](/making/) [外部](https://example.com/)', {
      basePath: '/y2027',
    });
    expect(html).toContain('href="/y2027/making/"');
    expect(html).toContain('href="https://example.com/"');
  });

  it('段落が画像1枚だけなら figure にし、title をキャプションにする', () => {
    const html = markdownToHtml('![alt](/images/a.jpg "キャプション")', { basePath: '/y2027' });
    expect(html).toContain('<figure class="figure">');
    expect(html).toContain('<div class="figure__frame">');
    expect(html).toContain('<figcaption>キャプション</figcaption>');
    expect(html).not.toContain('title=');
    expect(html).not.toContain('<p>');
  });

  it('title が無ければ figcaption を出さない', () => {
    const html = markdownToHtml('![alt](/images/a.jpg)', { basePath: '/y2027' });
    expect(html).toContain('<figure class="figure">');
    expect(html).not.toContain('<figcaption>');
  });

  it('本文中のサイト内画像パスを onLocalImage に渡す（basePath 付与前）', () => {
    const seen: string[] = [];
    markdownToHtml('![a](/images/a.jpg) ![b](https://example.com/b.jpg) [c](/making/)', {
      basePath: '/y2027',
      onLocalImage: (path) => seen.push(path),
    });
    expect(seen).toEqual(['/images/a.jpg']);
  });

  it('GFM（表・取り消し線）を描画する', () => {
    const html = markdownToHtml('| a | b |\n|---|---|\n| 1 | 2 |\n\n~~ボツ~~', {
      basePath: '/y2027',
    });
    expect(html).toContain('<table>');
    expect(html).toContain('<del>ボツ</del>');
  });

  it('生の HTML は通さない', () => {
    const html = markdownToHtml('<script>alert(1)</script>\n\n段落', { basePath: '/y2027' });
    expect(html).not.toContain('<script>');
    expect(html).toContain('<p>段落</p>');
  });
});
