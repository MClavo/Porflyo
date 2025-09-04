export type SocialsLike = Record<string, string> | string[] | undefined | null;

export const normalizeSocials = (s: SocialsLike): Record<string, string> => {
  if (!s) return {};
  if (Array.isArray(s)) {
    const obj: Record<string, string> = {};
    s.forEach((v, i) => {
      if (v !== undefined && v !== null && String(v).trim() !== '') {
        obj[String(i)] = String(v);
      }
    });
    return obj;
  }

  return Object.entries(s as Record<string, unknown> || {}).reduce((acc: Record<string, string>, [k, v]) => {
    if (v !== undefined && v !== null && String(v).trim() !== '') {
      acc[k] = String(v);
    }
    return acc;
  }, {});
};

export const ensureHttps = (url: string): string => {
  if (!url) return url;
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return `https://${trimmed}`;
};

export const getImageUrlWithTimestamp = (imageUrl: string | null | undefined, ts: number) => {
  if (!imageUrl) return '/default-avatar.png';
  if (imageUrl === '/default-avatar.png') return imageUrl;
  return `${imageUrl}?t=${ts}`;
};
