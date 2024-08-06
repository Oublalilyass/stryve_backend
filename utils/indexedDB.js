//Data Management
import { openDB } from 'idb';

const dbPromise = openDB('textContentDB', 1, {
  upgrade(db) {
    db.createObjectStore('texts', { keyPath: 'id', autoIncrement: true });
  },
});

export const addText = async (text) => {
  const db = await dbPromise;
  await db.add('texts', { content: text, timestamp: new Date() });
};

export const getAllTexts = async () => {
  const db = await dbPromise;
  return db.getAll('texts');
};

export const getTextsBySession = async (sessionType) => {
  const db = await dbPromise;
  const texts = await db.getAll('texts');
  return texts.filter(text => text.sessionType === sessionType);
};
