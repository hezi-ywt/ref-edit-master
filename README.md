## 项目简介

基于 Vite + React 的前端小工具项目，支持本地开发与 GitHub Pages 自动部署。

## 功能概览

- 本地开发热更新
- 生产构建与预览
- GitHub Actions 自动部署到 Pages

## 本地运行

**前置条件：** 已安装 Node.js（建议 18+）

1. 安装依赖：`npm install`
2. 启动开发：`npm run dev`
3. 打开浏览器访问：`http://localhost:3000`

## 构建与预览

- 构建：`npm run build`
- 本地预览构建产物：`npm run preview`

## GitHub Pages 自动部署

1. 将项目推送到 GitHub 仓库（默认分支为 `main`）。
2. 在仓库 Settings → Pages 中，将 **Build and deployment** 设置为 **GitHub Actions**。
3. 每次 push 到 `main` 会自动构建并部署，访问地址：  
   `https://<你的用户名>.github.io/<仓库名>/`
