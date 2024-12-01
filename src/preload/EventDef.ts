const Prefix = {
  CategoryList: 'ed.category-list',
  CategoryListContextMenu: `ed.category-list.context-menu`,
  CategoriEdit: 'ed.category-edit',
  ItemList: 'ed.item-list',
  ItemListContextMenu: 'ed.item-list.context-menu',
  ItemEdit: 'ed.item-edit'
}

/** イベント定義(Event Definition) */
export const ED = {
  /** カテゴリリスト */
  CategoryList: {
    /** カテゴリリストロード */
    Load: `${Prefix.CategoryList}.load`,
    /** カテゴリ削除 */
    Delete: `${Prefix.CategoryList}.delete`,
    /** ソート順更新 */
    UpdateOrder: `${Prefix.CategoryList}.update-order`,
    /** コンテキストメニュー */
    ContextMenu: {
      /** メニュー表示 */
      Show: `${Prefix.CategoryListContextMenu}.show`,
      /** メニュー選択 */
      MenuSelected: `${Prefix.CategoryListContextMenu}.menu-selected`,
      /** カテゴリコンテキストメニュー項目選択 */
      CreateRequest: `${Prefix.CategoryListContextMenu}.create-request`,
      EditRequest: `${Prefix.CategoryListContextMenu}.edit-request`,
      DeleteRequest: `${Prefix.CategoryListContextMenu}.edit-request`,
      CreateResponse: `${Prefix.CategoryListContextMenu}.create-response`
    }
  },

  /** アイテムリスト */
  ItemList: {
    /** アイテムリストロード */
    Load: `${Prefix.ItemList}.load`,
    /** アイテムリスト取得要求 */
    Request: `${Prefix.ItemList}.request`,
    /** アイテム起動 */
    LaunchItem: `${Prefix.ItemList}.launch-item`,
    /** コンテキストメニュー */
    ContextMenu: {
      /** メニュー表示 */
      Show: `${Prefix.ItemListContextMenu}.show`,
      /** メニュー選択 */
      MenuSelected: `${Prefix.ItemListContextMenu}.menu-selected`
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
