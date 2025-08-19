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

  showLoader(true); // ロードインジケーターを表示

  try {
    const seatData = await GasAPI.getSeatData(GROUP, DAY, TIMESLOT, IS_ADMIN);
    
    // デバッグログを追加
    console.log("Received seatData:", seatData);

    if (seatData.success === false) {
      alert('データ読み込み失敗: ' + seatData.error);
      return;
    }
    
    // 正しいデータを使用
    drawSeatMap(seatData.seatMap); // ここは seatData の正しい構造を確認して更新

    updateLastUpdateTime();
  } catch (error) {
    alert('サーバー通信失敗: ' + error.message);
  } finally {
    showLoader(false); // ロードインジケーターを非表示に
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
        console.log("Selected seat:", seatId);
      }
    };

    container.appendChild(seatElement);
  });
}

// ローダー表示制御
function showLoader(visible) {
  const loader = document.getElementById('loading-modal');
  if (loader) {
    loader.style.display = visible ? 'block' : 'none';
  } else {
    console.warn('Loader element not found');
  }
}
