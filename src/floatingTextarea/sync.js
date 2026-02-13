
import request from "../request.js";

const AUTO_SAVE_DURATION = 1000; // 1秒

/**
 * 初始化服务器同步功能
 * @param {HTMLTextAreaElement} textarea 
 * @param {Function} renderTimelineProxy 
 * @returns {Object} { performUpload, saveContent }
 */
export const initSync = (textarea, renderTimelineProxy) => {
    let saveTimer;

    const performUpload = async (content) => {
        const statusEl = document.getElementById('floating-status');
        if (statusEl) statusEl.textContent = '保存中...';

        try {
            await request.setPromt(content);
            if (statusEl) {
                const now = new Date();
                /* eslint-disable no-magic-numbers */
                const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
                /* eslint-enable no-magic-numbers */
                statusEl.textContent = `已保存 ${timeStr}`;
                statusEl.style.color = '#4CAF50';
                if (typeof renderTimelineProxy === 'function') renderTimelineProxy();
            }
        } catch (error) {
            console.error(error);
            if (statusEl) {
                statusEl.textContent = '保存失败';
                statusEl.style.color = 'red';
            }
        }
    };

    const saveContent = () => {
        if (saveTimer !== undefined) {
            clearTimeout(saveTimer);
        }

        const statusEl = document.getElementById('floating-status');
        if (statusEl) statusEl.textContent = '保存中...';

        saveTimer = setTimeout(() => {
            performUpload(textarea.value);
        }, AUTO_SAVE_DURATION);
    };

    return {performUpload, saveContent};
};
