import GasAPI from './api.js';
import { loadSidebar, toggleSidebar } from './sidebar.js';

/**
 * 座席選択画面のメイン処理
 */
const urlParams = new URLSearchParams(window.location.search);
const GROUP = urlParams.get('group');
const DAY = urlParams.get('day');
const TIMESLOT = urlParams.get('timeslot');
const IS_ADMIN = urlParams.get('admin') === 'true';

let selectedSeats = [];
let isAutoRefreshEnabled = true;

// 初期化
window.onload = async () => {
  loadSidebar();
  
  const groupName = isNaN(parseInt(GROUP)) ? GROUP : GROUP + '組';
  document.getElementById('performance-info').textContent = `${groupName} ${DAY}日目 ${TIMESLOT}`;

  if (IS_ADMIN) {
    document.getElementById('admin-indicator').style.display = 'block';
    document.getElementById('admin-login-btn').style.display = 'none';
    document.getElementById('submit-button').style.display = 'none';
  } else {
    document.getElementById('admin-indicator').style.display = 'none';
    document.getElementById('admin-login-btn').style.display = 'block';
    document.getElementById('submit-button').style.display = 'block';
  }

  try {
    const seatData = await GasAPI.getSeatData(GROUP, DAY, TIMESLOT, IS_ADMIN);
    
    // デバッグログを追加
    console.log("Received seatData:", seatData);

    if (seatData.success === false) {
      alert('データ読み込み失敗: ' + seatData.error);  // 修正: successに基づくチェック
      return;
    }
    
    // 必要に応じてseatData.dataの形式を確認
    drawSeatMap(seatData.data); // データを描画する関数を呼び出す
    updateLastUpdateTime();
  } catch (error) {
    alert('サーバー通信失敗: ' + error.message);
  }
};

// 座席マップを描画する関数
function drawSeatMap(seatMap) {
  const container = document.getElementById('seat-map-container');
  container.innerHTML = ''; // 既存の座席マップをクリア

  // すべての座席をループして座席を描画
  Object.entries(seatMap).forEach(([seatId, seat]) => {
    // デバッグログ: 各座席IDと座席の状態を確認
    console.log("Processing seat:", seatId, seat);
    
    const seatElement = document.createElement('div');
    seatElement.className = `seat ${seat.status}`; // seat.status からスタイルを設定
    seatElement.innerText = `Seat ${seatId}`; // seatId（例: 'A1'）を表示します。

    // イベントリスナーを追加
    seatElement.onclick = () => {
      if (seat.status === 'available') {
        selectedSeats.push(seatId); // 選択された座席IDを追加
        seatElement.classList.add('selected'); // 選択されたスタイルを追加
        console.log("Selected seat:", seatId); // デバッグログ: 選択された座席IDを出力
      }
    };

    container.appendChild(seatElement);
  });
}

// ローダー表示制御
function showLoader(visible) {
  const loader = document.getElementById('loading-modal');
  loader.style.display = visible ? 'block' : 'none';
}
