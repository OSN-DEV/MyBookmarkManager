"use strict";
const electron = require("electron");
const ED = {
  CategoryList: {
    ContextMenu: {
      Show: "ed.category-list.context-menu.show"
    }
  }
};
electron.contextBridge.exposeInMainWorld("mainApi", {
  ping: () => electron.ipcRenderer.send("ping"),
  setTitle: (title) => electron.ipcRenderer.send("set-title", title),
  showCategoryListContextMenu: (categoryId) => electron.ipcRenderer.send(ED.CategoryList.ContextMenu.Show, categoryId),
  openFile: () => electron.ipcRenderer.invoke("dialog:openFile"),
  counterValue: (value) => electron.ipcRenderer.send("counter-value", value),
  onUpdateCounter: (callback) => {
    electron.ipcRenderer.on("update-counter", (ev, value) => callback(ev, value));
  }
  /**
   * Show context menu for category list
   * @param categoryId - category id.
   * @returns void
   */
});
