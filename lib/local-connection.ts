const STORAGE_KEY = 'jeverative.openrouter.connection';
type Connection = { key: string; source: 'server' | 'manual' };
export function readLocalConnection(
  storage: Pick<Storage, 'getItem'>,
): Connection | null {
  try {
    const saved = JSON.parse(storage.getItem(STORAGE_KEY) ?? 'null');
    if (
      !saved ||
      typeof saved.key !== 'string' ||
      !saved.key.trim() ||
      saved.key.length > 512 ||
      /[\r\n]/.test(saved.key)
    )
      return null;
    return {
      key: saved.key,
      source: saved.source === 'server' ? 'server' : 'manual',
    };
  } catch {
    return null;
  }
}
export function writeLocalConnection(
  storage: Pick<Storage, 'setItem' | 'removeItem'>,
  saved: Connection | null,
) {
  if (saved) storage.setItem(STORAGE_KEY, JSON.stringify(saved));
  else storage.removeItem(STORAGE_KEY);
}
