import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
    input: 'src/index.js', // 你的入口文件
    output: {
        file: 'dist/hiagent-prompt-editor.user.js', // 输出单文件
        format: 'esm',         // 输出格式，可选 'esm', 'cjs', 'iife' 等

        // --- 核心配置：非压缩、非混淆 ---
        compact: false,        // 不压缩代码结构
        generatedCode: {
            preset: 'es2015',
            symbols: false       // 尽量减少混淆式的符号转换
        },

        // --- 核心配置：自定义文件头 ---
        banner: `
// ==UserScript==
// @name         HiAgent Prompt 编辑器
// @namespace    http://tampermonkey.net/
// @version      ${new Date().toISOString()}
// @description  try to take over the world!
// @author       libook
// @match        https://hia.volcenginepaas.com/product/llm/personal/personal-*/application*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=volcenginepaas.com
// @grant        none
// ==/UserScript==
        `.trim(),
    },

    // --- 核心配置：Tree Shaking ---
    treeshake: {
        moduleSideEffects: false, // 设为 false 以实现更彻底的 Tree-shaking
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false
    },

    plugins: [
        nodeResolve(), // 支持根据依赖（Node modules）找文件
        commonjs()     // 支持 CommonJS 模块转换（如果依赖库用了 require）
    ]
};
