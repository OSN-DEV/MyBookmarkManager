"use strict";
const electron = require("electron");
const path = require("path");
const utils = require("@electron-toolkit/utils");
const icon = path.join(__dirname, "../../resources/icon.png");
let showDevTool = false;
let mainWindow = null;
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: false,
    // titleBarStyle: 'hidden',
    titleBarOverlay: {
      // color of titile bar
      color: "#3b3b3b",
      // color of titile bar control
      symbolColor: "#74b1be",
      // height of titile bar
      height: 32
    },
    ...process.platform === "linux" ? { icon } : {},
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false
    }
  });
  const menu = electron.Menu.buildFromTemplate([
    {
      label: electron.app.name,
      submenu: [
        { label: showDevTool ? "hide dev tool" : "show dev tool", click: () => toggleDevTool() },
        {
          click: () => {
            mainWindow?.webContents.send("update-counter", 1);
          },
          label: "increment"
        },
        {
          click: () => {
            mainWindow?.webContents.send("update-counter", -1);
          },
          label: "decrement"
        }
      ]
    }
  ]);
  electron.Menu.setApplicationMenu(menu);
  mainWindow.on("ready-to-show", () => {
    mainWindow?.show();
  });
  mainWindow?.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow?.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow?.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}
electron.app.whenReady().then(() => {
  utils.electronApp.setAppUserModelId("com.electron");
  electron.app.on("browser-window-created", (_, window) => {
    utils.optimizer.watchWindowShortcuts(window);
  });
  registerEvent();
});
const openFile = async () => {
  const { canceled, filePaths } = await electron.dialog.showOpenDialog({});
  if (!canceled) {
    return filePaths[0];
  }
  return "";
};
const registerEvent = () => {
  electron.ipcMain.on("ping", () => console.log("pong"));
  electron.ipcMain.on("set-title", (ev, title) => {
    const webContents = ev.sender;
    const win = electron.BrowserWindow.fromWebContents(webContents);
    win?.setTitle(title);
  });
  electron.ipcMain.handle("dialog:openFile", openFile);
  electron.ipcMain.on("counter-value", (_, value) => {
    console.log(value);
  });
  createWindow();
  electron.app.on("activate", function() {
    if (electron.BrowserWindow.getAllWindows().length === 0)
      createWindow();
  });
  electron.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      electron.app.quit();
    }
  });
};
const toggleDevTool = () => {
  if (null === mainWindow) {
    return;
  }
  if (showDevTool) {
    mainWindow.webContents.closeDevTools();
  } else {
    mainWindow.webContents.openDevTools();
  }
  showDevTool = !showDevTool;
};
