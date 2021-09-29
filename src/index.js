const {
    app,
    Tray,
    BrowserWindow,
    Menu,
    ipcMain,
    nativeImage,
    clipboard,
    screen,
    dialog,
    globalShortcut
} = require("electron");
const {
    autoUpdater
} = require("electron-updater");
const AutoLaunch = require('auto-launch');
const path = require("path");
const permissions = require("node-mac-permissions");

const imessage = require("./libs/imessage");
const parse = require("./libs/parse-otp-message");
const config = require("./config.js");

const singleInstanceLock = app.requestSingleInstanceLock();
const copyIconNativeImage = nativeImage.createFromPath(path.join(app.getAppPath(), `./assets/tray/CopyTemplate.png`));
const trayIconPath = path.join(app.getAppPath(), `./assets/tray/IconTemplate.png`);
const isDevelopment = process && process.env && process.env.NODE_ENV === 'true';
const autoLaunchHelper = new AutoLaunch({
    name: 'Ohtipi'
});

// setapp integration (set in config.js)
const {
    Setapp
} = require("./setapp.js");
Setapp.init();

let autoStartEnabled = false;
let onboardingWindow;
let overlayWindow;
let tray;
let hasAcceptableSystemPermissions = false;
let otpHistory = [];
let autoUpdaterState = {};
let iMessageConnectionAttempts = 0;
let trayTitleTimeout = null;

const handleCriticalError = (err) => {
    console.log(err)
}

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
        overlayWindow.setPosition(config.overlay.offset.x, display.workAreaSize.height - config.overlay.offset.y)
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

const formatServiceName = (serviceName) => {
    if (!serviceName || serviceName.length < 1) return "";
    function capitalizeTheFirstLetterOfEachWord(words) {
        var separateWord = words.toLowerCase().split(' ');
        for (var i = 0; i < separateWord.length; i++) {
            separateWord[i] = separateWord[i].charAt(0).toUpperCase() +
                separateWord[i].substring(1);
        }
        return separateWord.join(' ');
    }
    return capitalizeTheFirstLetterOfEachWord(serviceName);
}

const triggerAboutDialog = () => {
    const options = {
        type: 'info',
        buttons: ['Dismiss'],
        defaultId: 0,
        title: config.text.credit_window_title,
        message: 'Ohtipi v.' + require("./package.json").version,
        detail: config.text.credits,
    };

    dialog.showMessageBox(null, options, () => { });
}

const resyncMessages = (options = {
    silently: false
}) => {
    tray.closeContextMenu();

    imessage.getRecentMessages().then(chats => {
        otpHistory = [];
        temporarilySetTrayTitle("Synced!");

        chats.forEach((chat, chatIndex) => {
            handleIncomingiMessage({
                ...chat,
                resync: !options.silently ? chatIndex !== chats.length - 1 : true
            });
        });
    })
}

const buildOTPHistorySubMenu = () => {
    const generateLabel = (otpObject) => {
        return config.text.history_item_template
            .replace("<service>", otpObject.service)
            .replace("<code>", otpObject.code);
    }

    const generateHistoryItem = (otpObject) => {
        return {
            label: generateLabel(otpObject),
            enabled: true,
            icon: copyIconNativeImage,
            click: () => {
                copyToClipboard(otpObject.code)
            }
        }
    }

    return [
        otpHistory[0] ? {
            label: config.text.recent_label,
            enabled: false,
        } : null,
        otpHistory[0] ? generateHistoryItem(otpHistory[0]) : null,
        otpHistory[1] ? generateHistoryItem(otpHistory[1]) : null,
        otpHistory[2] ? generateHistoryItem(otpHistory[2]) : null,
        {
            type: "separator"
        },
    ].filter(x => x !== null)

}

const buildContextMenu = (opts = {
    status: false
}) => {

    let template = [{
        label: hasAcceptableSystemPermissions ? config.text.connected_string : config.text.error_string,
        enabled: !hasAcceptableSystemPermissions,
        type: "normal",
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
        label: config.text.resync,
        enabled: hasAcceptableSystemPermissions,
        accelerator: config.shortcuts.resync_and_copy,
        registerAccelerator: false,
        toolTip: config.text.resync_and_copy_tooltip,
        click: () => {
            resyncMessages();
        }
    },
    {
        label: config.text.open_at_login_label,
        type: "checkbox",
        checked: autoStartEnabled,
        toolTip: config.text.open_at_login_tooltip,
        click: () => {
            toggleAppAutoStart();
        }
    },
    {
        label: config.text.quit_label,
        enabled: true,
        accelerator: 'CommandOrControl+Q',
        acceleratorWorksWhenHidden: false,
        registerAccelerator: false,
        click: (menuItem, browserWindow, event) => {
            if (event.shiftKey)
                return triggerAboutDialog();
            app.quit();
        }
    },
    ]

    if (autoUpdaterState && autoUpdaterState.status && autoUpdaterState.status === "update-available") {
        template.unshift({
            label: config.text.update_available,
            enabled: false,
        })
    }

    if (autoUpdaterState && autoUpdaterState.status && autoUpdaterState.status === "download-progress") {
        template.unshift({
            label: config.text.download_progress + " " + autoUpdaterState.percent + "%",
            enabled: false,
        })
    }

    if (autoUpdaterState && autoUpdaterState.status && autoUpdaterState.status === "update-downloaded") {
        template.unshift({
            label: config.text.update_downloaded,
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
            contextIsolation: false,
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
            contextIsolation: false,
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

const createGlobalShortcut = () => {
    app.whenReady().then(() => {
        globalShortcut.register(config.shortcuts.resync_and_copy, () => {
            resyncMessages();
        })
    })

    app.on('will-quit', () => {
        globalShortcut.unregister(config.shortcuts.resync_and_copy)
        globalShortcut.unregisterAll()
    })
}

const createTray = () => {
    if (tray) tray = null;
    tray = new Tray(trayIconPath);
    updateTrayContextMenu();
}

const updateTrayContextMenu = () => {
    tray.setContextMenu(buildContextMenu({
        status: hasAcceptableSystemPermissions
    }));
}

const temporarilySetTrayTitle = (text) => {
    const set = (t) => tray.setTitle(t.toString());
    if (trayTitleTimeout) clearTimeout(trayTitleTimeout);
    if (text === null) return set("")
    set(text);
    trayTitleTimeout = setTimeout(() => {
        set("");
    }, config.timeouts.tray_title_ms)
}


const handleIncomingOTP = (otpObject) => {
    otpHistory.unshift({
        ...otpObject,
        resync: false
    });

    if (!otpObject.resync) {
        setOverlayWindowPosition();
        copyToClipboard(otpObject.code);
    }

    updateTrayContextMenu();
}

const parseOTP = (messageString) => {
    return new Promise((res, rej) => {
        if (!messageString || messageString.length < 3) return;
        const result = parse(messageString);
        if (result && result.code && result.service) {
            return res(result);
        }
        return rej(false)
    })
}

const isBodyValidPerCustomBlacklist = (body) => {
    // basic filtering
    if (!body || !body.length) return false;
    if (body.length < 5) return false;

    // currency filtering
    if (body.includes("$")) return false;
    if (body.includes("€")) return false;
    if (body.includes("₹")) return false;
    if (body.includes("¥")) return false;

    return true;
}

const handleIncomingiMessage = async (msg) => {
    if (msg.fromMe) return;
    const body = msg.text;

    if (!isBodyValidPerCustomBlacklist(body)) return;

    parseOTP(body).then((parsed) => {
        handleIncomingOTP({
            code: parsed.code,
            service: formatServiceName(parsed.service),
            originalMessage: msg.text,
            originalSender: msg.handle,
            resync: msg.resync
        });
    }).catch((e) => {
        return;
    })
}

const handleiMessageError = (e) => {
    console.error("handleiMessageError: ", e);
    setTimeout(() => {
        if (iMessageConnectionAttempts > config.imessage.max_connection_attempts_per_session) return;
        iMessageConnectionAttempts++;
        listenToiMessage();
    }, config.imessage.connection_wait_ms);
}

const listenToiMessage = () => {
    imessage
        .listen()
        .on("message", handleIncomingiMessage)
        .on("error", handleiMessageError)
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
    // disable autoupdater if setapp is active
    if (Setapp.isActive) return;
    if (isDevelopment) return;

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
    createGlobalShortcut();
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
        .catch((err) => {
            if (!err) {
                // show users window to help grant ohtipi privileges
                return createOnboardingWindow();
            }
            // if we've reached this line, then
            // we're catching something non-full-disk-access related
            // and should be treated as app-breaking error
            handleCriticalError(err);
        })
});

app.on('will-quit', () => {
    tray.destroy();
    tray = null;
})

process.on('unhandledRejection', err => {
    handleCriticalError(err)
});