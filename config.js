/**
 * API設定ファイル
 * GAS Web AppのURLを設定してください
 */

// ★下記のURLをあなたのGAS Web App URLに置き換えてください
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbyfN0c-ThK4kNnoiwbQkF4LfSK_LxlhmmMVpuAeAzoIR_CvNTem-aY-L4c3wY7lF3cJtw/exec";

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
