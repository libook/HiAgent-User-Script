import autosave from "../autosave.js";
import request from "../request.js";
import dbAdapter from '../db.js';
import floatingTextarea from "./index.js";

const AUTO_SAVE_DURATION = 1000;//1秒
const DEFAULT_WIDTH = 200;
const DEFAULT_HEIGHT = 150;

// 设置事件监听
export default (container, header, vditor, box, resizeHandle, timeline) => {
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
            performUpload(vditor.getValue());
        }, AUTO_SAVE_DURATION);
    };

    // 保存文本内容
    box.input = () => {
        saveContent();
    };

    // 渲染时间轴
    const renderTimeline = async () => {
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
            point.title = `点击恢复到: ${timeStr}`;

            point.addEventListener('click', async () => {
                if (confirm(`确认恢复到 ${timeStr} 的版本吗？\n当前未保存的内容将尝试先保存。`)) {
                    // 1. Try to save current state first
                    await dbAdapter.saveIfChanged(vditor.getValue());

                    // 2. Restore
                    vditor.setValue(record.content);

                    // 3. Update UI
                    renderTimeline(); // Refresh to show the just-saved current state as the latest point

                    // 4. Trigger upload to server immediately
                    performUpload(vditor.getValue());

                    alert('已恢复并触发云端保存。');
                }
            });

            timeline.appendChild(point);
        });
    };

    // Initial render
    renderTimeline();

    // 启动 IndexedDB 自动保存
    autosave.start(vditor);

    // 防止Timeline内拖动触发窗口拖动
    timeline.addEventListener('mousedown', (e) => {
        e.stopPropagation();
    });
};
