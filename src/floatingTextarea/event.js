import autosave from "../autosave.js";
import request from "../request.js";
import dbAdapter from '../db.js';
import floatingTextarea from "./index.js";

const AUTO_SAVE_DURATION = 1000;//1秒
const SCROLL_TOLERANCE = 5;
const DEFAULT_WIDTH = 200;
const DEFAULT_HEIGHT = 150;

// 设置事件监听
export default (container, header, textarea, resizeHandle, toc, timeline) => {
    let isDragging = false;
    let isResizing = false;
    let startX, startY;
    let startWidth, startHeight;
    let startLeft, startTop;

    const startDrag = (e) => {
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
    };

    const doDrag = (e) => {
        if (!isDragging) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        container.style.left = `${startLeft + dx}px`;
        container.style.top = `${startTop + dy}px`;
        container.style.right = 'auto'; // 清除 right 属性，避免造成定位冲突

        // 更新 right 存储，虽然我们主要依赖 left/top，但savePosition如果只是存储style.right可能会有问题
        // 我们的savePosition实现是存 style.left, style.top, style.right
    };

    const stopDrag = () => {
        isDragging = false;
        container.classList.remove('dragging');
        document.removeEventListener('mousemove', doDrag);
        document.removeEventListener('mouseup', stopDrag);
        savePosition();
    };

    const startResize = (e) => {
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = container.offsetWidth;
        startHeight = container.offsetHeight;

        container.classList.add('resizing');

        document.addEventListener('mousemove', doResize);
        document.addEventListener('mouseup', stopResize);
        e.preventDefault();
    };

    const doResize = (e) => {
        if (!isResizing) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        const newWidth = Math.max(DEFAULT_WIDTH, startWidth + dx);
        const newHeight = Math.max(DEFAULT_HEIGHT, startHeight + dy);

        container.style.width = `${newWidth}px`;
        container.style.height = `${newHeight}px`;
    };

    const stopResize = () => {
        isResizing = false;
        container.classList.remove('resizing');
        document.removeEventListener('mousemove', doResize);
        document.removeEventListener('mouseup', stopResize);
        saveSize();
    };

    const toggleMinimize = () => {
        container.classList.toggle('minimized');
        minimizeBtn.textContent = container.classList.contains('minimized') ? '+' : '−';
        saveMinimizedState();
    };

    const closeFloatingTextarea = () => {
        autosave.cleanup();
        floatingTextarea.cleanup();
        localStorage.removeItem('floatingTextareaPosition');
        localStorage.removeItem('floatingTextareaSize');
        localStorage.removeItem('floatingTextareaMinimized');
    };

    const savePosition = () => {
        const pos = {
            "left": container.style.left,
            "right": container.style.right,
            "top": container.style.top,
        };
        localStorage.setItem('floatingTextareaPosition', JSON.stringify(pos));
    };

    const saveSize = () => {
        const size = {
            "height": container.style.height,
            "width": container.style.width,
        };
        localStorage.setItem('floatingTextareaSize', JSON.stringify(size));
    };

    const saveMinimizedState = () => {
        localStorage.setItem('floatingTextareaMinimized',
            container.classList.contains('minimized'));
    };

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
    const performUpload = async (content) => {
        const statusEl = document.getElementById('floating-status');
        if (statusEl) statusEl.textContent = '保存中...';

        try {
            await request.setPromt(content);
            if (statusEl) {
                const now = new Date();
                const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`; // eslint-disable-line no-magic-numbers
                statusEl.textContent = `已保存 ${timeStr}`;
                statusEl.style.color = '#4CAF50';
                if (typeof renderTimeline === 'function') renderTimeline();
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
            if (Math.abs(textarea.scrollTop - targetScrollTop) > SCROLL_TOLERANCE) {
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

    let tooltip = null;

    // 渲染时间轴
    const renderTimeline = async () => {
        // Cleanup existing tooltip on re-render
        if (tooltip) {
            tooltip.remove();
            tooltip = null;
        }

        const records = await dbAdapter.getAllRecords();
        timeline.innerHTML = '';

        // Draw line
        // We use flex gap for spacing, but maybe a visual line background helps?
        // For now, points are just spaced out.

        records.forEach(record => {
            const date = new Date(record.timestamp);
            const timeStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`; // eslint-disable-line no-magic-numbers

            const point = document.createElement('div');
            point.className = 'timeline-point';
            point.dataset.time = timeStr;
            // point.title = `点击恢复到: ${timeStr}`; // Removing native title to use custom tooltip

            /* global Diff */
            point.addEventListener('mouseenter', () => {
                if (tooltip) tooltip.remove();

                const currentContent = textarea.value;
                const recordContent = record.content;

                // @ts-ignore
                if (typeof Diff === 'undefined') {
                    console.warn('Diff library not loaded');
                    return;
                }

                // 使用 jsdiff 生成 patch
                // @ts-ignore
                const patch = Diff.createTwoFilesPatch('Current', 'Backup', currentContent, recordContent, 'Current', timeStr);

                tooltip = document.createElement('div');
                tooltip.className = 'diff-tooltip';

                // 简单的语法高亮
                const html = patch.split('\n').map(line => {
                    let className = 'diff-line';
                    if (line.startsWith('+')) className += ' diff-added';
                    else if (line.startsWith('-')) className += ' diff-removed';
                    else if (line.startsWith('@')) className += ' diff-header';
                    return `<div class="${className}">${line}</div>`;
                }).join('');

                tooltip.innerHTML = html;
                document.body.appendChild(tooltip);

                // Position tooltip
                const rect = point.getBoundingClientRect();
                const tooltipWidth = tooltip.offsetWidth;
                let left = rect.left;

                // Prevent overflow right
                const PADDING = 20;
                if (left + tooltipWidth > window.innerWidth - PADDING) {
                    left = window.innerWidth - tooltipWidth - PADDING;
                }
                // Prevent overflow left (just in case)
                if (left < PADDING) {
                    left = PADDING;
                }

                tooltip.style.left = `${left}px`;
                const TOOLTIP_VERTICAL_OFFSET = 10;
                tooltip.style.bottom = `${window.innerHeight - rect.top + TOOLTIP_VERTICAL_OFFSET}px`; // Show above the point
            });

            point.addEventListener('mouseleave', (e) => {
                // Check if moving to tooltip
                if (e.relatedTarget && tooltip && tooltip.contains(e.relatedTarget)) {
                    return;
                }
                if (tooltip) {
                    tooltip.remove();
                    tooltip = null;
                }
            });

            point.addEventListener('click', async () => {
                if (confirm(`确认恢复到 ${timeStr} 的版本吗？\n当前未保存的内容将尝试先保存。`)) {
                    // 1. Try to save current state first
                    await dbAdapter.saveIfChanged(textarea.value);

                    // 2. Restore
                    textarea.value = record.content;

                    // 3. Update UI
                    updateTOC();
                    renderTimeline(); // Refresh to show the just-saved current state as the latest point

                    // 4. Trigger upload to server immediately
                    performUpload(textarea.value);

                    alert('已恢复并触发云端保存。');
                }
            });

            timeline.appendChild(point);
        });
    };

    // 启动 IndexedDB 自动保存
    autosave.start(textarea, renderTimeline);

    // Initial render
    renderTimeline();

    // 防止文本域内拖动触发窗口拖动
    textarea.addEventListener('mousedown', (e) => {
        e.stopPropagation();
    });

    // 防止TOC内拖动触发窗口拖动
    toc.addEventListener('mousedown', (e) => {
        e.stopPropagation();
    });

    // 防止Timeline内拖动触发窗口拖动
    timeline.addEventListener('mousedown', (e) => {
        e.stopPropagation();
    });
};
