import request from '../request.js';
import style from '../style.js';
import event from './event.js';
import state from './state.js';

export default {
    "create": async function () {
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
            const promptContent = await request.getPrompt();
            textarea.value = promptContent || '';
        } catch (e) {
            console.error('Failed to load prompt:', e);
            alert('内容加载失败');
            this.cleanup();
        }

        // 内容包装器
        const contentWrapper = document.createElement('div');
        contentWrapper.id = 'floating-content-wrapper';
        contentWrapper.appendChild(toc);
        contentWrapper.appendChild(textarea);

        // 调整大小手柄
        const resizeHandle = document.createElement('div');
        resizeHandle.id = 'floating-resize-handle';

        // 历史记录时间轴
        const timeline = document.createElement('div');
        timeline.id = 'floating-timeline';

        // 组装
        container.appendChild(header);
        container.appendChild(contentWrapper);
        container.appendChild(timeline);
        container.appendChild(resizeHandle);
        document.body.appendChild(container);

        // 应用样式
        style();

        // 添加事件监听
        event(container, header, textarea, resizeHandle, toc, timeline);

        // 从localStorage恢复状态
        state.restore(container, textarea);

        return container;
    },
    "cleanup": () => {
        const textareaContainer = document.getElementById('floating-textarea-container');
        if (textareaContainer) {
            textareaContainer.remove();
        }
    },
    get doesExist() {
        return document.getElementById('floating-textarea-container') !== null;
    },
};
