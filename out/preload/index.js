"use strict";
const electron = require("electron");
const ED = {
  CategoryList: {
    ContextMenu: {
      Show: "ed.category-list.context-menu.show",
      CreateRequest: "ed.category-list.context-menu.create-request",
      EditRequest: "ed.category-list.context-menu.edit-request",
      DeleteRequest: "ed.category-list.context-menu.edit-request",
      CreateResponse: "ed.category-list.context-menu.create-response",
      EditResponset: "ed.category-list.context-menu.edit-response",
      DeleteResponse: "ed.category-list.context-menu.edit-response"
    }
  }
};
electron.contextBridge.exposeInMainWorld("mainApi", {
  ping: () => electron.ipcRenderer.send("ping"),
  setTitle: (title) => electron.ipcRenderer.send("set-title", title),
  openFile: () => electron.ipcRenderer.invoke("dialog:openFile"),
  counterValue: (value) => electron.ipcRenderer.send("counter-value", value),
  onUpdateCounter: (callback) => {
    electron.ipcRenderer.on("update-counter", (ev, value) => callback(ev, value));
  },
  /** category list */
  /**
   * Show context menu for category list
   * @param categoryId - category id.
   * @returns void
   */
  showCategoryListContextMenu: (categoryId) => electron.ipcRenderer.send(ED.CategoryList.ContextMenu.Show, categoryId),
  /**
   * Create category item request
   * @param callback - callback
   * @return void
   */
  onCategoryItemCreateReqeust: (callback) => {
    electron.ipcRenderer.on(ED.CategoryList.ContextMenu.CreateRequest, (ev) => callback(ev));
  }
});
