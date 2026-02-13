
import autosave from "../autosave.js";
import floatingTextarea from "./index.js";

const DEFAULT_WIDTH = 200;
const DEFAULT_HEIGHT = 150;

/**
 * 初始化窗口管理相关事件（拖拽、调整大小、最小化、关闭）
 * @param {HTMLElement} container 
 * @param {HTMLElement} header 
 * @param {HTMLElement} resizeHandle 
 */
export const initWindowEvents = (container, header, resizeHandle) => {
    let isDragging = false;
    let isResizing = false;
    let startX, startY;
    let startWidth, startHeight;
    let startLeft, startTop;

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

    // 拖动功能
    header.addEventListener('mousedown', startDrag);

    // 调整大小
    resizeHandle.addEventListener('mousedown', startResize);

    // 按钮事件
    const minimizeBtn = header.querySelector('.btn-minimize');
    const closeBtn = header.querySelector('.btn-close');

    if (minimizeBtn) minimizeBtn.addEventListener('click', toggleMinimize);
    if (closeBtn) closeBtn.addEventListener('click', closeFloatingTextarea);
};
