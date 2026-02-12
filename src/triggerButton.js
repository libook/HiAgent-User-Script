import floatingTextarea from "./floatingTextarea";

const ID = 'floating-textarea-trigger';

// 创建触发按钮
export default {
    "cleanup": () => {
        const triggerBtn = document.getElementById(ID);
        if (triggerBtn) {
            triggerBtn.remove();
        }
    },
    "create": () => {
        if (document.getElementById(ID)) return;

        const triggerBtn = document.createElement('button');
        triggerBtn.id = ID;
        triggerBtn.textContent = 'T';
        triggerBtn.title = '打开浮动文本域';

        Object.assign(triggerBtn.style, {
            "background": '#4CAF50',
            "border": 'none',
            "borderRadius": '50%',
            "bottom": '20px',
            "boxShadow": '0 2px 10px rgba(0,0,0,0.2)',
            "color": 'white',
            "cursor": 'pointer',
            "fontSize": '18px',
            "fontWeight": 'bold',
            "height": '40px',
            "left": '20px',
            "position": 'fixed',
            "width": '40px',
            "zIndex": '999998',
        });

        triggerBtn.addEventListener('click', async () => {
            // 创建浮动文本域
            await floatingTextarea.create();
        });

        document.body.appendChild(triggerBtn);
    },
};
