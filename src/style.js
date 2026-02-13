// 应用CSS样式
export default () => {
    if (document.getElementById('floating-textarea-styles')) return;

    const style = document.createElement('style');
    style.id = 'floating-textarea-styles';
    style.textContent = `
        #floating-textarea-container {
            position: fixed;
            top: 100px;
            right: 20px;
            width: 600px;
            height: 500px;
            background: white;
            border: 1px solid #ccc;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            z-index: 999999;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            resize: none;
            min-width: 300px;
            min-height: 200px;
        }
        
        #floating-textarea-header {
            background: #f0f0f0;
            border-bottom: 1px solid #ddd;
            padding: 10px 15px;
            cursor: move;
            user-select: none;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: bold;
            font-size: 14px;
            color: #333;
            flex-shrink: 0;
        }
        
        #floating-textarea-header .buttons {
            display: flex;
            gap: 5px;
        }
        
        #floating-textarea-header button {
            background: none;
            border: 1px solid #ccc;
            border-radius: 3px;
            width: 24px;
            height: 24px;
            cursor: pointer;
            font-size: 16px;
            line-height: 1;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        #floating-textarea-header button:hover {
            background: #e0e0e0;
        }
        
        #floating-content-wrapper {
            display: flex;
            flex: 1;
            overflow: hidden;
            position: relative;
            border-bottom: 1px solid #ddd;
        }

        #floating-timeline {
            height: 30px;
            background: #fcfcfc;
            display: flex;
            align-items: center;
            padding: 0 10px;
            gap: 15px; /* path points spacing */
            overflow-x: auto;
            overflow-y: hidden;
            white-space: nowrap;
            position: relative;
            flex-shrink: 0;
        }
        
        #floating-timeline::-webkit-scrollbar {
            height: 4px;
        }
        #floating-timeline::-webkit-scrollbar-thumb {
            background: #ddd;
            border-radius: 2px;
        }

        .timeline-point {
            width: 10px;
            height: 10px;
            background-color: #ddd;
            border-radius: 50%;
            cursor: pointer;
            position: relative;
            flex-shrink: 0;
            transition: background-color 0.2s, transform 0.1s;
        }
        
        .timeline-point:hover {
            background-color: #4CAF50;
            transform: scale(1.2);
        }

        .timeline-point::after {
            content: attr(data-time);
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: #333;
            color: #fff;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            white-space: nowrap;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s;
            margin-bottom: 5px;
            z-index: 100;
        }
        
        .timeline-point:hover::after {
            opacity: 1;
        }

        #floating-toc {
            width: 180px;
            background: #f9f9f9;
            border-right: 1px solid #ddd;
            overflow-y: auto;
            overflow-x: hidden;
            font-size: 12px;
            padding: 10px 0;
            flex-shrink: 0;
            height: 100%; /* Ensure it takes full height */
            box-sizing: border-box; /* Include padding in height/width */
            overscroll-behavior: contain; /* Prevent scroll chaining */
        }

        /* Custom scrollbar for TOC */
        #floating-toc::-webkit-scrollbar {
            width: 6px;
        }
        #floating-toc::-webkit-scrollbar-track {
            background: transparent;
        }
        #floating-toc::-webkit-scrollbar-thumb {
            background: #ccc;
            border-radius: 3px;
        }
        #floating-toc::-webkit-scrollbar-thumb:hover {
            background: #bbb;
        }

        #floating-toc .toc-item {
            cursor: pointer;
            padding: 4px 10px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: #555;
            transition: background 0.2s;
            line-height: 1.4;
        }

        #floating-toc .toc-item:hover {
            background: #e9ecef;
            color: #000;
        }

        #floating-toc .toc-item.h1 { padding-left: 10px; font-weight: bold; color: #333; }
        #floating-toc .toc-item.h2 { padding-left: 20px; }
        #floating-toc .toc-item.h3 { padding-left: 30px; }
        #floating-toc .toc-item.h4 { padding-left: 40px; }
        #floating-toc .toc-item.h5 { padding-left: 50px; }
        #floating-toc .toc-item.h6 { padding-left: 60px; }

        #floating-textarea {
            flex: 1;
            padding: 15px;
            border: none;
            resize: none;
            outline: none;
            font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.6;
            background: #fff;
            box-sizing: border-box;
            white-space: pre-wrap;
            overflow-y: auto;
        }
        
        #floating-resize-handle {
            position: absolute;
            bottom: 0;
            right: 0;
            width: 20px;
            height: 20px;
            background: transparent;
            cursor: nwse-resize;
            z-index: 10;
        }

        #floating-resize-handle::after {
            content: '';
            position: absolute;
            bottom: 3px;
            right: 3px;
            width: 6px;
            height: 6px;
            border-right: 2px solid #ccc;
            border-bottom: 2px solid #ccc;
        }
        
        #floating-textarea-container.minimized {
            height: 44.571px !important;
            min-height: 44.571px !important;
        }
        
        #floating-textarea-container.minimized #floating-content-wrapper,
        #floating-textarea-container.minimized #floating-resize-handle {
            display: none;
        }
        
        #floating-textarea-container.dragging {
            opacity: 0.8;
        }
        
        #floating-textarea-container.resizing {
            pointer-events: none;
        }

        .diff-tooltip {
            position: fixed;
            background: rgba(30, 30, 30, 0.95);
            color: #d4d4d4;
            border: 1px solid #444;
            border-radius: 4px;
            padding: 8px;
            font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
            font-size: 11px;
            z-index: 1000000;
            white-space: pre;
            pointer-events: none;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            max-width: 600px;
            max-height: 400px;
            overflow: auto;
            line-height: 1.4;
        }

        .diff-line {
            display: block;
        }

        .diff-added {
            background-color: rgba(46, 160, 67, 0.3);
            color: #b7f0ba;
        }

        .diff-removed {
            background-color: rgba(248, 81, 73, 0.3);
            color: #ffb1af;
        }

        .diff-header {
            color: #8b949e;
            border-bottom: 1px solid #444;
            margin-bottom: 4px;
            padding-bottom: 4px;
        }
    `;
    document.head.appendChild(style);
};
