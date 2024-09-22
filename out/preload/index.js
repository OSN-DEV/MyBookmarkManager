"use strict";
const electron = require("electron");
const Prefix = {
  CategoriEdit: "ed.category-edit",
  ItemEdit: "ed.item-edit"
};
const ED = {
  /** カテゴリリスト */
  CategoryList: {
    /** カテゴリリストロード */
    Load: "ed.category-list.load",
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
  /** アイテムリスト */
  ItemList: {
    /** アイテムリストロード */
    Load: "ed.item-list.load",
    /** コンテキストメニュー */
    ContextMenu: {
      /**
       * メニュー表示
       */
      Show: "ed.item-list.context-menu.show",
      /**
       * メニュー選択
       */
      MenuSelected: "ed.item-list.context-menu.menu-selected"
    }
  },
  /** カテゴリ編集 */
  CategoryEdit: {
    /** ロードイベント */
    Load: `${Prefix.CategoriEdit}.load`,
    /** データ作成 */
    Create: `${Prefix.CategoriEdit}.create`,
    /** データ更新 */
    Update: `${Prefix.CategoriEdit}.update`,
    /** キャンセル */
    // Cancel: 'ed.category-edit.cancel'
    Cancel: `${Prefix.CategoriEdit}.cancel`
  },
  /** アイテム：編集 */
  ItemEdit: {
    /** ロードイベント */
    Load: `${Prefix.ItemEdit}.load`,
    /** データ作成 */
    Create: `${Prefix.ItemEdit}.create`,
    /** データ更新 */
    Update: `${Prefix.ItemEdit}.update`,
    /** キャンセル */
    // Cancel: 'ed.category-edit.cancel'
    Cancel: `${Prefix.ItemEdit}.cancel`
  }
};
electron.contextBridge.exposeInMainWorld("mainApi", {
  /** category list */
  /**
   * Show context menu for category list
   * @param categoryId - category id.
   * @returns void
   */
  showCategoryListContextMenu: (category) => electron.ipcRenderer.send(ED.CategoryList.ContextMenu.Show, category),
  /**
   * カテゴリリスト一覧取得イベント
   * @param callback カテゴリ情報
   * @param callback.event IPCメッセージイベント
   * @param callback.categoryList カテゴリ一覧
   * @summary アプリ起動時、カテゴリ情報変更時に発生
   */
  onCategoryListLoad: (callback) => {
    electron.ipcRenderer.on(ED.CategoryList.Load, (ev, categoryList) => callback(ev, categoryList));
  },
  // ping: () => ipcRenderer.send('ping'),
  ping: () => electron.ipcRenderer.send("ping"),
  setTitle: (title) => electron.ipcRenderer.send("set-title", title),
  openFile: () => electron.ipcRenderer.invoke("dialog:openFile"),
  counterValue: (value) => electron.ipcRenderer.send("counter-value", value),
  onUpdateCounter: (callback) => {
    electron.ipcRenderer.on("update-counter", (ev, value) => callback(ev, value));
  },
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
  /**
   * ロードイベント
   * @param callback コールバック
   * @param callback.event IPCメッセージイベント
   * @param callback.category カテゴリ情報
   */
  onLoad: (callback) => {
    electron.ipcRenderer.on(ED.CategoryEdit.Load, (event, category) => callback(event, category));
  },
  /**
   * カテゴリ作成
   * @param category カテゴリ情報
   */
  create: (category) => electron.ipcRenderer.invoke(ED.CategoryEdit.Create, category),
  /**
   * カテゴリ更新
   * @param category カテゴリ情報
   */
  update: (category) => electron.ipcRenderer.invoke(ED.CategoryEdit.Update, category),
  /**
   * キャンセル
   */
  cancel: () => electron.ipcRenderer.send(ED.CategoryEdit.Cancel)
});
electron.contextBridge.exposeInMainWorld("itemApi", {
  /**
   * ロードイベント
   * @param callback コールバック
   * @param callback.event IPCメッセージイベント
   * @param callback.item アイテム情報
   */
  onLoad: (callback) => {
    electron.ipcRenderer.on(ED.ItemEdit.Load, (event, item) => callback(event, item));
  },
  /**
   * アイテム作成
   * @param item アイテム情報
   */
  create: (item) => electron.ipcRenderer.invoke(ED.ItemEdit.Create, item),
  /**
   * アイテム更新
   * @param item アイテム情報
   */
  update: (item) => electron.ipcRenderer.invoke(ED.ItemEdit.Update, item),
  /**
   * キャンセル
   */
  cancel: () => electron.ipcRenderer.send(ED.ItemEdit.Cancel)
});
