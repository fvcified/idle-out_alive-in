export const validateHost = (host: string): string | null => {
  const trimmed = host.trim();
  if (!trimmed) return null;

  const pattern = trimmed.replace(/^\*\./, '');
  try {
    new URL('https://' + pattern);
    return null;
  } catch {
    return `Invalid hostname: "${host}"`;
  }
};

export const getHostname = (url: string | undefined): string | null => {
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
};

export const matchesHost = (hosts: string[] | undefined, hostname: string): boolean => {
  if (!hosts || hosts.length === 0) return false;
  for (const h of hosts) {
    const pattern = h.trim();
    if (!pattern) continue;
    if (pattern === hostname) return true;
    if (pattern.startsWith('*.')) {
      const base = pattern.slice(2);
      if (hostname === base || hostname.endsWith('.' + base)) return true;
    }
  }
  return false;
};