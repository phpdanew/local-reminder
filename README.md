# 🚀 本地提醒器 (Local Reminder)

一个基于 **Electron** 的现代化本地提醒应用，提供简洁美观的界面和强大的提醒功能。极简风格，通过接口预留无限强大的扩展能力。

![应用截图](screen.png)

---

## ✨ 功能特性

- 🎨 **5套精美主题** - 极客、现代、深色、明亮、彩虹风格任选
- ⌨️ **快捷操作** - 支持回车键快速添加，Ctrl+T切换主题
- 🌐 **RESTful API** - 提供标准化的HTTP接口
- 📱 **响应式设计** - 适配不同屏幕尺寸
- 🔧 **智能配置** - 自动保存窗口位置、主题选择等个人设置
- 🚀 **跨平台支持** - 支持 macOS、Windows 和 Linux
- 💾 **通过自定义接口实现数据持久化和系统通知以及任何想要的功能

## 🚀 快速开始

### 环境要求

- **Node.js** 14.0 或更高版本
- **Python** 3.7 或更高版本
- **npm** 或 **yarn** 包管理器

### 安装步骤

1. **安装前端依赖**
   ```bash
   npm install
   ```

2. **安装Python依赖**
   ```bash
   pip install pync
   ```

3. **启动后端服务器**
   ```bash
   python server.py
   ```

4. **启动Electron应用**
   ```bash
   npm start
   ```

### 开发模式

```bash
# 启动开发模式
npm run dev
```

## 📖 使用指南

### 基本使用

1. **启动应用** - 运行 `npm start` 启动Electron应用
2. **输入提醒** - 在输入框中输入提醒内容
3. **添加提醒** - 点击"添加提醒"按钮或按回车键
4. **查看通知** - 系统会弹出原生通知提醒

### API接口

#### 添加提醒
```http
POST http://localhost:3333/api/reminders
Content-Type: application/json

{
  "text": "你的提醒内容",
  "timestamp": "2024-01-01T12:00:00"
}
```

## 🛠️ 技术栈

### 前端技术
- **Electron** - 跨平台桌面应用框架
- **HTML5** - 页面结构和语义化标签
- **CSS3** - 现代化样式和动画效果
- **JavaScript** - 交互逻辑和API调用

### 后端技术
- **Python** - 服务器端逻辑
- **HTTP Server** - 内置HTTP服务器
- **pync** - macOS系统通知库
- **JSON** - 数据交换格式

### 开发工具
- **npm** - 包管理和脚本运行
- **Git** - 版本控制

## 📁 项目结构

```
local-remider/
├── 📄 index.js              # Electron 主进程文件
├── 📄 index.html            # 主页面HTML文件
├── 📄 renderer.js           # 渲染进程脚本
├── 📄 themes.css            # 主题样式文件
├── 📄 theme-selector.html   # 主题选择器页面
├── 📄 config.js             # 配置管理器
├── 📄 config.example.json   # 配置示例文件
├── 📄 reminder-config.json  # 实际配置文件(运行时生成)
├── 📄 server/
│   ├── server.py           # Python后端服务器
│   └── plan.xlsx           # 数据存储文件
├── 📄 package.json          # 项目配置和依赖
└── 📄 README.md             # 项目说明文档
```

## 🎨 主题系统

应用支持5种精美主题，首次启动时会显示主题选择器：

- 🔥 **极客风格** (`hacker`) - 黑色+绿色终端风格
- 🌟 **现代简约** (`modern`) - 蓝紫渐变，默认主题
- 🌙 **深色优雅** (`dark`) - 深蓝灰商务风格  
- ☀️ **明亮清新** (`light`) - 蓝色系明亮风格
- 🌈 **彩虹渐变** (`rainbow`) - 动态彩虹背景

### 主题切换

- **快捷键**: `Ctrl/Cmd + T` 重新打开主题选择器
- **菜单**: 应用 → 选择主题...

## 🔧 配置说明

### 配置文件

应用会在根目录自动生成 `reminder-config.json` 配置文件：

```json
{
    "selectedTheme": "modern",        // 当前主题
    "windowSettings": {              // 窗口设置
        "width": 400,
        "height": 300,
        "x": 100,
        "y": 100
    },
    "reminders": {                   // 提醒设置
        "defaultDelay": 30,          // 默认延迟(分钟)
        "sound": true,               // 声音开关
        "notification": true         // 通知开关
    },
    "server": {                      // 服务器设置
        "port": 3333,               // 端口
        "autoStart": true           // 自动启动
    }
}
```

### 配置管理

- **打开配置**: 菜单 → 应用 → 打开配置文件
- **重置配置**: 菜单 → 应用 → 重置配置
- **手动编辑**: 直接编辑 `reminder-config.json` 文件，重启生效

### 服务器配置

在 `server/server.py` 中可以修改服务器端口：

```python
PORT = 3333  # 服务器端口
```

默认写入到server/plan.xlsx中，先将plan.example.xlsx复制并重命名为plan.xlsx
