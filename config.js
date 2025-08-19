/**
 * API設定ファイル
 * GAS Web AppのURLを設定してください
 */

// GAS Web App URLに置き換え
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbzvoaTeY9_xjWrsDw6gNIAFz8HFY9PYM0l5P58tSNftt07sLT-qe3i26zhe3hX5JDU/exec";// API

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
