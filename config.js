const fs = require('fs');
const path = require('path');
const { app } = require('electron');

class ConfigManager {
    constructor() {
        // 确定配置文件存放目录
        if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
            // 开发模式：使用项目根目录
            this.configDir = process.cwd();
        } else {
            // 生产模式：使用应用目录
            this.configDir = path.dirname(app.getPath('exe'));
        }
        
        this.configPath = path.join(this.configDir, 'reminder-config.json');
        console.log('配置文件路径:', this.configPath);
        
        this.defaultConfig = {
            selectedTheme: 'modern',
            firstLaunch: true,
            windowSettings: {
                width: 400,
                height: 300,
                x: null,
                y: null
            },
            themeSettings: {
                autoDetectSystemTheme: false,
                customThemes: []
            },
            reminders: {
                defaultDelay: 30,
                sound: true,
                notification: true
            },
            server: {
                port: 3333,
                autoStart: true
            },
            version: '1.0.0'
        };
        this.config = this.loadConfig();
    }

    // 加载配置文件
    loadConfig() {
        try {
            if (fs.existsSync(this.configPath)) {
                const configData = fs.readFileSync(this.configPath, 'utf8');
                const loadedConfig = JSON.parse(configData);
                
                // 合并默认配置和加载的配置，确保所有字段都存在
                return this.mergeConfig(this.defaultConfig, loadedConfig);
            }
        } catch (error) {
            console.error('读取配置文件失败:', error);
        }
        
        // 如果配置文件不存在或读取失败，返回默认配置
        return { ...this.defaultConfig };
    }

    // 深度合并配置对象
    mergeConfig(defaultConfig, userConfig) {
        const merged = { ...defaultConfig };
        
        for (const key in userConfig) {
            if (userConfig.hasOwnProperty(key)) {
                if (typeof userConfig[key] === 'object' && userConfig[key] !== null && !Array.isArray(userConfig[key])) {
                    merged[key] = this.mergeConfig(defaultConfig[key] || {}, userConfig[key]);
                } else {
                    merged[key] = userConfig[key];
                }
            }
        }
        
        return merged;
    }

    // 保存配置文件
    saveConfig() {
        try {
            // 确保配置目录存在
            if (!fs.existsSync(this.configDir)) {
                fs.mkdirSync(this.configDir, { recursive: true });
            }
            
            fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 4));
            console.log('配置保存成功:', this.configPath);
            return true;
        } catch (error) {
            console.error('保存配置失败:', error);
            return false;
        }
    }

    // 获取配置值
    get(key) {
        return this.getNestedValue(this.config, key);
    }

    // 设置配置值
    set(key, value) {
        this.setNestedValue(this.config, key, value);
        return this.saveConfig();
    }

    // 获取嵌套值 (支持 'theme.selectedTheme' 这样的路径)
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current && current[key], obj);
    }

    // 设置嵌套值
    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            return current[key];
        }, obj);
        target[lastKey] = value;
    }

    // 获取主题设置
    getSelectedTheme() {
        return this.get('selectedTheme');
    }

    // 设置主题
    setSelectedTheme(theme) {
        this.set('selectedTheme', theme);
        this.set('firstLaunch', false);
    }

    // 检查是否首次启动
    isFirstLaunch() {
        return this.get('firstLaunch');
    }

    // 获取窗口设置
    getWindowSettings() {
        return this.get('windowSettings');
    }

    // 保存窗口设置
    saveWindowSettings(bounds) {
        this.set('windowSettings.width', bounds.width);
        this.set('windowSettings.height', bounds.height);
        this.set('windowSettings.x', bounds.x);
        this.set('windowSettings.y', bounds.y);
    }

    // 获取服务器设置
    getServerSettings() {
        return this.get('server');
    }

    // 重置配置为默认值
    reset() {
        this.config = { ...this.defaultConfig };
        return this.saveConfig();
    }

    // 导出配置
    exportConfig(filePath) {
        try {
            fs.writeFileSync(filePath, JSON.stringify(this.config, null, 4));
            return true;
        } catch (error) {
            console.error('导出配置失败:', error);
            return false;
        }
    }

    // 导入配置
    importConfig(filePath) {
        try {
            if (fs.existsSync(filePath)) {
                const importedData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                this.config = this.mergeConfig(this.defaultConfig, importedData);
                return this.saveConfig();
            }
            return false;
        } catch (error) {
            console.error('导入配置失败:', error);
            return false;
        }
    }

    // 获取配置文件路径
    getConfigPath() {
        return this.configPath;
    }

    // 获取完整配置对象（只读）
    getAllConfig() {
        return { ...this.config };
    }
}

module.exports = ConfigManager;