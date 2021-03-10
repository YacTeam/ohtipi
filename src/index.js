// ohtipi

const {
    app,
    Tray,
    BrowserWindow,
    Menu,
    ipcMain,
    nativeImage,
    clipboard,
    screen
} = require("electron");
const {
    autoUpdater
} = require("electron-updater");
const AutoLaunch = require('auto-launch');
const path = require("path");
const permissions = require("node-mac-permissions");
const imessage = require("osa-imessage");
const otpRegex = new RegExp("[0-9a-zA-Z]*[0-9]+[0-9a-zA-Z]*");
const singleInstanceLock = app.requestSingleInstanceLock();
const copyIconNativeImage = nativeImage.createFromPath(path.join(app.getAppPath(), `./assets/tray/CopyTemplate.png`));
const trayIconPath = path.join(app.getAppPath(), `./assets/tray/IconTemplate.png`);
const autoLaunchHelper = new AutoLaunch({
    name: 'Ohtipi'
});

let autoStartEnabled = false;
let onboardingWindow;
let overlayWindow;
let tray;
let hasAcceptableSystemPermissions = false;
let otpHistory = [];
let autoUpdaterState = {};

const getAutoStartState = () => {
    autoLaunchHelper.isEnabled()
        .then(function (isEnabled) {
            autoStartEnabled = isEnabled ? true : false;
            updateTrayContextMenu();
        })
        .catch(function (err) {
            autoStartEnabled = false;
            console.error(err);
            updateTrayContextMenu();
        });
}

const setOverlayWindowPosition = () => {
    const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
    if (overlayWindow && display) {
        overlayWindow.setPosition(10, display.workAreaSize.height - 80)
    }
};

const toggleAppAutoStart = () => {
    autoLaunchHelper.isEnabled()
        .then(function (isEnabled) {
            autoStartEnabled = isEnabled;
            if (!autoStartEnabled) {
                autoLaunchHelper.enable().then(() => {
                    autoStartEnabled = true;
                    updateTrayContextMenu();
                })
            } else {
                autoLaunchHelper.disable().then(() => {
                    autoStartEnabled = false;
                    updateTrayContextMenu();
                })
            }
        }).catch(() => {
            autoStartEnabled = false;
            updateTrayContextMenu();
        })
}

const copyToClipboard = (text) => {
    if (overlayWindow) overlayWindow.webContents.send("otpCode", text)
    clipboard.writeText(text, "selection");
}

const buildOTPHistorySubMenu = () => {
    const generateLabel = (otp) => {
        return `${otp}`
    }

    return [
        otpHistory[0] ? {
            label: "Recent",
            enabled: false,
        } : null,
        otpHistory[0] ? {
            label: generateLabel(otpHistory[0]),
            enabled: true,
            icon: copyIconNativeImage,
            click: () => {
                copyToClipboard(otpHistory[0])
            }
        } : null,
        otpHistory[1] ? {
            label: otpHistory[1],
            enabled: true,
            icon: copyIconNativeImage,
            click: () => {
                copyToClipboard(otpHistory[1])
            }
        } : null,
        otpHistory[2] ? {
            label: otpHistory[2],
            enabled: true,
            icon: copyIconNativeImage,
            click: () => {
                copyToClipboard(otpHistory[2])
            }
        } : null,
        {
            type: "separator"
        },
    ].filter(x => x !== null)
}

const buildContextMenu = (opts = {
    status: false
}) => {

    let template = [{
            label: hasAcceptableSystemPermissions ? `🟢 Connected to iMessage` : `⚠️ Setup Ohtipi`,
            enabled: !hasAcceptableSystemPermissions,
            click: () => {
                if (!onboardingWindow) {
                    createOnboardingWindow();
                } else {
                    onboardingWindow.show();
                }
            }
        },
        {
            type: "separator"
        },
        ...buildOTPHistorySubMenu(),
        {
            label: "Open at Login",
            type: "checkbox",
            checked: autoStartEnabled,
            click: () => {
                toggleAppAutoStart();
            }
        },
        {
            label: "Quit Ohtipi",
            enabled: true,
            click: () => {
                app.quit();
            }
        },
    ]

    if (autoUpdaterState && autoUpdaterState.status && autoUpdaterState.status === "update-available") {
        template.unshift({
            label: "⏳ Update Available",
            enabled: false,
        })
    }

    if (autoUpdaterState && autoUpdaterState.status && autoUpdaterState.status === "download-progress") {
        template.unshift({
            label: "⏳ Downloading Update: " + autoUpdaterState.percent + "%",
            enabled: false,
        })
    }

    if (autoUpdaterState && autoUpdaterState.status && autoUpdaterState.status === "update-downloaded") {
        template.unshift({
            label: "⌛️ Update Downloaded, Restart App",
            enabled: true,
            click: () => {
                autoUpdater.quitAndInstall();
            }
        })
    }

    return Menu.buildFromTemplate(template)
}

const createOnboardingWindow = () => {
    onboardingWindow = new BrowserWindow({
        width: 800,
        height: 600,
        resizable: false,
        show: false,
        webPreferences: {
            enableRemoteModule: true,
            preload: path.join(__dirname, "./preload.js"),
        }
    });

    onboardingWindow.loadURL("file://" + __dirname + "/onboarding.html");

    onboardingWindow.webContents.on('did-finish-load', function () {
        onboardingWindow.show();
    });

    onboardingWindow.on("closed", function () {
        onboardingWindow = null;
    });
}

const createOverlayWindow = async () => {
    overlayWindow = new BrowserWindow({
        width: 300,
        height: 150,
        resizable: false,
        movable: false,
        enableLargerThanScreen: true,
        removeMenu: true,
        transparent: true,
        show: false,
        hasShadow: false,
        frame: false,
        webPreferences: {
            enableRemoteModule: true,
            preload: path.join(__dirname, "./preload.js"),
        }
    });

    overlayWindow.loadURL("file://" + __dirname + "/overlay.html");

    // this is a very, very specific order.
    // there's a lot of electron-related bugs
    // with always-on-top windows.
    // start specific order:
    overlayWindow.setVisibleOnAllWorkspaces(true);
    overlayWindow.setAlwaysOnTop(true, "screen-saver", 1);
    overlayWindow.setIgnoreMouseEvents(true);

    overlayWindow.webContents.on('did-finish-load', function () {
        app.dock.hide();
        overlayWindow.show();
        setTimeout(() => {
            overlayWindow.blur();
        }, 100)
    });
    // end specific order.

    overlayWindow.on("closed", function () {
        overlayWindow = null;
    });
}

const obtainFullDiskAccess = () => {
    return new Promise(async (res, rej) => {
        const hasFullDiskAccess = permissions.getAuthStatus("full-disk-access") === "authorized";
        if (!hasFullDiskAccess) {
            hasAcceptableSystemPermissions = false;
            return rej(false);
        } else {
            hasAcceptableSystemPermissions = true;
            updateTrayContextMenu();
            return res(true);
        }
    })
}

const createIpcHandlers = () => {
    ipcMain.on("request", (event, arg) => {
        if (arg == "enable-auto-start") {
            autoLaunchHelper.enable();
        }
        if (arg == "disable-auto-start") {
            autoLaunchHelper.disable();
        }
        if (arg == "open-full-disk-access") {
            permissions.askForFullDiskAccess();
        }
        if (arg == "close-onboarding") {
            if (onboardingWindow) {
                ensureSafeQuitAndInstall();
                app.relaunch();
                app.exit();
            }
        }
    })
}

const createTray = () => {
    if (tray) tray = null;
    tray = new Tray(trayIconPath);
    tray.setToolTip("Ohtipi");
    updateTrayContextMenu();
}

const updateTrayContextMenu = () => {
    tray.setContextMenu(buildContextMenu({
        status: hasAcceptableSystemPermissions
    }));
}

const handleIncomingOTP = (attr) => {
    const otpString = attr.otpRaw.toString();
    otpHistory.unshift(otpString);
    setOverlayWindowPosition();
    copyToClipboard(otpString);
    updateTrayContextMenu();
}

const handleIncomingiMessage = (msg) => {
    if (msg.fromMe) return;
    const hasOTP = msg.text.match(otpRegex);
    if (hasOTP) {
        handleIncomingOTP({
            otpRaw: hasOTP[0].trim(),
            originalMessage: msg.text,
            originalSender: msg.handle
        });
    }
}

const listenToiMessage = () => {
    imessage.listen().on("message", handleIncomingiMessage);
}

const setAutoUpdaterUiState = (state) => {
    autoUpdaterState = {
        status: state.status || "update-not-available",
        percent: state.percent ? Math.round(state.percent) : 0
    }
    updateTrayContextMenu();
}

const ensureSafeQuitAndInstall = () => {
    try {
        const electron = require("electron");
        const app = electron.app;
        const BrowserWindow = electron.BrowserWindow;
        if (tray) tray.destroy();
        tray = null;
        app.removeAllListeners("window-all-closed");
        let browserWindows = BrowserWindow.getAllWindows();
        browserWindows.forEach(function (browserWindow) {
            browserWindow.removeAllListeners("close");
        });
    } catch (e) {
        console.log(e);
    }
}

const initAutoUpdater = () => {
    autoUpdater.on("update-available", (e) => {
        setAutoUpdaterUiState({
            status: "update-available",
        });
    });

    autoUpdater.on("checking-for-update", (e) => {
        setAutoUpdaterUiState({
            status: "checking-for-update",
        });
    });

    autoUpdater.on("update-not-available", (e) => {
        setAutoUpdaterUiState({
            status: "update-not-available",
        });
    });

    autoUpdater.on("download-progress", (e) => {
        setAutoUpdaterUiState({
            status: "download-progress",
            percent: e.percent
        });
    });

    autoUpdater.on("update-downloaded", (e) => {
        setAutoUpdaterUiState({
            status: "update-downloaded",
        });
    });

    autoUpdater.on("before-quit-for-upgrade", (e) => {
        setAutoUpdaterUiState({
            status: "before-quit-for-upgrade",
        });

        ensureSafeQuitAndInstall();
        app.isQuiting = true;
    });

    autoUpdater.checkForUpdates();

    setInterval(() => {
        autoUpdater.checkForUpdates();
    }, 60000 * 5);
}

if (!singleInstanceLock) {
    app.quit();
}

app.on("ready", function () {
    createIpcHandlers();
    createTray();
    initAutoUpdater();
    obtainFullDiskAccess()
        .then(() => {
            getAutoStartState();
            createOverlayWindow();
            setOverlayWindowPosition();
            listenToiMessage();
        })
        .catch(() => {
            createOnboardingWindow();
        })
});