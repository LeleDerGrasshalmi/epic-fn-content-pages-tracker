import recursiveJsonSort from './recursive-json-sort.js';

import type { ContentPagesData } from '../types/content-pages.js';

/**
 * @param deployment the deployment of the website (ex. prod07)
 * @param key the main key or key/sub-key
 */
export default async (deployment: string, key: string) => {
  const res = await fetch(
    `https://fortnitecontent-website-${deployment}.ol.epicgames.com/content/api/pages/${key}?lang=en`,
  );

  if (!res.ok) {
    console.log(`[${deployment}] ${key} failed fetching content page`, res.status, res.statusText, await res.text());

    return {
      success: false as const,
      status: res.status,
    };
  }

  const data = <ContentPagesData>(await res.json());

  return {
    success: true as const,
    status: res.status,
    data: recursiveJsonSort(data),
  };
};
