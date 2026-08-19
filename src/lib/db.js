// ============================== PERSISTÊNCIA (IndexedDB) ==============================
// Substitui a API de storage do ambiente Claude (window.storage) por IndexedDB real,
// que funciona em qualquer navegador/PWA instalada, offline, sem depender de conta.
// Tudo fica só no dispositivo — nenhum dado sai daqui.
import { openDB } from "idb";

const DB_NAME = "treino-app";
const DB_VERSION = 1;
const KV_STORE = "kv";
const PHOTO_STORE = "photos";

let dbPromiseCache = null;
function getDB() {
  if (!dbPromiseCache) {
    dbPromiseCache = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(KV_STORE)) db.createObjectStore(KV_STORE);
        if (!db.objectStoreNames.contains(PHOTO_STORE)) db.createObjectStore(PHOTO_STORE);
      },
    });
  }
  return dbPromiseCache;
}

export async function storeGet(key, fallback) {
  try {
    const db = await getDB();
    const value = await db.get(KV_STORE, key);
    return value === undefined ? fallback : value;
  } catch (e) {
    return fallback;
  }
}

export async function storeSet(key, value) {
  try {
    const db = await getDB();
    await db.put(KV_STORE, value, key);
    return true;
  } catch (e) {
    return false;
  }
}

// Fotos ficam guardadas como Blob num object store separado, e são
// devolvidas como object URL (revogável) pra exibição em <img>.
export async function photoSet(id, blob) {
  try {
    const db = await getDB();
    await db.put(PHOTO_STORE, blob, id);
    return true;
  } catch (e) {
    return false;
  }
}

export async function photoGetURL(id) {
  try {
    const db = await getDB();
    const blob = await db.get(PHOTO_STORE, id);
    if (!blob) return null;
    return URL.createObjectURL(blob);
  } catch (e) {
    return null;
  }
}

export async function photoDelete(id) {
  try {
    const db = await getDB();
    await db.delete(PHOTO_STORE, id);
    return true;
  } catch (e) {
    return false;
  }
}
