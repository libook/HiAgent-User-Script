
import dbAdapter from '../db.js';

/**
 * 初始化时间轴功能
 * @param {HTMLTextAreaElement} textarea 
 * @param {HTMLElement} timeline 
 * @param {Function} updateTOC 
 * @param {Function} performUpload 
 * @returns {Function} renderTimeline
 */
export const initTimeline = (textarea, timeline, updateTOC, performUpload) => {
    let tooltip = null;

    const renderTimeline = async () => {
        // Cleanup existing tooltip on re-render
        if (tooltip) {
            tooltip.remove();
            tooltip = null;
        }

        const records = await dbAdapter.getAllRecords();
        timeline.innerHTML = '';

        records.forEach(record => {
            const date = new Date(record.timestamp);
            /* eslint-disable no-magic-numbers */
            const timeStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
            /* eslint-enable no-magic-numbers */

            const point = document.createElement('div');
            point.className = 'timeline-point';
            point.dataset.time = timeStr;

            point.addEventListener('mouseenter', () => {
                if (tooltip) tooltip.remove();

                const currentContent = textarea.value;
                const recordContent = record.content;

                // @ts-ignore
                /* global Diff */
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

    return renderTimeline;
};
