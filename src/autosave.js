import dbAdapter from './db.js';

const AUTO_SAVE_DB_DURATION = 60 * 1000; // 1分钟
let autoSaveIntervalId;

export default {
    "start": function (text) {
        this.cleanup();
        autoSaveIntervalId = setInterval(async () => {
            await dbAdapter.saveIfChanged(text);
            renderTimeline();
        }, AUTO_SAVE_DB_DURATION);
    },
    "cleanup": () => {
        if (autoSaveIntervalId) clearInterval(autoSaveIntervalId);
    },
};
