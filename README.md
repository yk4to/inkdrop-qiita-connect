# Inkdrop Qiita Connect Plugin

> Qiitaとの同期メニューを追加するInkdropプラグイン

![](https://inkdrop-plugin-badge.vercel.app/api/version/qiita-connect) ![](https://inkdrop-plugin-badge.vercel.app/api/downloads/qiita-connect) ![](https://img.shields.io/github/license/Luke-1220/inkdrop-qiita-connect?style=plastic)

これは、[Qiita API v2](https://qiita.com/api/v2/docs)を使用してQiitaへの投稿・同期機能を追加するInkdrop用プラグインです。

このプラグインのコードの一部は[goldsziggy/inkdrop-plugin-blog-publish](https://github.com/goldsziggy/inkdrop-plugin-blog-publish)を参考にしています。

## インストール

```shell
ipm install qiita-connect
```

## 使い方

| アイテム一覧 | ノートブック一覧 |
| --- | --- |
| ![item](./images/item.png) | ![item](./images/note.png) |

### Qiitaへのアイテム投稿

右クリックメニューから、アイテムをQiitaへ投稿できます。

> :warning: 投稿するには、一つ以上のタグが含まれている必要があります。
> 
> v1.0.1までは[フロントマター](#フロントマター)にtagsを記述する必要がありましたが、v1.1.0以降ではInkdropのタグフィールドからタグを取得するように変更されました。

### Qiitaとのアイテム同期

右クリックメニューから、アイテムをQiitaと同期できます。

> :warning: 同期時に、Inkdropで編集していた内容は上書きされます。

### Qiitaとのノートブック内のアイテム同期

右クリックメニューから、ノートブック内全てのアイテムをQiitaと同期できます。

## フロントマター

このプラグインは、記事の一番上にある、YAMLで記述されたフロントマターから変数を読み取ります。

デフォルト設定で新規記事として投稿する場合は、フロントマターの記述は不要です。

### 書き方の例

```yaml
---
qiitaId: abcdefghijklmnopqrst
gist: false
tweet: true
---
```

### 変数

| キー | 型 | デフォルト値 | 必須 |  制限 | 説明 |
| --- | --- | --- | --- |  --- | --- |
| qiitaId | string | | [ (はい) ](#ヒント) | | 投稿の一意なID（プラグインによって生成されます） |
| gist | boolean | `false` |  |  | 本文中のコードをGistに投稿するかどうか（GitHub連携を有効化している場合のみ有効）|
| tweet | boolean | `false` |  |  | Twitterに投稿するかどうか (Twitter連携を有効化している場合のみ有効) |
| coediting | boolean | `false` |  | Team Only | この投稿が共同更新状態かどうか |
| groupUrlName | string |  |  | Team Only | この投稿を公開するグループの url_name（null で全体に公開） |
| private | boolean | `false` |  | Individual Only | 限定共有状態かどうかを表すフラグ |

> :warning: Qiita APIが非公開記事をサポートしていないため、非公開記事の公開や同期を行うことはできません。<br>メタデータに `private: true` が含まれている場合、エラーが表示されます。

## ヒント

このプラグインは、`qiitaId`に設定されたIDの記事、または同じタイトルの記事が見つかれば上書きし、見つからなければ新しい記事として投稿します。

IDの一致が最優先されるため、 `qiitaId` が設定されている場合は、その記事を上書きします。

`qiitaId`プロパティは、Qiitaに新しい記事を投稿した時に自動的に追加されます。

## 設定

Preferences -> Plugins -> qiita-connect -> Settings

このプラグインを使用する前に、アクセストークンを設定する必要があります。

アカウントに紐付けられたトークンは、[ここ](https://qiita.com/settings/applications)から取得できます。

| タイトル | デフォルト値 | 説明 |
| ---- | ---- | ---- |
| Qiita Access Token |  | アクセストークンを入力 |
| Qiita Team Access Token |  | チームのアクセストークンを入力 |
| Mode | Individual | 使用するトークンを選択 |
| Open URL In Browser After Posting | true | 投稿後にブラウザでURLを開くかどうか |

## 更新履歴

### 1.1.0
* フロントマターではなく元々のタグフィールドを使用するように変更
* ノートブックを同期した時にアイテムごとのフロントマターがリセットされるバグを修正
* 英語版のReadmeを削除

### 1.0.1
* アイテムが同期されないバグを修正

### 1.0.0 - 最初のリリース
* 全ての機能の追加
* 全てのバグの修正
