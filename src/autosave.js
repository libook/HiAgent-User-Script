import dbAdapter from './db.js';
import event from './floatingTextarea/event.js';

const AUTO_SAVE_DB_DURATION = 60 * 1000; // eslint-disable-line no-magic-numbers
let autoSaveIntervalId;

export default {
    "cleanup": () => {
        if (autoSaveIntervalId) clearInterval(autoSaveIntervalId);
    },
    "start": function (text) {
        this.cleanup();
        autoSaveIntervalId = setInterval(async () => {
            await dbAdapter.saveIfChanged(text);
            event.renderTimeline();
        }, AUTO_SAVE_DB_DURATION);
    },
};
