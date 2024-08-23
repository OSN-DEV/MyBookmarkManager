"use strict";
const electron = require("electron");
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
  },
  /**
   * Edit category item request
   * @param callback - callback
   * @return void
   */
  onCategoryItemEditReqeust: (callback) => {
    electron.ipcRenderer.on(ED.CategoryList.ContextMenu.EditRequest, (ev, categoryId) => callback(ev, categoryId));
  },
  /**
   * Delete category item request
   * @param callback - callback
   * @return void
   */
  onCategoryItemDeleteReqeust: (callback) => {
    electron.ipcRenderer.on(ED.CategoryList.ContextMenu.EditRequest, (ev, categoryId) => callback(ev, categoryId));
  }
});
electron.contextBridge.exposeInMainWorld("categoryApi", {
  ping2: () => electron.ipcRenderer.send("ping2")
});
