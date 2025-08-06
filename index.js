const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const ConfigManager = require('./config');

let mainWindow;
let themeSelectorWindow;
let configManager;

// 创建主题选择器窗口
function createThemeSelectorWindow() {
  // 如果主题选择器已经存在，直接显示并聚焦
  if (themeSelectorWindow && !themeSelectorWindow.isDestroyed()) {
    themeSelectorWindow.show();
    themeSelectorWindow.focus();
    return themeSelectorWindow;
  }

  const options = {
    width: 800,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    show: false,
    titleBarStyle: 'hidden',
    title: '选择主题 - 本地提醒器',
    resizable: false,
    modal: false, // 改为非模态，避免父窗口依赖问题
    center: true
  };

  // 如果主窗口存在，设置为子窗口
  if (mainWindow && !mainWindow.isDestroyed()) {
    options.parent = mainWindow;
    options.modal = true;
  }

  themeSelectorWindow = new BrowserWindow(options);

  themeSelectorWindow.loadFile('theme-selector.html');

  themeSelectorWindow.once('ready-to-show', () => {
    themeSelectorWindow.show();
    themeSelectorWindow.focus();
  });

  themeSelectorWindow.on('closed', () => {
    themeSelectorWindow = null;
  });

  // 开发模式下打开开发者工具
  if (process.env.NODE_ENV === 'development') {
    themeSelectorWindow.webContents.openDevTools();
  }

  return themeSelectorWindow;
}

function createWindow() {
  // 如果主窗口已经存在，直接显示并聚焦
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.show();
    mainWindow.focus();
    return mainWindow;
  }

  // 获取窗口设置
  const windowSettings = configManager.getWindowSettings();
  
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: windowSettings.width || 400,
    height: windowSettings.height || 300,
    x: windowSettings.x,
    y: windowSettings.y,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'assets/icon.png'), // 可选：应用图标
    show: false, // 先不显示窗口
    titleBarStyle: 'hidden',
    title: '本地提醒器',
    trafficLightPosition: { x: 10, y: 10 }
  });

  // 加载应用的 index.html
  mainWindow.loadFile('index.html');

  // 当窗口准备好显示时再显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // 只在开发模式下打开开发者工具
    if (process.env.NODE_ENV === 'development') {
      mainWindow.webContents.openDevTools();
    }
  });

  // 保存窗口位置和大小
  mainWindow.on('moved', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      configManager.saveWindowSettings(mainWindow.getBounds());
    }
  });

  mainWindow.on('resized', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      configManager.saveWindowSettings(mainWindow.getBounds());
    }
  });

  // 当窗口关闭时触发
  mainWindow.on('closed', () => {
    mainWindow = null;
    // 在 macOS 上，当所有窗口都关闭时，应用通常会保持活跃状态
    // 直到用户使用 Cmd + Q 明确退出
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  // 创建菜单
  createMenu();

  return mainWindow;
}

// 初始化应用
function initializeApp() {
  // 初始化配置管理器
  configManager = new ConfigManager();
  
  // 如果是首次启动，显示主题选择器
  if (configManager.isFirstLaunch()) {
    createThemeSelectorWindow();
  } else {
    // 直接创建主窗口
    createWindow();
  }
}

// 添加菜单和快捷键支持
function createMenu() {
  const template = [
    {
      label: '应用',
      submenu: [
        {
          label: '选择主题...',
          accelerator: 'CmdOrCtrl+T',
          click: () => {
            createThemeSelectorWindow();
          }
        },
        { type: 'separator' },
        {
          label: '打开配置文件',
          click: () => {
            const { shell } = require('electron');
            shell.showItemInFolder(configManager.getConfigPath());
          }
        },
        {
          label: '重置配置',
          click: () => {
            const { dialog } = require('electron');
            const choice = dialog.showMessageBoxSync(mainWindow, {
              type: 'question',
              buttons: ['取消', '重置'],
              defaultId: 0,
              title: '重置配置',
              message: '确定要重置所有配置到默认设置吗？',
              detail: '这将清除您的主题选择、窗口位置等所有自定义设置。'
            });
            
            if (choice === 1) {
              configManager.reset();
              dialog.showMessageBoxSync(mainWindow, {
                type: 'info',
                title: '重置完成',
                message: '配置已重置为默认设置。',
                detail: '请重启应用以使更改生效。'
              });
            }
          }
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: '开发',
      submenu: [
        {
          label: '重新加载',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            if (mainWindow) {
              mainWindow.reload();
            }
          }
        },
        {
          label: '开发者工具',
          accelerator: 'CmdOrCtrl+Shift+I',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.toggleDevTools();
            }
          }
        }
      ]
    }
  ];
  
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC事件处理
ipcMain.on('theme-selected', (event, theme) => {
  console.log('收到主题选择:', theme);
  
  // 保存主题到配置
  configManager.setSelectedTheme(theme);
  
  // 关闭主题选择器
  if (themeSelectorWindow && !themeSelectorWindow.isDestroyed()) {
    themeSelectorWindow.close();
  }
  
  // 如果主窗口不存在，创建它
  if (!mainWindow || mainWindow.isDestroyed()) {
    createWindow();
  } else {
    // 如果主窗口已存在，刷新主题
    mainWindow.webContents.send('theme-changed', theme);
  }
});

ipcMain.on('close-theme-selector', () => {
  if (themeSelectorWindow && !themeSelectorWindow.isDestroyed()) {
    themeSelectorWindow.close();
  }
  
  // 如果没有主窗口，退出应用
  if (!mainWindow || mainWindow.isDestroyed()) {
    app.quit();
  }
});

// 获取当前配置的IPC处理
ipcMain.handle('get-config', () => {
  return configManager.getAllConfig();
});

ipcMain.handle('get-selected-theme', () => {
  return configManager.getSelectedTheme();
});

// 当 Electron 完成初始化并准备创建浏览器窗口时调用此方法
app.whenReady().then(initializeApp);

// 当所有窗口都关闭时退出应用
app.on('window-all-closed', () => {
  // 在 macOS 上，当所有窗口都关闭时，应用通常会保持活跃状态
  // 直到用户使用 Cmd + Q 明确退出
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // 在 macOS 上，当点击 dock 图标并且没有其他窗口打开时，
  // 通常会在应用程序中重新创建一个窗口
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});