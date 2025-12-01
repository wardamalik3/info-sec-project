import { openDB } from 'idb';

const DB_NAME = 'SecureMsgDB';
const STORE_NAME = 'keyStore';

const initDB = async () => {
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        },
    });
};

export const storeKey = async (keyName, key) => {
    const db = await initDB();
    await db.put(STORE_NAME, key, keyName);
};

export const getKey = async (keyName) => {
    const db = await initDB();
    return await db.get(STORE_NAME, keyName);
};

export const clearKeys = async () => {
    const db = await initDB();
    await db.clear(STORE_NAME);
};
