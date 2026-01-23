# Ref-Edit Master 🎨

<div align="center">

**专业的图像编辑数据集制作工具**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19.2.3-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178c6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646cff.svg)](https://vitejs.dev/)

[在线体验](https://hezi-ywt.github.io/ref-edit-master/) | [功能演示](#功能特性) | [快速开始](#快速开始)

</div>

---

## 📖 项目简介

Ref-Edit Master 是一个基于 React + TypeScript 的图像编辑数据集制作工具，专为 AI 图像编辑模型的评测数据集构建而设计。支持多文本指令变体、参考图管理、目标结果对比，以及完整的数据包导入导出功能。

### 适用场景

- 🎯 AI 图像编辑模型评测数据集制作
- 📊 多模型结果对比与标注
- 🔄 Prompt 变体测试与管理
- 📦 数据集版本管理与分享

---

## ✨ 功能特性

### 核心功能

- 📝 **多文本指令变体** - 支持为同一编辑任务添加多个不同表达的指令文本
- 🖼️ **参考图管理** - 拖拽上传、预览、删除参考素材图片
- 🎯 **目标结果对比** - 上传多个模型的输出结果并标注模型名称
- 📦 **数据包管理** - 导入/导出完整的数据集 ZIP 包，支持版本控制
- 🔄 **格式兼容** - 自动兼容新旧数据格式，无缝迁移

### 用户体验

- 🌓 **深色/浅色主题** - 根据使用习惯切换主题
- 🌍 **中英文切换** - 支持中文和英文界面
- 📱 **移动端适配** - 响应式设计，完美支持手机和平板
- 🔍 **图片预览** - 点击图片全屏查看细节
- 📋 **指令克隆** - 快速复制指令条目，提高效率

### 数据管理

- 🏷️ **任务分类** - 预设多种编辑任务类型（风格迁移、物体替换等）
- 📊 **结构预览** - 实时查看数据结构的 JSON 预览
- ✅ **数据校验** - 导出前自动检查必填字段
- 💾 **自动保存提示** - 避免数据丢失

---

## 🚀 快速开始

### 在线使用

直接访问 [在线演示](https://hezi-ywt.github.io/ref-edit-master/)，无需安装即可使用。

### 本地运行

#### 前置条件

- Node.js 18.0 或更高版本
- npm 或 pnpm

#### 安装步骤

```bash
# 克隆项目
git clone https://github.com/hezi-ywt/ref-edit-master.git
cd ref-edit-master

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 `http://localhost:3000` 即可使用。

---

## 📘 使用指南

### 1️⃣ 创建新指令

1. 点击页面底部的 **"添加新指令条目"** 或右上角的 **"添加指令"** 按钮
2. 在 **"指令内容"** 区域输入编辑指令
3. 点击 **"添加变体"** 按钮可添加同一意思的不同表达方式

<details>
<summary>💡 为什么需要多个文本变体？</summary>

同一个编辑意图可以用不同的方式表达，例如：
- "将背景改为赛博朋克风格的城市夜景"
- "把背景换成赛博朋克城市的夜晚场景"
- "背景替换：赛博朋克都市夜景"

多个变体可以帮助测试模型对不同表达的理解能力。
</details>

### 2️⃣ 上传参考图

1. 在 **"参考素材"** 区域点击 **"添加"** 按钮，或直接拖拽图片到该区域
2. 支持批量上传多张参考图
3. 点击图片可全屏预览，点击删除图标移除

### 3️⃣ 设置任务信息

1. **任务范围** - 从下拉菜单选择或自定义输入任务类型
2. **目的/目标** - 描述这个测试案例的目的（如"测试主体人物的一致性保持"）

### 4️⃣ 上传目标结果

1. 在 **"目标结果"** 区域上传不同模型的输出图片
2. 为每张图片填写对应的 **模型名称**（支持自动补全）
3. 支持预设模型名称：nanobanana、qwen-image-edit、seedream

### 5️⃣ 导出数据包

1. 确保所有目标结果都填写了模型名称
2. 点击右上角 **"导出数据包"** 按钮
3. 系统会生成并下载一个 ZIP 文件

### 6️⃣ 导入数据包

- 点击右上角 **"导入"** 按钮选择 ZIP 文件
- 或直接将 ZIP 文件拖拽到页面中央区域
- 自动加载所有数据，包括图片、指令和标注

---

## 📦 数据格式说明

### 导出的 ZIP 包结构

```
RefEdit_Dataset_2024-01-23/
├── dataset_summary.json          # 数据集摘要
├── case_01/                      # 第一个测试案例
│   ├── metadata.json            # 案例元数据
│   ├── ref_1.png                # 参考图 1
│   ├── ref_2.png                # 参考图 2
│   ├── target_1.png             # 目标结果 1
│   └── target_2.png             # 目标结果 2
├── case_02/                      # 第二个测试案例
│   ├── metadata.json
│   ├── ref_1.png
│   └── target_1.png
└── ...
```

### metadata.json 格式

```json
{
  "id": "unique-case-id",
  "prompts": [
    "将背景改为赛博朋克风格的城市夜景",
    "把背景换成赛博朋克城市的夜晚场景"
  ],
  "scope": "Style Transfer (风格迁移)",
  "purpose": "测试背景替换时主体人物的一致性保持",
  "references": ["ref_1.png", "ref_2.png"],
  "targets": ["target_1.png", "target_2.png"],
  "target_models": [
    { "file": "target_1.png", "model": "nanobanana" },
    { "file": "target_2.png", "model": "qwen-image-edit" }
  ]
}
```

### 版本兼容性

- ✅ **新格式** - 使用 `prompts: string[]` 支持多文本变体
- ✅ **旧格式** - 自动识别 `prompt: string` 并转换为数组
- ✅ **向后兼容** - 导入旧数据包时自动升级格式

---

## 🛠️ 技术栈

- **框架**: React 19.2.3
- **语言**: TypeScript 5.8.2
- **构建工具**: Vite 6.2.0
- **样式**: Tailwind CSS
- **压缩**: JSZip 3.10.1
- **部署**: GitHub Pages

---

## 🎯 预设任务类型

系统内置了常见的图像编辑任务分类：

- 🎨 **Style Transfer** (风格迁移)
- 🔄 **Object Replacement** (物体替换)
- 👤 **Character Reference** (角色参考)
- 🌍 **Worldview & Scenario** (世界观与场景)
- ✍️ **Text & Layout** (文字与排版)
- 📚 **Comics/Manga** (漫画/分镜生成)
- 🎓 **Corner Cases** (高难度综合题)

支持自定义输入其他任务类型。

---

## 💻 开发指南

### 项目结构

```
ref-edit-master/
├── App.tsx                   # 主应用组件
├── components/               # 组件目录
│   ├── AnnotationPanel.tsx  # 标注面板组件
│   ├── ReferencePool.tsx    # 图片池组件
│   └── Icons.tsx            # 图标组件
├── types.ts                 # TypeScript 类型定义
├── index.tsx                # 应用入口
├── index.html               # HTML 模板
└── vite.config.ts           # Vite 配置
```

### 开发命令

```bash
# 开发模式（热更新）
npm run dev

# 生产构建
npm run build

# 预览构建产物
npm run preview
```

### 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📝 更新日志

### v2.0.0 (2024-01-23)

- ✨ 新增多文本指令变体功能
- 🎨 优化 UI 显示和移动端适配
- 🐛 修复模型名称显示截断问题
- 📦 改进数据导入导出逻辑
- 🌐 完善中英文国际化

### v1.0.0 (2024-01-20)

- 🎉 首次发布
- 📝 支持指令和参考图管理
- 🎯 支持目标结果和模型标注
- 📦 实现数据包导入导出

---

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源协议。

---

## 🤝 致谢

感谢所有贡献者和使用者对本项目的支持！

---

<div align="center">

**如果这个项目对你有帮助，请给一个 ⭐️ Star！**

Made with ❤️ by [hezi-ywt](https://github.com/hezi-ywt)

</div>
