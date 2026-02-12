import floatingTextarea from "./floatingTextarea";

const ID = 'floating-textarea-trigger';

// 创建触发按钮
export default {
    "create": () => {
        if (document.getElementById(ID)) return;

        const triggerBtn = document.createElement('button');
        triggerBtn.id = ID;
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
            if (floatingTextarea.doesExist) {
                if (existing.style.display === 'none') {
                    existing.style.display = 'flex';
                } else {
                    existing.style.display = 'none';
                }
            } else {
                // 移除原编辑器
                document.querySelector('div.left-info')?.remove();
                // 调整编排页面宽度
                document.querySelector('.right-info').style.setProperty('width', '100%');

                // 创建浮动文本域
                await floatingTextarea.create();
            }
        });

        document.body.appendChild(triggerBtn);
    },
    "cleanup": () => {
        const triggerBtn = document.getElementById(ID);
        if (triggerBtn) {
            triggerBtn.remove();
        }
    },
}
