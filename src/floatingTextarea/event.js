import autosave from "../autosave.js";
import {initWindowEvents} from "./window.js";
import {initTOC} from "./toc.js";
import {initSync} from "./sync.js";
import {initTimeline} from "./timeline.js";

// 设置事件监听
export default (container, header, textarea, resizeHandle, toc, timeline) => {
    // 1. 初始化窗口管理（拖动、缩放、最小化、关闭）
    initWindowEvents(container, header, resizeHandle);

    // 2. 初始化目录功能
    const updateTOC = initTOC(textarea, toc);

    // 3. 我们需要先定义 renderTimeline 和 performUpload 互相引用的问题
    let renderTimelineRef = null;
    const renderTimelineProxy = () => {
        if (renderTimelineRef) renderTimelineRef();
    };

    // 4. 初始化同步功能
    const {performUpload, saveContent} = initSync(textarea, renderTimelineProxy);

    // 5. 初始化时间轴
    const renderTimeline = initTimeline(textarea, timeline, updateTOC, performUpload);
    renderTimelineRef = renderTimeline;

    // 6. 绑定输入事件
    textarea.addEventListener('input', () => {
        saveContent();
        updateTOC(); // 实时更新目录
    });

    // 7. 初始化执行
    updateTOC();
    renderTimeline();

    // 8. 启动 IndexedDB 自动保存
    autosave.start(textarea, renderTimeline);

    // 9. 防止特定区域拖动触发窗口拖动
    const stopPropagation = (e) => e.stopPropagation();
    textarea.addEventListener('mousedown', stopPropagation);
    toc.addEventListener('mousedown', stopPropagation);
    timeline.addEventListener('mousedown', stopPropagation);
};

