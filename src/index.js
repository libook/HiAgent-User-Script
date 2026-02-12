import floatingTextarea from './floatingTextarea/index.js';
import triggerButton from './triggerButton.js';
import autosave from './autosave.js';
import request from './request.js';
import loadFromCdn from './loadFromCdn.js';

(async () => {
    'use strict';

    loadFromCdn.loadCss('https://unpkg.com/vditor@3.11.2/dist/index.css');
    await loadFromCdn.loadJs('https://unpkg.com/vditor@3.11.2/dist/index.min.js');

    const cleanup = () => {
        autosave.cleanup();
        floatingTextarea.cleanup();
        triggerButton.cleanup();
    };

    const checkUrlMatch = () => {
        // @match https://hia.volcenginepaas.com/product/llm/personal/personal-*/application/*/arrange*
        const pattern = /https:\/\/hia\.volcenginepaas\.com\/product\/llm\/personal\/personal-[^/]+\/application\/[^/]+\/arrange.*/;
        return pattern.test(window.location.href);
    };

    const handleUrlChange = async () => {
        // 卸载文本域及其关联元素
        cleanup();

        const doesUrlMatch = checkUrlMatch();


        // 判断是否是预期 @match 的 URL
        if (doesUrlMatch) {
            const isChat = (await request.getAppType()) === 'Chat';
            if (isChat) {
                triggerButton.create();
            }
        } else {
            // 如果不是则隐藏触发按钮 (already handled by cleanup)
        }
    };

    const monitorUrlChange = () => {
        // Monkey patch state methods
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = function (...args) {
            originalPushState.apply(this, args);
            // Wait strictly after pushState, but in same cycle usually. 
            // In some frameworks rendering is async, but we just want to update triggers.
            handleUrlChange();
        };

        history.replaceState = function (...args) {
            originalReplaceState.apply(this, args);
            handleUrlChange();
        };

        window.addEventListener('popstate', handleUrlChange);
    };

    // 初始化
    const init = () => {
        monitorUrlChange();
        handleUrlChange(); // Initial check
    };

    // 启动
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})().catch(error => console.error(error));
