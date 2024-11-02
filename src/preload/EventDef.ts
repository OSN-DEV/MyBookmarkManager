const Prefix = {
  CategoriEdit: 'ed.category-edit',
  ItemEdit: 'ed.item-edit'
}

export const ED = {
  /** カテゴリリスト */
  CategoryList: {
    /** カテゴリリストロード */
    Load: 'ed.category-list.load',
    /** カテゴリ削除 */
    Delete: 'ed.category-list.delete',
    /** コンテキストメニュー */
    ContextMenu: {
      /**
       * メニュー表示
       */
      Show: 'ed.category-list.context-menu.show',

      /**
       * メニュー選択
       */
      MenuSelected: 'ed.category-list.context-menu.menu-selected',

      /**
       * カテゴリコンテキストメニュー選択
       */
      CreateRequest: 'ed.category-list.context-menu.create-request',
      EditRequest: 'ed.category-list.context-menu.edit-request',
      DeleteRequest: 'ed.category-list.context-menu.edit-request',
      CreateResponse: 'ed.category-list.context-menu.create-response',
      EditResponset: 'ed.category-list.context-menu.edit-response',
      DeleteResponse: 'ed.category-list.context-menu.edit-response'
    }
  },

  /** アイテムリスト */
  ItemList: {
    /** アイテムリストロード */
    Load: 'ed.item-list.load',
    /** アイテムリスト取得要求 */
    Request: 'ed.item-list.request',
    /** アイテム起動 */
    LaunchItem: 'ed.item-list.launch-item',
    /** コンテキストメニュー */
    ContextMenu: {
      /**
       * メニュー表示
       */
      Show: 'ed.item-list.context-menu.show',

      /**
       * メニュー選択
       */
      MenuSelected: 'ed.item-list.context-menu.menu-selected',
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
}
