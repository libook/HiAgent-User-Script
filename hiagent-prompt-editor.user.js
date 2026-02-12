// ==UserScript==
// @name         HiAgent Prompt 编辑器
// @namespace    http://tampermonkey.net/
// @version      2026-02-11
// @description  try to take over the world!
// @author       libook
// @match        https://hia.volcenginepaas.com/product/llm/personal/personal-*/application*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=volcenginepaas.com
// @grant        none
// ==/UserScript==

(async () => {
    'use strict';

    const AUTO_SAVE_DURATION = 1000;//1秒

    let personal = '';
    let application = '';

    const updateContext = () => {
        const pathSplit = window.location.pathname.split('/');
        // /product/llm/personal/personal-xxxxxx/application/xxxxxxx/arrange
        if (pathSplit.length >= 7 && pathSplit[3] === 'personal' && pathSplit[5] === 'application') {
            personal = pathSplit[4];
            application = pathSplit[6];
            return true;
        }
        return false;
    };

    /*\
    |*|
    |*|  :: cookies.js ::
    |*|
    |*|  A complete cookies reader/writer framework with full unicode support.
    |*|
    |*|  https://developer.mozilla.org/zh-CN/docs/DOM/document.cookie
    |*|
    |*|  This framework is released under the GNU Public License, version 3 or later.
    |*|  http://www.gnu.org/licenses/gpl-3.0-standalone.html
    |*|
    |*|  Syntaxes:
    |*|
    |*|  * docCookies.setItem(name, value[, end[, path[, domain[, secure]]]])
    |*|  * docCookies.getItem(name)
    |*|  * docCookies.removeItem(name[, path], domain)
    |*|  * docCookies.hasItem(name)
    |*|  * docCookies.keys()
    |*|
    \*/

    var docCookies = {
        getItem: function (sKey) {
            return (
                decodeURIComponent(
                    document.cookie.replace(
                        new RegExp(
                            "(?:(?:^|.*;)\\s*" +
                            encodeURIComponent(sKey).replace(/[-.+*]/g, "\\$&") +
                            "\\s*\\=\\s*([^;]*).*$)|^.*$",
                        ),
                        "$1",
                    ),
                ) || null
            );
        },
        setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
            if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
                return false;
            }
            var sExpires = "";
            if (vEnd) {
                switch (vEnd.constructor) {
                    case Number:
                        sExpires =
                            vEnd === Infinity
                                ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT"
                                : "; max-age=" + vEnd;
                        break;
                    case String:
                        sExpires = "; expires=" + vEnd;
                        break;
                    case Date:
                        sExpires = "; expires=" + vEnd.toUTCString();
                        break;
                }
            }
            document.cookie =
                encodeURIComponent(sKey) +
                "=" +
                encodeURIComponent(sValue) +
                sExpires +
                (sDomain ? "; domain=" + sDomain : "") +
                (sPath ? "; path=" + sPath : "") +
                (bSecure ? "; secure" : "");
            return true;
        },
        removeItem: function (sKey, sPath, sDomain) {
            if (!sKey || !this.hasItem(sKey)) {
                return false;
            }
            document.cookie =
                encodeURIComponent(sKey) +
                "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" +
                (sDomain ? "; domain=" + sDomain : "") +
                (sPath ? "; path=" + sPath : "");
            return true;
        },
        hasItem: function (sKey) {
            return new RegExp(
                "(?:^|;\\s*)" +
                encodeURIComponent(sKey).replace(/[-.+*]/g, "\\$&") +
                "\\s*\\=",
            ).test(document.cookie);
        },
        keys: /* optional method: you can safely remove it! */ function () {
            var aKeys = document.cookie
                .replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "")
                .split(/\s*(?:\=[^;]*)?;\s*/);
            for (var nIdx = 0; nIdx < aKeys.length; nIdx++) {
                aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]);
            }
            return aKeys;
        },
    };

    const generateHeader = () => ({
        "accept": "application/json, text/plain, */*",
        "accept-language": "zh",
        "content-type": "application/json",
        "sec-ch-ua": "\"Not(A:Brand\";v=\"8\", \"Chromium\";v=\"144\", \"Google Chrome\";v=\"144\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "timeout": "300000",
        "workspaceid": personal,
        "x-csrf-token": docCookies.getItem('x-csrf-token'),
        "x-top-region": "cn-north-1"
    });

    const fetchAppConfig = async () => fetch("https://hia.volcenginepaas.com/api/app?Action=GetAppConfig&Version=2023-08-01", {
        "headers": generateHeader(),
        "referrer": window.location.pathname,
        "body": `{\"AppID\":\"${application}\",\"WorkspaceID\":\"${personal}\"}`,
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    }).then(res => res.json()).then(json => json.Result);

    const getPrompt = async () => fetchAppConfig().then(result => result.AppConfigDraft.PrePrompt);

    const setPromt = async (prompt) => {
        const AppConfigDraft = await fetchAppConfig().then(result => result.AppConfigDraft);
        AppConfigDraft.PrePrompt = prompt;
        const requestBody = {
            "AppID": application,
            AppConfigDraft,
            "WorkspaceID": personal,
        };
        await fetch("https://hia.volcenginepaas.com/api/app?Action=SaveAppConfigDraft&Version=2023-08-01", {
            "headers": generateHeader(),
            "referrer": window.location.pathname,
            "body": JSON.stringify(requestBody),
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        });
    };

    // 创建浮动文本域
    const createFloatingTextarea = async () => {
        // 先移除旧的
        const existingContainer = document.getElementById('floating-textarea-container');
        if (existingContainer) {
            existingContainer.remove();
        }

        // 容器元素
        const container = document.createElement('div');
        container.id = 'floating-textarea-container';

        // 头部（用于拖动）
        const header = document.createElement('div');
        header.id = 'floating-textarea-header';
        header.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span>浮动文本域</span>
                <span id="floating-status" style="font-size: 12px; color: #4CAF50; font-weight: normal; opacity: 0.8;"></span>
            </div>
            <div class="buttons">
                <button class="btn-minimize">−</button>
                <button class="btn-close">×</button>
            </div>
        `;

        // 文本域
        const textarea = document.createElement('textarea');
        textarea.id = 'floating-textarea';
        textarea.placeholder = '在这里输入内容...';

        // 目录区域
        const toc = document.createElement('div');
        toc.id = 'floating-toc';

        try {
            const promptContent = await getPrompt();
            textarea.value = promptContent || '';
        } catch (e) {
            console.error('Failed to load prompt:', e);
            textarea.value = '加载失败，请重试';
        }

        // 内容包装器
        const contentWrapper = document.createElement('div');
        contentWrapper.id = 'floating-content-wrapper';
        contentWrapper.appendChild(toc);
        contentWrapper.appendChild(textarea);

        // 调整大小手柄
        const resizeHandle = document.createElement('div');
        resizeHandle.id = 'floating-resize-handle';

        // 组装
        container.appendChild(header);
        container.appendChild(contentWrapper);
        container.appendChild(resizeHandle);
        document.body.appendChild(container);

        // 应用样式
        applyStyles();

        // 添加事件监听
        setupEventListeners(container, header, textarea, resizeHandle, toc);

        // 从localStorage恢复状态
        restoreState(container, textarea);

        return container;
    };

    // 应用CSS样式
    function applyStyles() {
        if (document.getElementById('floating-textarea-styles')) return;

        const style = document.createElement('style');
        style.id = 'floating-textarea-styles';
        style.textContent = `
            #floating-textarea-container {
                position: fixed;
                top: 100px;
                right: 20px;
                width: 600px;
                height: 500px;
                background: white;
                border: 1px solid #ccc;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                z-index: 999999;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                resize: none;
                min-width: 300px;
                min-height: 200px;
            }
            
            #floating-textarea-header {
                background: #f0f0f0;
                border-bottom: 1px solid #ddd;
                padding: 10px 15px;
                cursor: move;
                user-select: none;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-weight: bold;
                font-size: 14px;
                color: #333;
                flex-shrink: 0;
            }
            
            #floating-textarea-header .buttons {
                display: flex;
                gap: 5px;
            }
            
            #floating-textarea-header button {
                background: none;
                border: 1px solid #ccc;
                border-radius: 3px;
                width: 24px;
                height: 24px;
                cursor: pointer;
                font-size: 16px;
                line-height: 1;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            #floating-textarea-header button:hover {
                background: #e0e0e0;
            }
            
            #floating-content-wrapper {
                display: flex;
                flex: 1;
                overflow: hidden;
                position: relative;
            }

            #floating-toc {
                width: 180px;
                background: #f9f9f9;
                border-right: 1px solid #ddd;
                overflow-y: auto;
                overflow-x: hidden;
                font-size: 12px;
                padding: 10px 0;
                flex-shrink: 0;
                height: 100%; /* Ensure it takes full height */
                box-sizing: border-box; /* Include padding in height/width */
                overscroll-behavior: contain; /* Prevent scroll chaining */
            }

            /* Custom scrollbar for TOC */
            #floating-toc::-webkit-scrollbar {
                width: 6px;
            }
            #floating-toc::-webkit-scrollbar-track {
                background: transparent;
            }
            #floating-toc::-webkit-scrollbar-thumb {
                background: #ccc;
                border-radius: 3px;
            }
            #floating-toc::-webkit-scrollbar-thumb:hover {
                background: #bbb;
            }

            #floating-toc .toc-item {
                cursor: pointer;
                padding: 4px 10px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                color: #555;
                transition: background 0.2s;
                line-height: 1.4;
            }

            #floating-toc .toc-item:hover {
                background: #e9ecef;
                color: #000;
            }

            #floating-toc .toc-item.h1 { padding-left: 10px; font-weight: bold; color: #333; }
            #floating-toc .toc-item.h2 { padding-left: 20px; }
            #floating-toc .toc-item.h3 { padding-left: 30px; }
            #floating-toc .toc-item.h4 { padding-left: 40px; }
            #floating-toc .toc-item.h5 { padding-left: 50px; }
            #floating-toc .toc-item.h6 { padding-left: 60px; }

            #floating-textarea {
                flex: 1;
                padding: 15px;
                border: none;
                resize: none;
                outline: none;
                font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
                font-size: 14px;
                line-height: 1.6;
                background: #fff;
                box-sizing: border-box;
                white-space: pre-wrap;
                overflow-y: auto;
            }
            
            #floating-resize-handle {
                position: absolute;
                bottom: 0;
                right: 0;
                width: 20px;
                height: 20px;
                background: transparent;
                cursor: nwse-resize;
                z-index: 10;
            }

            #floating-resize-handle::after {
                content: '';
                position: absolute;
                bottom: 3px;
                right: 3px;
                width: 6px;
                height: 6px;
                border-right: 2px solid #ccc;
                border-bottom: 2px solid #ccc;
            }
            
            #floating-textarea-container.minimized {
                height: 44.571px !important;
                min-height: 44.571px !important;
            }
            
            #floating-textarea-container.minimized #floating-content-wrapper,
            #floating-textarea-container.minimized #floating-resize-handle {
                display: none;
            }
            
            #floating-textarea-container.dragging {
                opacity: 0.8;
            }
            
            #floating-textarea-container.resizing {
                pointer-events: none;
            }
        `;
        document.head.appendChild(style);
    }

    // 设置事件监听
    function setupEventListeners(container, header, textarea, resizeHandle, toc) {
        let isDragging = false;
        let isResizing = false;
        let startX, startY;
        let startWidth, startHeight;
        let startLeft, startTop;

        // 拖动功能
        header.addEventListener('mousedown', startDrag);

        // 调整大小
        resizeHandle.addEventListener('mousedown', startResize);

        // 按钮事件
        const minimizeBtn = header.querySelector('.btn-minimize');
        const closeBtn = header.querySelector('.btn-close');

        minimizeBtn.addEventListener('click', toggleMinimize);
        closeBtn.addEventListener('click', closeFloatingTextarea);

        let saveTimer;
        const saveContent = () => {
            if (saveTimer !== undefined) {
                clearTimeout(saveTimer);
            }

            const statusEl = document.getElementById('floating-status');
            if (statusEl) statusEl.textContent = '保存中...';

            saveTimer = setTimeout(() => {
                setPromt(textarea.value).then(() => {
                    if (statusEl) {
                        const now = new Date();
                        const timeStr = now.getHours().toString().padStart(2, '0') + ':' +
                            now.getMinutes().toString().padStart(2, '0') + ':' +
                            now.getSeconds().toString().padStart(2, '0');
                        statusEl.textContent = `已保存 ${timeStr}`;
                        statusEl.style.color = '#4CAF50';
                    }
                }).catch(error => {
                    console.error(error);
                    if (statusEl) {
                        statusEl.textContent = '保存失败';
                        statusEl.style.color = 'red';
                    }
                });
            }, AUTO_SAVE_DURATION);
        };

        const updateTOC = () => {
            const text = textarea.value;
            const savedScrollTop = toc.scrollTop; // Save scroll position
            toc.innerHTML = '';

            const lines = text.split('\n');
            let currentIndex = 0;

            lines.forEach((line, lineIndex) => {
                const match = line.match(/^(#{1,6})\s+(.+)$/);
                if (match) {
                    const level = match[1].length;
                    const title = match[2].trim();

                    const item = document.createElement('div');
                    item.className = `toc-item h${level}`;
                    item.textContent = title;
                    item.title = title;

                    // 记录该标题在文本中的起始位置（大致位置）
                    const targetIndex = currentIndex;

                    item.addEventListener('click', () => {
                        scrollToIndex(targetIndex);
                    });

                    toc.appendChild(item);
                }
                currentIndex += line.length + 1; // +1 for newline
            });

            toc.scrollTop = savedScrollTop; // Restore scroll position
        };

        const scrollToIndex = (index) => {
            // 使用 Shadow DIV 模拟计算高度
            let shadowDiv = document.getElementById('textarea-shadow-measure');
            if (!shadowDiv) {
                shadowDiv = document.createElement('div');
                shadowDiv.id = 'textarea-shadow-measure';
                document.body.appendChild(shadowDiv);
            }

            // 复制关键样式
            const cs = window.getComputedStyle(textarea);
            shadowDiv.style.width = cs.width;
            shadowDiv.style.padding = cs.padding;
            shadowDiv.style.border = cs.border;
            shadowDiv.style.boxSizing = cs.boxSizing;
            shadowDiv.style.font = cs.font;
            shadowDiv.style.fontFamily = cs.fontFamily;
            shadowDiv.style.fontSize = cs.fontSize;
            shadowDiv.style.fontWeight = cs.fontWeight;
            shadowDiv.style.letterSpacing = cs.letterSpacing;
            shadowDiv.style.lineHeight = cs.lineHeight;
            shadowDiv.style.whiteSpace = cs.whiteSpace;
            shadowDiv.style.wordWrap = cs.wordWrap;
            shadowDiv.style.wordBreak = cs.wordBreak;

            // 隐藏
            shadowDiv.style.position = 'absolute';
            shadowDiv.style.top = '-9999px';
            shadowDiv.style.visibility = 'hidden';

            // Sync scrollbar state with textarea to match content wrapping width
            const hasScrollbar = textarea.scrollHeight > textarea.clientHeight;
            shadowDiv.style.overflowY = hasScrollbar ? 'scroll' : 'hidden';

            shadowDiv.style.paddingBottom = '0px'; // Prevent overscroll by bottom padding
            shadowDiv.style.minHeight = '0px';

            // 设置内容直到目标位置
            // 注意：textContent会忽略HTML解析，这很好。
            // 但如果textarea里有特殊空白符，textContent可能处理不同。
            // 最好用 substring
            shadowDiv.textContent = textarea.value.substring(0, index);

            // 调整滚动高度
            const targetScrollTop = shadowDiv.scrollHeight;

            // 可选：高亮或者聚焦
            textarea.focus();
            if (textarea.setSelectionRange) {
                textarea.setSelectionRange(index, index);
            }

            // Moved after focus/selection to ensure browser default scroll-into-view behavior 
            // doesn't override our precise calculation.
            textarea.scrollTop = targetScrollTop;

            // Double-check in next frame just in case browser layout trashing interfered
            requestAnimationFrame(() => {
                if (Math.abs(textarea.scrollTop - targetScrollTop) > 5) {
                    textarea.scrollTop = targetScrollTop;
                }
            });
        };

        // 保存文本内容
        textarea.addEventListener('input', () => {
            saveContent();
            updateTOC(); // 实时更新目录
        });

        // 初始化目录
        updateTOC();

        // 防止文本域内拖动触发窗口拖动
        textarea.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });

        // 防止TOC内拖动触发窗口拖动
        toc.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });

        function startDrag(e) {
            if (e.target.closest('button')) return; // 如果是按钮则不拖动

            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            const rect = container.getBoundingClientRect();
            startLeft = rect.left;
            startTop = rect.top;

            container.classList.add('dragging');

            document.addEventListener('mousemove', doDrag);
            document.addEventListener('mouseup', stopDrag);
            e.preventDefault();
        }

        function doDrag(e) {
            if (!isDragging) return;

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            container.style.left = (startLeft + dx) + 'px';
            container.style.top = (startTop + dy) + 'px';
            container.style.right = 'auto'; // 清除 right 属性，避免造成定位冲突

            // 更新 right 存储，虽然我们主要依赖 left/top，但savePosition如果只是存储style.right可能会有问题
            // 我们的savePosition实现是存 style.left, style.top, style.right
        }

        function stopDrag() {
            isDragging = false;
            container.classList.remove('dragging');
            document.removeEventListener('mousemove', doDrag);
            document.removeEventListener('mouseup', stopDrag);
            savePosition();
        }

        function startResize(e) {
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = container.offsetWidth;
            startHeight = container.offsetHeight;

            container.classList.add('resizing');

            document.addEventListener('mousemove', doResize);
            document.addEventListener('mouseup', stopResize);
            e.preventDefault();
        }

        function doResize(e) {
            if (!isResizing) return;

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            const newWidth = Math.max(200, startWidth + dx);
            const newHeight = Math.max(150, startHeight + dy);

            container.style.width = newWidth + 'px';
            container.style.height = newHeight + 'px';
        }

        function stopResize() {
            isResizing = false;
            container.classList.remove('resizing');
            document.removeEventListener('mousemove', doResize);
            document.removeEventListener('mouseup', stopResize);
            saveSize();
        }

        function toggleMinimize() {
            container.classList.toggle('minimized');
            minimizeBtn.textContent = container.classList.contains('minimized') ? '+' : '−';
            saveMinimizedState();
        }

        function closeFloatingTextarea() {
            container.remove();
            localStorage.removeItem('floatingTextareaPosition');
            localStorage.removeItem('floatingTextareaSize');
            localStorage.removeItem('floatingTextareaMinimized');
        }

        function savePosition() {
            const pos = {
                left: container.style.left,
                top: container.style.top,
                right: container.style.right
            };
            localStorage.setItem('floatingTextareaPosition', JSON.stringify(pos));
        }

        function saveSize() {
            const size = {
                width: container.style.width,
                height: container.style.height
            };
            localStorage.setItem('floatingTextareaSize', JSON.stringify(size));
        }

        function saveMinimizedState() {
            localStorage.setItem('floatingTextareaMinimized',
                container.classList.contains('minimized'));
        }
    }

    // 恢复状态
    function restoreState(container, textarea) {
        // 恢复位置
        const savedPosition = localStorage.getItem('floatingTextareaPosition');
        if (savedPosition) {
            try {
                const pos = JSON.parse(savedPosition);
                if (pos.left) container.style.left = pos.left;
                if (pos.top) container.style.top = pos.top;
                if (pos.right) container.style.right = pos.right;
            } catch (e) {
                console.error('Error restoring position:', e);
            }
        }

        // 恢复大小
        const savedSize = localStorage.getItem('floatingTextareaSize');
        if (savedSize) {
            try {
                const size = JSON.parse(savedSize);
                if (size.width) container.style.width = size.width;
                if (size.height) container.style.height = size.height;
            } catch (e) {
                console.error('Error restoring size:', e);
            }
        }

        // 恢复折叠状态
        const savedMinimized = localStorage.getItem('floatingTextareaMinimized');
        if (savedMinimized === 'true') {
            container.classList.add('minimized');
            const minimizeBtn = container.querySelector('.btn-minimize');
            if (minimizeBtn) minimizeBtn.textContent = '+';
        }
    }

    // 创建触发按钮
    const createTriggerButton = () => {
        if (document.getElementById('floating-textarea-trigger')) return;

        const triggerBtn = document.createElement('button');
        triggerBtn.id = 'floating-textarea-trigger';
        triggerBtn.textContent = 'T';
        triggerBtn.title = '打开浮动文本域';

        Object.assign(triggerBtn.style, {
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            width: '40px',
            height: '40px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            zIndex: '999998',
            fontSize: '18px',
            fontWeight: 'bold',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
        });

        triggerBtn.addEventListener('click', async () => {
            const existing = document.getElementById('floating-textarea-container');
            if (existing) {
                if (existing.style.display === 'none') {
                    existing.style.display = 'flex';
                } else {
                    existing.style.display = 'none';
                }
            } else {
                // 移除原编辑器
                document.querySelector('div.left-info')?.remove();
                // 调整编排页面宽度
                document.querySelector('.right-info').style.setProperty('width', 'auto');

                // 创建浮动文本域
                await createFloatingTextarea();
            }
        });

        document.body.appendChild(triggerBtn);
    };

    const cleanup = () => {
        const textareaContainer = document.getElementById('floating-textarea-container');
        if (textareaContainer) {
            textareaContainer.remove();
        }
        const triggerBtn = document.getElementById('floating-textarea-trigger');
        if (triggerBtn) {
            triggerBtn.remove();
        }
    };

    const checkUrlMatch = () => {
        // @match https://hia.volcenginepaas.com/product/llm/personal/personal-*/application/*/arrange*
        const pattern = /https:\/\/hia\.volcenginepaas\.com\/product\/llm\/personal\/personal-[^\/]+\/application\/[^\/]+\/arrange.*/;
        return pattern.test(window.location.href);
    };

    const handleUrlChange = () => {
        // 卸载文本域及其关联元素
        cleanup();

        // 判断是否是预期 @match 的 URL
        if (checkUrlMatch()) {
            if (updateContext()) {
                // 如果是则重新显示触发按钮
                createTriggerButton();
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
    function init() {
        monitorUrlChange();
        handleUrlChange(); // Initial check
    }

    // 启动
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})().catch(error => console.error(error));
