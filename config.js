/**
 * API設定ファイル
 * GAS Web AppのURLを設定してください
 */

// GAS Web App URLに置き換え
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbwDkJv8CULo_ig-9dcwTslYGNo5svyQIpEzPrQNo592jQJ3njE_7FYu8hjjrt2da9-R/exec";// API

// デバッグモード（開発時はtrue、本番はfalse）
const DEBUG_MODE = true;

// ログ出力関数
function debugLog(message, data = null) {
  if (DEBUG_MODE) {
    if (data) {
      console.log(message, data);
    } else {
      console.log(message);
    }
  }
}
