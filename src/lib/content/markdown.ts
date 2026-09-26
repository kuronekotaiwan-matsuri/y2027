import type { Element, ElementContent, Root } from 'hast';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import type { Plugin } from 'unified';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import { site } from '@/config/site';
import { withBasePath } from '@/lib/urls';

export interface BasePathOptions {
  basePath: string;
  /** `/` で始まるサイト内パスを見つけたときに呼ぶ（画像の存在確認用） */
  onLocalPath?: (path: string, tagName: string) => void;
}

/** basePath を付ける属性 */
const URL_ATTRIBUTES: Record<string, string[]> = {
  img: ['src'],
  a: ['href'],
  source: ['src'],
  video: ['src', 'poster'],
};

/** `/images/...` のようなサイト内絶対パスに basePath を付ける rehype プラグイン */
export const rehypeBasePath: Plugin<[BasePathOptions], Root> = (options) => {
  return (tree) => {
    visit(tree, 'element', (node: Element) => {
      const attributes = URL_ATTRIBUTES[node.tagName];
      if (!attributes) return;
      for (const attribute of attributes) {
        const value = node.properties[attribute];
        if (typeof value !== 'string') continue;
        if (value.startsWith('/') && !value.startsWith('//')) {
          options.onLocalPath?.(value, node.tagName);
          node.properties[attribute] = withBasePath(value, options.basePath);
        }
      }
    });
  };
};

function isBlankText(node: ElementContent): boolean {
  return node.type === 'text' && node.value.trim() === '';
}

/**
 * 画像の扱い（仕様書 5.4、9.7）:
 * - すべての img に loading="lazy" を付ける
 * - 段落が画像1枚だけのときは figure（.figure > .figure__frame > img）にし、
 *   `![alt](src "キャプション")` の title を figcaption にする
 */
export const rehypeImages: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'element', (node: Element, index, parent) => {
      if (node.tagName === 'img') {
        node.properties.loading = 'lazy';
        node.properties.decoding = 'async';
        return;
      }
      if (node.tagName !== 'p' || !parent || index === undefined) return;

      const meaningful = node.children.filter((child) => !isBlankText(child));
      if (meaningful.length !== 1) return;
      const [only] = meaningful;
      if (only.type !== 'element' || only.tagName !== 'img') return;

      const caption = typeof only.properties.title === 'string' ? only.properties.title : undefined;
      delete only.properties.title;

      const children: ElementContent[] = [
        {
          type: 'element',
          tagName: 'div',
          properties: { className: ['figure__frame'] },
          children: [only],
        },
      ];
      if (caption) {
        children.push({
          type: 'element',
          tagName: 'figcaption',
          properties: {},
          children: [{ type: 'text', value: caption }],
        });
      }
      const figure: Element = {
        type: 'element',
        tagName: 'figure',
        properties: { className: ['figure'] },
        children,
      };
      parent.children[index] = figure;
    });
  };
};

export interface MarkdownOptions {
  basePath?: string;
  /** 本文中のサイト内画像パス（basePath 付与前）を受け取る */
  onLocalImage?: (path: string) => void;
}

/** Markdown を HTML に変換する。GFM 対応。生の HTML は通さない */
export function markdownToHtml(markdown: string, options: MarkdownOptions = {}): string {
  const basePath = options.basePath ?? site.basePath;
  const file = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeBasePath, {
      basePath,
      onLocalPath: (path, tagName) => {
        if (tagName === 'img') options.onLocalImage?.(path);
      },
    })
    .use(rehypeImages)
    .use(rehypeStringify)
    .processSync(markdown);
  return String(file);
}
