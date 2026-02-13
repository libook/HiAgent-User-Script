

# Hi Agent User Script

一个功能强大的浏览器用户脚本，为网页交互提供增强功能。

## 功能特性

- **自动保存**: 智能自动保存机制，确保数据不丢失
- **浮动文本区域**: 可拖拽、便捷的浮动文本编辑区域
- **Cookie 管理**: 便捷的 Cookie 操作接口
- **数据库存储**: 本地数据持久化存储
- **请求处理**: 灵活的网络请求功能
- **同步功能**: 数据实时同步机制
- **时间线**: 内容历史记录查看
- **目录**: 快速导航功能

## 安装方式

### 方式一：Tampermonkey（推荐）

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 浏览器扩展
2. 点击 [安装脚本](https://raw.githubusercontent.com/libook7/hi-agent-user-script/main/hi-agent-user-script.user.js)
3. 在弹出的窗口中点击"安装"

### 方式二： Violentmonkey

1. 安装 [Violentmonkey](https://violentmonkey.github.io/) 浏览器扩展
2. 访问脚本页面，点击"安装"

## 使用说明

1. 安装完成后，访问支持的目标网站
2. 点击页面上的触发按钮激活功能
3. 根据需要使用各项功能

## 配置选项

脚本支持以下可配置项：

- `AUTO_SAVE_DURATION`: 自动保存间隔时间
- `AUTO_SAVE_DB_DURATION`: 数据库自动保存间隔
- `DEFAULT_WIDTH` / `DEFAULT_HEIGHT`: 浮动文本区域默认尺寸
- `SCROLL_TOLERANCE`: 滚动容差值

## 项目结构

```
hi-agent-user-script/
├── src/
│   ├── autosave.js       # 自动保存模块
│   ├── cookies.js        # Cookie 操作
│   ├── db.js             # 数据库存储
│   ├── floatingTextarea/ # 浮动文本区域
│   │   ├── event.js      # 事件处理
│   │   ├── index.js      # 主入口
│   │   ├── state.js      # 状态管理
│   │   ├── sync.js       # 同步功能
│   │   ├── timeline.js   # 时间线
│   │   ├── toc.js        # 目录
│   │   └── window.js     # 窗口管理
│   ├── index.js          # 主入口
│   ├── metadata.js       # 元数据
│   ├── request.js        # 网络请求
│   ├── style.js          # 样式
│   └── triggerButton.js  # 触发按钮
├── package.json
├── rollup.config.mjs
└── eslint.config.js
```

## 开发指南

### 环境要求

- Node.js 14+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建脚本

```bash
npm run build
```

### 代码规范

```bash
npm run lint
```

## 许可证

本项目采用 MIT 许可证。

## 贡献指南

欢迎提交 Issue 和 Pull Request。

## 反馈建议

如有问题或建议，请通过 Gitee 仓库提交 Issue。