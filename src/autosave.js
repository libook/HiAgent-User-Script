import dbAdapter from './db.js';

const AUTO_SAVE_DB_DURATION = 60 * 1000; // eslint-disable-line no-magic-numbers
let autoSaveIntervalId;

export default {
    "cleanup": () => {
        if (autoSaveIntervalId) clearInterval(autoSaveIntervalId);
    },
    "start": function (textarea, callback) {
        this.cleanup();
        autoSaveIntervalId = setInterval(async () => {
            await dbAdapter.saveIfChanged(textarea.value);
            callback();
        }, AUTO_SAVE_DB_DURATION);
    },
};
