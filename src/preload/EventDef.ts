const Prefix = {
  CategoriEdit: 'ed.category-edit'
}

export const ED = {
  /** カテゴリリスト */
  CategoryList: {
    /** カテゴリリストロード */
    Load: 'ed.category-list.load',
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

  /** カテゴリ編集 */
  CategoryEdit: {
    /** ロードイベント */
    Load: 'ed.category-edit.loadd',
    /** データ作成 */
    Create: 'ed.category-edit.create',
    /** データ更新 */
    Update: 'ed.category-edit.update',
    /** キャンセル */
    // Cancel: 'ed.category-edit.cancel'
    Cancel: `${Prefix.CategoriEdit}.cancel`
  }
}
