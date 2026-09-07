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

function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function dataURLToBlob(dataURL) {
  const res = await fetch(dataURL);
  return res.blob();
}

// Empacota tudo (plano customizado, sessões, medidas, perfil, fotos — inclusive
// o avatar) num único objeto serializável, pra exportar como arquivo de backup.
// "draft" (treino em andamento) fica de fora de propósito: não faz sentido
// restaurar um treino no meio de outro aparelho/momento.
export async function exportAllData() {
  const db = await getDB();
  const kvKeys = await db.getAllKeys(KV_STORE);
  const kv = {};
  for (const key of kvKeys) {
    if (key === "draft") continue;
    kv[key] = await db.get(KV_STORE, key);
  }
  const photoKeys = await db.getAllKeys(PHOTO_STORE);
  const photos = {};
  for (const key of photoKeys) {
    const blob = await db.get(PHOTO_STORE, key);
    photos[key] = await blobToDataURL(blob);
  }
  return { app: "99drews-training-backup", version: 1, exportedAt: new Date().toISOString(), kv, photos };
}

// Restaura um backup gerado por exportAllData — substitui os dados atuais
// pelos do arquivo (mesma chave = sobrescreve). Decodifica todos os blobs de
// foto ANTES de abrir a transação: um `await` "de verdade" (fetch) no meio de
// uma transação IndexedDB ativa faz ela fechar sozinha antes da hora.
export async function importAllData(data) {
  if (!data || typeof data !== "object" || !data.kv) throw new Error("Arquivo de backup inválido.");
  const photoEntries = await Promise.all(
    Object.entries(data.photos || {}).map(async ([key, dataURL]) => [key, await dataURLToBlob(dataURL)])
  );

  const db = await getDB();
  const kvTx = db.transaction(KV_STORE, "readwrite");
  for (const [key, value] of Object.entries(data.kv)) kvTx.store.put(value, key);
  await kvTx.done;

  const photoTx = db.transaction(PHOTO_STORE, "readwrite");
  for (const [key, blob] of photoEntries) photoTx.store.put(blob, key);
  await photoTx.done;
}
