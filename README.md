# MyElectronBoilerplate
React + Typscript + Electron のボイラーテンプレート。基本は参考サイトの記載通りに構築。
起動が若干遅いのですが、環境構築が比較的容易であることとコマンド１つで起動(単純にスクリプトの設定問題だとは思いますが)できるのが選択の理由。もっと良い方法があれば、移行予定。


# リンク
* [Electron + React + TypeScript の開発環境構築](https://zenn.dev/sprout2000/articles/5d7b350c2e85bc)
* [tsconfig.jsonの全オプションを理解する（随時追加中）](https://qiita.com/ryokkkke/items/390647a7c26933940470#include)
* [[Electron] contextBridgeでセキュアなIPC通信を実現する(TypeScript)](https://zenn.dev/rakim_stayfresh/articles/2928ac74a153a5)
* [Inter-Process Communication](https://www.electronjs.org/docs/latest/tutorial/ipc)
* [https://codezine.jp/article/detail/13384?p=3]
* [「Wijmo（ウィジモ）」とElectron、Reactに、TypeScriptを組み合わせてスムーズなアプリ開発を実現](https://codezine.jp/article/detail/13384?p=3)
* [Inter-Process Communication](https://www.electronjs.org/docs/latest/tutorial/ipc)
* [Electron を試す 12 - IPC を contextBridge へ移行する](https://akabeko.me/blog/2020/12/electron-12/)
* [Electronで1からデスクトップアプリを作り、electron-builderを使ってビルド・リリースするまで](https://qiita.com/saki-engineering/items/203892838e15b3dbd300)


# 環境構築手順
レポジトリをクローンして npm install を実行するだけ。


# レポジトリのファイルを作成した手順
備忘録として、構築手順を記載

## パッケージのインストール
初期化してから必要なパッケージをインストール
```
yarn init -y
yarn add typescript ts-node @types/node
yarn add electron --dev
yarn add electronmon
yarn add webpack webpack-cli
yarn add ts-loader css-loader
yarn add  html-webpack-plugin mini-css-extract-plugin
yarn add rimraf wait-on cross-env npm-run-all
yarn add react react-dom
yarn add @types/react @types/react-dom
yarn add electron-builder --dev
```
* typescript : TypeScript本体
* ts-node : Typescriptのコードを直接実行
* @types/node : 型定義
* electron : Electron本体
* electronmon : コード監視して electron のリロード・再起動を行う
* webpack : モジュールバンドラー
* webpack-cli : コマンドラインベースでwebpackを利用
* ts-loader : Typescriptをトランスコンパイル
* css-loader : エントリーポイントのJSにCSSを読み込ませる
* html-webpack-plugin : HTMLファイルを dist配下に作成
* mini-css-extract-plugin : CSSを別ファイルとして出力
* rimraf : OSに依存しない rm -rfを実現
* wait-on : 指定したファイル・URL・TCPソケットなどが使えるようになるまで待機
* cross-env : スクリプト実行時に任意の環境変数を設定
* npm-run-all : 複数のnpm-scriptsを実行

注)パッケージの説明はかなりてきとう


## ファイル・フォルダを作成
使用するフォルダ・ファイルを作成(ファイルの中身は次のステップで設定)。
※自分の環境だと neovim 起動→新規ファイル保存でエラーが発生するので事前に touch コマンドでファイルを作成しています
```
mkdir dist
mkdir src
mkdir src/web
touch src/main.ts
touch src/preload.ts
touch src/web/App.css
touch src/web/App.tsx
touch src/web/index.html
touch src/web/index.ts
touch tsconfig.json
touch webpack.config.ts
```


## 設定ファイルのセットアップ
### tsconfig.json
タイプスクリプトの設定。メイン・レンダラープロセスそれぞれでコンフィグファイルが必要な環境もあるようだけど、今回の環境では１つだけで大丈夫らしい。
```
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "esModuleInterop": true,
    "moduleResolution": "Node",
    "strict": true,
    "jsx": "react"
  },
  "include": ["src/**/*"],
  "ts-node": {
    "compilerOptions": {
      "module": "CommonJS"
    }
  }
}
```
＊target : どのバージョンのJavaScript向けにコンパイルするかを指定。Node14.x以降であれば es2020が無難。Babelなどのコンパイラやモジュールバンドラに任せる場合は esnext を指定
* module : JavaScriptをどのモジュールパターンにするのかを指定
* esModuleInterop : trueにするとコンパイル時にヘルパーメソッドが作成され、モジュールシステムの相互運用性が高まる(defaultをエクスポートしていない CommonJS 形式のモジュールを、ES Modules でデフォルトインポートする、といったことが可能になる)
* moduleResolution : モジュールをどのように解決するかを指定。NodeかClassic。後方互換のためのオプションなので node を指定しておけばよい。
* strict : strictモードを有効にする
* jsx : preserveの場合は tsxをjsxに、reactの場合は tsxをjsに変換、するらしい。多分。。
* include : コンパイル対象となるファイル
* ts-node : ?


### package.json
webpackが出力するファイルを監視してくれるらしい
```
"electronmon": {
    "patterns": ["dist/**/*"]
},
```

エントリポイントとデバッグ開始用の定義(エントリポイントはすでに定義されているので書き換え)。npm run devで開始できる。
```
{
  "main": "dist/main.js",
  "scripts": {
    "dev": "rimraf dist && run-p dev:*",
    "build": "cross-env NODE_ENV=\"production\" webpack --progress",
    "dev:webpack": "cross-env NODE_ENV=\"development\" webpack --progress",
    "dev:electron": "wait-on ./dist/index.html ./dist/main.js && electronmon ."
  }
}
```

ビルドの設定。Windows環境についてはインストーラー作成、実行まで確認していますがMacは全くの未確認です。
```
  "build": {
    "appId": "com.osndev.myelectronboilerplate",
    "directories": {
      "output": "binary"
    },
    "productName": "my-electron-boilerplate",
    "files": [
      "assets",
      "src",
      "dist",
      "package.json",
      "yarn.lock"
    ],
    "mac": {
      "icon": "assets/app.ico",
      "target": [
        "dmg"
      ]
    },
    "win":{
      "icon": "assets/app.ico",
      "target": "nsis"
    },
    "nsis":{
      "oneClick": false,
      "allowToChangeInstallationDirectory": true
    }
```

### webpack.config.ts
１つづつ調べるのが面倒なので、何かあった個別に調べてみる(おおよそはコメントを参照すればわかりそうだけど)。
```
/** エディタで補完を効かせるために型定義をインポート */
import { Configuration } from 'webpack';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

// 開発者モードか否かで処理を分岐する
const isDev = process.env.NODE_ENV === 'development';

// 共通設定
const common: Configuration = {
  // モード切替
  mode: isDev ? 'development' : 'production',
  // モジュール解決に参照するファイル拡張子
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.json'],
  },
  /**
   * macOS でビルドに失敗する場合のワークアラウンド
   * https://github.com/yan-foto/electron-reload/issues/71
   */
  externals: ['fsevents'],
  // 出力先：デフォルトは 'dist'
  output: {
    // webpack@5 + electron では必須の設定
    publicPath: './',
    // 画像などのアセット類は 'dist/assets' フォルダへ配置する
    assetModuleFilename: 'assets/[name][ext]',
  },
  module: {
    // ファイル種別ごとのコンパイル & バンドルのルール
    rules: [
      {
        /**
         * 拡張子 '.ts' または '.tsx' （正規表現）のファイルを 'ts-loader' で処理
         * ただし node_modules ディレクトリは除外する
         */
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
      {
        // 拡張子 '.css' （正規表現）のファイル
        test: /\.css$/,
        // use 配列に指定したローダーは *最後尾から* 順に適用される
        // セキュリティ対策のため style-loader は使用しない
        use: [ MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        // 画像やフォントなどのアセット類
        test: /\.(ico|png|svg|eot|woff?2?)$/,
        /**
         * アセット類も同様に asset/inline は使用しない
         * なお、webpack@5.x では file-loader or url-loader は不要になった
         */
        type: 'asset/resource',
      },
    ],
  },
  // 開発時には watch モードでファイルの変化を監視する
  watch: isDev,
  /**
   * development モードではソースマップを付ける
   *
   * なお、開発時のレンダラープロセスではソースマップがないと
   * electron のデベロッパーコンソールに 'Uncaught EvalError' が
   * 表示されてしまうことに注意
   */
  devtool: isDev ? 'source-map' : undefined,
};

// メインプロセス向け設定
const main: Configuration = {
  // 共通設定を読み込み
  ...common,
  target: 'electron-main',
  // エントリーファイル（チャンク名の 'main.js' として出力される）
  entry: {
    main: './src/main.ts',
  },
};

// プリロードスクリプト向け設定
const preload: Configuration = {
  ...common,
  target: 'electron-preload',
  entry: {
    preload: './src/preload.ts',
  },
};

// レンダラープロセス向け設定
const renderer: Configuration = {
  ...common,
  // セキュリティ対策として 'electron-renderer' ターゲットは使用しない
  target: 'web',
  entry: {
    // React アプリのエントリーファイル
    app: './src/web/index.tsx',
  },
  plugins: [
    // CSS を JS へバンドルせず別ファイルとして出力するプラグイン
    new MiniCssExtractPlugin(),
    /**
     * バンドルしたJSファイルを <script></scrip> タグとして差し込んだ
     * HTMLファイルを出力するプラグイン
     */
    new HtmlWebpackPlugin({
      // テンプレート
      template: './src/web/index.html',
    }),
  ],
};

// 上記 3 つの設定を配列にしてデフォルト・エクスポート
export default [main, preload, renderer];
```


## ソースの作成
Electron公式の [Inter-Process Communication](https://www.electronjs.org/docs/latest/tutorial/ipc) をテンプレートとして作成しました。Typescript初心者なので色々と可笑しなとカラオはあると思いますが、とりあえず動いてはいます。。


## インストーラーの作成
Win環境では作成・実行まで確認していますがMacはすべて未確認です。
```
yarn electron-builder --win --x64
yarn electron-builder --mac --x64
```