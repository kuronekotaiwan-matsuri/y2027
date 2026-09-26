import type { MetadataRoute } from 'next';
import { getContent, getLastUpdated } from '@/lib/content';
import { absoluteUrl } from '@/lib/urls';

/** 静的エクスポート用（sitemap.xml をビルド時に生成する） */
export const dynamic = 'force-static';

const STATIC_PATHS = ['/', '/shops/', '/programs/', '/about/', '/making/'];

export default function sitemap(): MetadataRoute.Sitemap {
  const { stories, records } = getContent();
  const lastUpdated = getLastUpdated();

  const pages: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: absoluteUrl(path),
    ...(lastUpdated ? { lastModified: lastUpdated } : {}),
  }));

  const storyPages: MetadataRoute.Sitemap = stories.map((story) => {
    const latest = records.filter((r) => r.storySlug === story.slug).map((r) => r.date).sort();
    return {
      url: absoluteUrl(`/making/stories/${story.slug}/`),
      lastModified: latest[latest.length - 1] ?? story.startDate,
    };
  });

  const recordPages: MetadataRoute.Sitemap = records.map((record) => ({
    url: absoluteUrl(`/making/records/${record.slug}/`),
    lastModified: record.date,
  }));

  return [...pages, ...storyPages, ...recordPages];
}
