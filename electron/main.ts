import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { autoUpdater } from 'electron-updater';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let splashWindow: BrowserWindow | null = null;

const isDev = process.env.NODE_ENV === 'development';

// -- Auto Updater Config --
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

function createSplashWindow() {
    // ... (existing splash window creation)
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
    if (mainWindow) return; // Prevent multiple main windows

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

function closeSplashAndShowMain() {
    if (splashWindow && !splashWindow.isDestroyed()) {
        splashWindow.close();
    }
    if (mainWindow) {
        mainWindow.show();
    } else {
        createMainWindow();
        if (mainWindow) {
            (mainWindow as BrowserWindow).show();
        }
    }
}

// -- Auto Updater Events --

autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info);
    if (splashWindow && !splashWindow.isDestroyed()) {
        // Keep splash open or hide it? Let's hide it to show dialog clearly if it was on top
        // splashWindow.hide(); 
        // Actually dialog shows over app usually.
    }

    dialog.showMessageBox({
        type: 'info',
        title: 'Update Available',
        message: `A new version (${info.version}) is available.`,
        detail: `Current version: ${app.getVersion()}\nDo you want to update now?`,
        buttons: ['Yes', 'No'],
        defaultId: 0,
        cancelId: 1
    }).then((result) => {
        if (result.response === 0) {
            // Yes
            autoUpdater.downloadUpdate();
        } else {
            // No
            closeSplashAndShowMain();
        }
    });
});

autoUpdater.on('update-not-available', () => {
    console.log('Update not available');
    closeSplashAndShowMain();
});

autoUpdater.on('error', (err) => {
    console.error('AutoUpdater Error:', err);
    // On error, proceed to app
    closeSplashAndShowMain();
});

autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
        type: 'info',
        title: 'Update Ready',
        message: 'Update downloaded. The application will now restart to install.',
        buttons: ['OK']
    }).then(() => {
        autoUpdater.quitAndInstall();
    });
});


app.whenReady().then(() => {
    createSplashWindow();
    createMainWindow(); // Create it but keep it hidden

    if (!isDev) {
        // In production, check for updates
        // This acts as the gatekeeper.
        console.log('Checking for updates...');
        autoUpdater.checkForUpdates();
    } else {
        // In dev, skip update check and show main window (simulated delay for splash)
        setTimeout(() => {
            closeSplashAndShowMain();
        }, 2000);
    }

    // Safety timeout: If update check hangs or fails silently
    setTimeout(() => {
        if (splashWindow && !splashWindow.isDestroyed()) {
            console.log('Safety timeout: Forcing splash close');
            closeSplashAndShowMain();
        }
    }, 15000); // Increased timeout to allow for update check
});

// React app readiness signal - we can ignore it or use it to ensure window is ready
// But now the flow is controlled by AutoUpdater
ipcMain.on('app-ready', () => {
    // We might be waiting for update check.
    // If the update check is fast, we might be here already.
    // If update check is pending, do nothing?
    // Let's assume AutoUpdater controls the Splash -> Main transition in Prod.
    // In Dev, the timeout handles it.

    // If we decide to use this signal, we need to know if we are blocked by update.
    // For simplicity, let's rely on AutoUpdater callbacks to show the window.
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
