"use strict";
const electron = require("electron");
const utils = require("@electron-toolkit/utils");
const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const sqlite3__namespace = /* @__PURE__ */ _interopNamespaceDefault(sqlite3);
const devLog = (message) => {
  console.log(`##### ${message}`);
};
const Prefix = {
  CategoriEdit: "ed.category-edit"
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
    /** ロードイベント */
    Load: "ed.category-edit.loadd",
    /** データ作成 */
    Create: "ed.category-edit.create",
    /** キャンセル */
    // Cancel: 'ed.category-edit.cancel'
    Cancel: `${Prefix.CategoriEdit}.cancel`
  }
};
var RequestMode = /* @__PURE__ */ ((RequestMode2) => {
  RequestMode2["Create"] = "create";
  RequestMode2["Edit"] = "edit";
  RequestMode2["Delete"] = "delete";
  return RequestMode2;
})(RequestMode || {});
var FilePath = /* @__PURE__ */ ((FilePath2) => {
  FilePath2["AppDirectory"] = "MyBookmark";
  FilePath2["SettingFile"] = "MyBookmark/settings.json";
  return FilePath2;
})(FilePath || {});
let contextMenu = null;
const showContextMenu = (category, callback) => {
  const isCreate = category === null;
  devLog(`showContextMenu: ${category?.categoryId}`);
  devLog(isCreate ? "aa" : "bb");
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
const createDataDir = () => {
  const filePath = path.join(electron.app.getPath("appData"), FilePath.AppDirectory);
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath);
  }
};
const getCreateTableSql$1 = () => {
  return `
    CREATE TABLE category (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        sort INTEGER DEFAULT 0
    )
  `;
};
const create = async (category) => {
  try {
    let sql = `
      insert into category(name) values(?)
    `;
    category.id = await insert(sql, [category.name]);
    sql = `
      select max(sort) as max_sort from category
    `;
    const rows = await query(sql);
    category.sort = rows[0] + 1;
    sql = `
      update category set
        sort=?
      where id=?
    `;
    modify(sql, [category.sort, category.id]);
    return category;
  } catch (error) {
    console.error("Error query database:", error);
    return void 0;
  }
};
const getCreateTableSql = () => {
  return `
    CREATE TABLE item (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        categoryId INTEGER,
        name TEXT,
        sort INTEGER,
        url TEXT,
        explanation TEXT
    )
  `;
};
const db = new sqlite3__namespace.Database("app.db");
const initDatabase = async () => {
  devLog(`initDatabase`);
  let hasError = true;
  try {
    await query("select id from category limit 1");
    hasError = false;
  } catch (error) {
    console.error("Error query database:", error);
  }
  if (!hasError) {
    return;
  }
  try {
    devLog(`create table`);
    await modify(getCreateTableSql$1());
    await modify(getCreateTableSql());
  } catch (error) {
    console.error("Error query database:", error);
  }
};
const query = async (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, function(err, rows) {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};
const modify = async (sql, params = []) => {
  return new Promise((resolve, rejects) => {
    db.run(sql, params, function(err) {
      if (err) {
        rejects(err);
      } else {
        resolve();
      }
    });
  });
};
const insert = async (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
};
let categoryEditWindow = null;
const createCategoryEditWindow = (parent, category) => {
  if (null != categoryEditWindow && !categoryEditWindow.isDestroyed()) {
    categoryEditWindow.close();
  }
  categoryEditWindow = new electron.BrowserWindow({
    parent,
    width: 400,
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
};
const closeCategoryEditWindow = () => {
  if (categoryEditWindow != null) {
    categoryEditWindow.close();
    categoryEditWindow = null;
  }
};
let showDevTool = false;
let mainWindow = null;
const getmainWindow = () => {
  return mainWindow;
};
const createWindow = () => {
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
    ...process.platform === "linux" ? {} : {},
    // ...(process.platform === 'linux' ? { icon } : {}),
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
            initDatabase();
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
electron.app.whenReady().then(async () => {
  createDataDir();
  await initDatabase();
  utils.electronApp.setAppUserModelId("com.electron");
  electron.app.on("browser-window-created", (_, window) => {
    utils.optimizer.watchWindowShortcuts(window);
  });
  registerEvent();
  toggleDevTool();
});
const openFile = async () => {
  const { canceled, filePaths } = await electron.dialog.showOpenDialog({});
  if (!canceled) {
    return filePaths[0];
  }
  return "";
};
const registerEvent = () => {
  electron.ipcMain.on(ED.CategoryList.ContextMenu.Show, (_, category) => {
    showContextMenu(category, categoryContextMenuCallback);
  });
  electron.ipcMain.handle(ED.CategoryEdit.Create, (_, category) => create(category));
  electron.ipcMain.on(ED.CategoryEdit.Cancel, closeCategoryEditWindow);
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
  devLog(`categoryContextMenuCallback: ${category?.id}, ${mode}`);
  createCategoryEditWindow(getmainWindow());
};
