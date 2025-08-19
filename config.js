/**
 * API設定ファイル
 * GAS Web AppのURLを設定してください
 */

// GAS Web App URLに置き換え
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbylQq1kNBETzAYT0DMt3wc6skurV6cue5hxqLPSgGOTAdIRp_ezqK_Gn8K-5VMB_Q4q/exec";//memo

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
