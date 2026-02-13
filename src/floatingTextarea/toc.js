
const SCROLL_TOLERANCE = 5;

/**
 * 初始化目录(TOC)功能
 * @param {HTMLTextAreaElement} textarea 
 * @param {HTMLElement} toc 
 * @returns {Function} updateTOC function
 */
export const initTOC = (textarea, toc) => {
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
            if (Math.abs(textarea.scrollTop - targetScrollTop) > SCROLL_TOLERANCE) {
                textarea.scrollTop = targetScrollTop;
            }
        });
    };

    const updateTOC = () => {
        const text = textarea.value;
        const savedScrollTop = toc.scrollTop; // Save scroll position
        toc.innerHTML = '';

        const lines = text.split('\n');
        let currentIndex = 0;

        lines.forEach((line) => {
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

    return updateTOC;
};
