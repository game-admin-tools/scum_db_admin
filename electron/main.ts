import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let splashWindow: BrowserWindow | null = null;

const isDev = process.env.NODE_ENV === 'development';

function createSplashWindow() {
    splashWindow = new BrowserWindow({
        width: 500,
        height: 300,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    const splashPath = isDev
        ? path.join(__dirname, '../public/splash.html')
        : path.join(__dirname, '../dist/splash.html');

    splashWindow.loadFile(splashPath);

    splashWindow.on('closed', () => {
        splashWindow = null;
    });
}

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        show: false, // Hidden initially, shown after splash
        backgroundColor: '#2e2e2e',
        title: 'SDA - SCUM DB Admin',
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false, // Disable sandbox to ensure preload works in all envs
        },
    });

    const devUrl = 'http://localhost:5173';
    const prodPath = path.join(__dirname, '../dist/index.html');

    if (isDev) {
        mainWindow.loadURL(devUrl);
    } else {
        mainWindow.loadFile(prodPath);
    }

    mainWindow.setMenu(null); // Hide menu bar completely

    // Always open devtools for debugging the white screen issue
    // mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createSplashWindow();
    createMainWindow();

    // Safety timeout: If React fails to load within 10 seconds, close splash and show main window (to see errors)
    setTimeout(() => {
        if (splashWindow && !splashWindow.isDestroyed()) {
            console.log('Safety timeout: Forcing splash close');
            splashWindow.close();
            if (mainWindow) mainWindow.show();
        }
    }, 10000);
});

ipcMain.on('app-ready', () => {
    if (splashWindow) {
        splashWindow.close();
    }
    if (mainWindow) {
        mainWindow.show();
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    }
});
