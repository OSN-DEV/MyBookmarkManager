/** リクエストのモード  */
enum RequestMode {
  Create = 'create', // 作成
  Edit = 'edit', // 編集
  Delete = 'delete' // 削除
}

/** ファイル関連 */
enum FilePath {
  AppDirectory = 'MyBookmark', // アプリデータフォルダ
  SettingFile = 'MyBookmark/settings.json' // 設定ファイル
}

export { RequestMode, FilePath }
