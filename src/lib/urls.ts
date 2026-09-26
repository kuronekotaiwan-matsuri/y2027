import { site } from '@/config/site';

/** http(s):// や // で始まる外部 URL か */
export function isAbsoluteUrl(value: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(value) || value.startsWith('//');
}

/**
 * サイト内の絶対パス（/images/... など）に basePath を付ける。
 * 外部 URL、相対パス、すでに basePath が付いているものはそのまま返す。
 */
export function withBasePath(value: string, basePath: string = site.basePath): string {
  if (!basePath || isAbsoluteUrl(value) || !value.startsWith('/')) return value;
  if (value === basePath || value.startsWith(`${basePath}/`)) return value;
  return `${basePath}${value}`;
}

/** サイト内のパスを公開 URL（https://...）にする。外部 URL はそのまま */
export function absoluteUrl(value: string): string {
  if (isAbsoluteUrl(value)) return value;
  const origin = new URL(site.url).origin;
  return new URL(withBasePath(value), origin).toString();
}
