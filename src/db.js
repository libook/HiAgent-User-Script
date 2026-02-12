/* eslint-disable sort-keys */
import metadata from "./metadata.js";

export default {
    "dbName": 'HiAgentPromptEditorDB',
    "maxRecords": 30, // Per application limits
    "storeName": 'snapshots',

    async getDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1); // Keep version 1
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { "keyPath": 'id', "autoIncrement": true });
                    store.createIndex('timestamp', 'timestamp', { "unique": false });
                }
            };
            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => reject(event.target.error);
        });
    },

    async getLastRecord() {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const index = store.index('timestamp');
            const request = index.openCursor(null, 'prev'); // Latest first

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    if (cursor.value.application === metadata.application) {
                        resolve(cursor.value);
                    } else {
                        cursor.continue(); // Filter manually
                    }
                } else {
                    resolve(null);
                }
            };
            request.onerror = (event) => reject(event.target.error);
        });
    },

    async getAllRecords() {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const index = store.index('timestamp');
            const request = index.openCursor(null, 'prev'); // Latest first

            const records = [];
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    if (cursor.value.application === metadata.application) {
                        records.push(cursor.value);
                    }
                    cursor.continue();
                } else {
                    resolve(records);
                }
            };
            request.onerror = (event) => reject(event.target.error);
        });
    },

    async addRecord(content) {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.add({
                "application": metadata.application, // Isolate by application
                "content": content,
                "timestamp": new Date().getTime(),
            });

            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event.target.error);
        });
    },

    async pruneRecords() {
        const db = await this.getDB();
        const records = await this.getAllRecords(); // Already filtered for current app

        if (records.length > this.maxRecords) {
            const transaction = db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);

            // Oldest records are at the end of the filtered list
            const toDelete = records.slice(this.maxRecords);
            toDelete.forEach(record => {
                store.delete(record.id);
            });
        }
    },

    async saveIfChanged(content) {
        try {
            const lastRecord = await this.getLastRecord();
            if (lastRecord && lastRecord.content === content) {
                console.log('Content unchanged, skipping save.');
                return;
            }

            await this.addRecord(content);
            console.log('Saved new snapshot to IndexedDB.');

            await this.pruneRecords();
        } catch (error) {
            console.error('IndexedDB Save Error:', error);
        }
    },
};
