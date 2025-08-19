/**
 * API設定ファイル
 * GAS Web AppのURLを設定してください
 */

// GAS Web App URLに置き換え
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbwejZIDuzJIIdVkdz2nbYY8iwuTQW-J8I24khdUwSYSdXSnv3WFC0tlYT98fo7EeQs9/exec";

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
