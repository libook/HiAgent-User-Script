// 恢复状态
export default {
    "restore": (container, textarea) => {
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
    },
}
