"use strict";
const electron = require("electron");
const path = require("path");
const utils = require("@electron-toolkit/utils");
const icon = path.join(__dirname, "../../resources/icon.png");
const devLog = (message) => {
  console.log(`##### ${message}`);
};
const ED = {
  /** カテゴリリスト */
  CategoryList: {
    /** コンテキストメニュー */
    ContextMenu: {
      /**
       * メニュー表示
       */
      Show: "ed.category-list.context-menu.show",
      /**
       * メニュー選択
       */
      MenuSelected: "ed.category-list.context-menu.menu-selected",
      /**
       * カテゴリコンテキストメニュー選択
       */
      CreateRequest: "ed.category-list.context-menu.create-request",
      EditRequest: "ed.category-list.context-menu.edit-request",
      DeleteRequest: "ed.category-list.context-menu.edit-request",
      CreateResponse: "ed.category-list.context-menu.create-response",
      EditResponset: "ed.category-list.context-menu.edit-response",
      DeleteResponse: "ed.category-list.context-menu.edit-response"
    }
  },
  /** カテゴリ編集 */
  CategoryEdit: {
    /**
     * ロードイベント
     */
    Load: "ed.category-edit.loadd"
  }
};
var RequestMode = /* @__PURE__ */ ((RequestMode2) => {
  RequestMode2["Create"] = "create";
  RequestMode2["Edit"] = "edit";
  RequestMode2["Delete"] = "delete";
  return RequestMode2;
})(RequestMode || {});
let contextMenu = null;
const showContextMenu = (window, category, callback) => {
  const isCreate = category?.categoryId === null;
  devLog(`showContextMenu: ${category?.categoryId}`);
  if (!contextMenu) {
    contextMenu = electron.Menu.buildFromTemplate([
      {
        label: "Create",
        enabled: isCreate,
        click: () => {
          callback(category, RequestMode.Create);
        }
      },
      {
        label: "Edit",
        enabled: !isCreate,
        click: () => {
          callback(category, RequestMode.Edit);
        }
      },
      {
        label: "Delete",
        enabled: !isCreate,
        click: () => {
        }
      }
    ]);
  } else {
    contextMenu.items.map((m) => {
      if (m.label === "Create") {
        m.enabled = isCreate;
      } else {
        m.enabled = !isCreate;
      }
    });
  }
  contextMenu.popup();
};
let showDevTool = false;
let mainWindow = null;
let categoryEditWindow = null;
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
            mainWindow?.webContents.send("update-counterXXX", 1);
          },
          label: "increment"
        },
        {
          click: () => {
            mainWindow?.webContents.send("update-counter", -1);
          },
          label: "decrement"
        },
        {
          click: () => {
            console.log("send request");
            mainWindow?.webContents.send(ED.CategoryList.ContextMenu.CreateRequest);
          },
          label: "test"
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
  toggleDevTool();
});
function createCategoryEditWindow(category) {
  if (null != categoryEditWindow && !categoryEditWindow.isDestroyed()) {
    categoryEditWindow.close();
  }
  categoryEditWindow = new electron.BrowserWindow({
    parent: mainWindow,
    width: 350,
    height: 200,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false
    }
  });
  categoryEditWindow.setMenuBarVisibility(false);
  if (!electron.app.isPackaged && process.env["ELECTRON_RENDERER_URL"]) {
    categoryEditWindow.loadURL(`${process.env["ELECTRON_RENDERER_URL"]}/category.html`);
  } else {
    categoryEditWindow.loadFile(path.join(__dirname, "../renderer/category.html"));
  }
  categoryEditWindow.on("ready-to-show", () => {
    categoryEditWindow?.show();
    categoryEditWindow?.webContents.send(ED.CategoryEdit.Load, null);
  });
}
const openFile = async () => {
  const { canceled, filePaths } = await electron.dialog.showOpenDialog({});
  if (!canceled) {
    return filePaths[0];
  }
  return "";
};
const registerEvent = () => {
  electron.ipcMain.on(ED.CategoryList.ContextMenu.Show, (_, category) => {
    showContextMenu(mainWindow, category, categoryContextMenuCallback);
  });
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
const categoryContextMenuCallback = (category, mode) => {
  devLog(`categoryContextMenuCallback: ${category?.categoryId}, ${mode}`);
  createCategoryEditWindow();
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
