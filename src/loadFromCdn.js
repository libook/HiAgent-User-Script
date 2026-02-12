export default {
    "loadCss": (cdnUrl) => {
        // 避免重复引入
        if (document.querySelector(`link[href="${cdnUrl}"]`)) return;

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = cdnUrl;
        // 插入到head标签中
        document.head.appendChild(link);

        // CSS加载完成回调（可选）
        link.onload = () => {
            console.log(`CSS加载完成: ${cdnUrl}`);
        };
        link.onerror = (err) => {
            console.error(`CSS加载失败: ${cdnUrl}`, err);
        };
    },

    "loadJs": async (cdnUrl) => new Promise((resolve, reject) => {
        // 避免重复引入
        if (document.querySelector(`script[src="${cdnUrl}"]`)) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = cdnUrl;
        script.type = 'text/javascript';
        // 插入到body末尾（或head）
        document.body.appendChild(script);

        // JS加载完成回调（关键：确保JS加载后再执行依赖逻辑）
        script.onload = () => {
            console.log(`JS加载完成: ${cdnUrl}`);
            resolve();
        };
        script.onerror = (err) => {
            console.error(`JS加载失败: ${cdnUrl}`, err);
            reject(err);
        };
    }),
};
