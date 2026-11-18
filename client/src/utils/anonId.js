export function getAnonId() {
  const STORAGE_KEY = 'mindcheck_anon_id';
  let anonId = localStorage.getItem(STORAGE_KEY);

  if (!anonId) {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      anonId = 'anon_' + crypto.randomUUID();
    } else {
      anonId = 'anon_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
    localStorage.setItem(STORAGE_KEY, anonId);
  }

  return anonId;
}
