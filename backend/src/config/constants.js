
export const RESPONSE_MESSAGES = { //エラーコード関連
  //200番台: Success
  //使用先：product.routes.js
  SUCCESS: {
    DEFAULT: "正常に完了しました。",
    // 使用先：
    // cart.controller.js, 
    // cart.controller.js, 
    // common.controller.js, 
    // event.controller.js
    // notice.controller.js
    // order.controller.js
    // product.controller.js
    // user.controller.js
    // imageController.js

    FETCH: "データの取得に成功しました。",

    CREATE: "正常に作成されました。",

    UPDATE: "正常に更新されました。",

    DELETE: "正常に削除されました。",

    LOGIN: "ログインに成功しました。",
    // 使用先：
    // ​​auth.controller.js

    LOGOUT: "ログアウトしました。",

    CATEGORY_SAVE: "カテゴリーが作成されました。",

    CATEGORY_CONTENT_CHANGE: "カテゴリーが修正されました。",
    // 使用先：
    // category.controller.js

    DELIVERY_ADDRESS_CREATE_SUCCESS: "配送先登録に成功しました。",
    // 使用先：
    // user.controller.js

    DELIVERY_ADDRESS_CHANGE_SUCCESS: "配送先が変更されました。",
    // 使用先：
    // user.controller.js

    ORDER_COMPLETED: "注文が正常に完了しました。"

  },

  // 400番台: Client Errors
  CLIENT_ERROR: {
    BAD_REQUEST: "不正なリクエストです。", // 400

    UNAUTHORIZED: "IDまたはパスワードが一致しません。", // 401
    // 使用先：
    // cart.controller.js

    NEED_LOGIN: "ログインが必要です。", // 401
    // 使用先：
    // auth.middleware.js

    NEED_TOKEN: "無効または期限切れのトークンです。", // 401
    // 使用先：
    // auth.middleware.js

    FORBIDDEN: "アクセス権限がありません。", // 403
    // 使用先：
    // cart.controller.js

    FORBIDDEN_WITHDRAWN: "退会したアカウントです。", // 403
    // 使用先：
    // ​auth.controller.js

    NOT_FOUND: "データが見つかりません。", // 404
    // 使用先：
    // common.controller.js
    // notice.controller.js
    // order.controller.js
    // product.controller.js
    // imageController.js

    NOT_FOUND_USER: "ユーザーが見つかりません。", // 404
    // 使用先：
    // ​auth.controller.js
    // notice.controller.js
    // order.controller.js
    // user.controller.js

    CATEGORY_NOT_FOUND: "カテゴリーが存在しません。", // 404
    // 使用先：
    // category.controller.js

    EVENT_NOT_FOUND: "イベントが見つかりません。", // 404
    // 使用先：
    // event.controller.js

    CONFLICT: "既に存在するデータです。", // 409

    DATA_OVERLAP: "重複する値が存在します。", // 409
    // 使用先：
    // user.controller.js

    DATA_MATCHING_ERROR: "データが一致しません。",
    // 使用先：
    // cart.controller.js

    NOT_ENTERED: "必須情報が不足しています。",
    // 使用先：
    // event.controller.js
    // notice.controller.js
    // order.controller.js
    // product.controller.js
    // user.controller.js

    NOT_PERMISSION: "実行権限がありません。",
    // 使用先：
    // event.controller.js
    // notice.controller.js

    CATEGORY_NAME_NEED: "カテゴリー名は必須です。",
    // 使用先：
    // category.controller.js

    PRODUCT_STOCK_OUT: "商品在庫が不足しています。",
    // 使用先：
    // order.controller.js

    IMAGE_FILE_ERROR: "画像ファイルがありません。",
    // 使用先：
    // product.controller.js

    FILE_UPLOAD_ERROR: "ファイルアップロードに失敗しました。",
    // 使用先：
    // event.routes.js
    // notice.routes.js
    // product.routes.js
    // app.js
    
    DELIVERY_ADDRESS_ERROR: "配送先登録エラーが発生しました。",
    // 使用先：
    // user.controller.js

    STOCK_SHORTAGE: (productId) => `商品ID ${productId}の在庫が不足しているため、注文に失敗しました。`
    // 使用先：
    // order.controller.js

  },

  // 500番台: Server Errors
  SERVER_ERROR: {
    DEFAULT: "サーバーエラーが発生しました。",
    // 使用先：
    // ​auth.controller.js, 
    // cart.controller.js, 
    // category.controller.js,
    // common.controller.js, 
    // event.controller.js
    // notice.controller.js
    // order.controller.js
    // product.controller.js
    // user.controller.js
    // imageController.js

    DB_ERROR: "データベース処理中にエラーが発生しました。",
    // 使用先：
    // cleanup.js

    LOGIN_FAILED: "ログイン処理中にサーバーエラーが発生しました。",
    // 使用先：
    // ​auth.controller.js

    CATEGORY_FETCH_FAILED: "カテゴリー取得中にエラーが発生しました。",
    // 使用先：
    // category.controller.js

    EVENT_FETCH_FAILED: "イベントの取得に失敗しました。",
    // 使用先：
    // event.controller.js

    INTERNAL_ERROR: "予期せぬ内部エラーが発生しました。"

  }
};

export const AUTH_CONSTANTS = {
  // 使用先：
  // ​​auth.controller.js - ログイン時に発行されるJWTトークンの有効期間
  // 12h = 12時間有効
  TOKEN_EXPIRES_IN: "12h",

  USER_STATUS: {
    ACTIVE: 0,   //通常のユーザー
    WITHDRAWN: 1 //脱退したユーザー
  }
};

export const DATA_CONSTRAINTS= {
  SIGNUP: {
    DEFAULT: "必須情報(ID、パスワード、名前、メール、電話番号)が不足しています。",
    // 使用先：
    // user.controller.js

    ID: "IDは英字と数字を含む4文字以上である必要があります。",
    // 使用先：
    // user.controller.js

    PASSWORD: "パスワードは英字と数字を含む4文字以上である必要があります。",
    // 使用先：
    // user.controller.js

    MAIL: "有効なメール形式ではありません。",
    // 使用先：
    // user.controller.js

    DELIVERY_ADDRESS: "同じ名前の配送先が存在します。",
    // 使用先：
    // user.controller.js

    SALTROUNDS: 10
    // 使用先：
    // user.controller.js

  },
  FILE:{
    SIZE_LIMIT: (file_size) => `ファイルサイズは ${file_size}以下でなければなりません。`
    // 使用先：
    // event.controller.js
    // notice.routes.js
    // product.routes.js

  }
};

export const STATUS_MESSAGES = {
  USER: {
    ACTIVATED: "活性化されました。",    //有効(status=0)
    // 使用先：
    // cart.controller.js

    DEACTIVATED: "非活性化されました。" //無効(status=1)
    // 使用先：
    // cart.controller.js

  },
  COMMON: {
    UPDATE_SUCCESS: "アップデートに成功しました。"
  },
  DEFALUT:{
    Enable : 0,
    Disable : 1
  },
  is_used:{
    Enable : 1,
    // 使用先：
    // common.controller.js

    Disable : 0
  }
};