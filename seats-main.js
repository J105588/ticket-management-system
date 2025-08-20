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

// 初期化
window.onload = async () => {
  loadSidebar();
  
  const groupName = isNaN(parseInt(GROUP)) ? GROUP : GROUP + '組';
  document.getElementById('performance-info').textContent = `${groupName} ${DAY}日目 ${TIMESLOT}`;

  // 管理者モードの表示制御
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
    
    if (seatData.success === false) {
      alert('データ読み込み失敗: ' + seatData.error);
      return;
    }

    drawSeatMap(seatData.seatMap); // 座席マップを描画
    updateLastUpdateTime(); // 最終更新時間を更新
  } catch (error) {
    alert('サーバー通信失敗: ' + error.message);
  } finally {
    showLoader(false); // ロードインジケーターを非表示に
  }
};

// 座席マップを描画する関数
function drawSeatMap(seatMap) {
  const seatMapContainer = document.getElementById('seat-map');
  seatMapContainer.innerHTML = '';

  seatMap.forEach(seat => {
    const seatButton = document.createElement('button');
    seatButton.className = `seat ${seat.status}`;
    seatButton.textContent = seat.id;

    // ステータスに応じてイベントリスナーを設定
    if (seat.status === 'available') {
      seatButton.addEventListener('click', () => {
        toggleSeatSelection(seat.id);
      });
    }
    seatMapContainer.appendChild(seatButton);
  });
}

// 座席選択のトoggle
function toggleSeatSelection(seatId) {
  const index = selectedSeats.indexOf(seatId);
  if (index === -1) {
    selectedSeats.push(seatId);
  } else {
    selectedSeats.splice(index, 1);
  }
  updateSelectedSeatsView();
}

// 選択された座席の表示更新
function updateSelectedSeatsView() {
  const selectedSeatsDisplay = `選択座席: ${selectedSeats.join(', ')}`;
  console.log(selectedSeatsDisplay);
  // UIに表示するロジックがあれば、ここで実装します。
}

// 最終アップデート時間を取得
function updateLastUpdateTime() {
  const lastUpdateEl = document.getElementById('last-update');
  const now = new Date();
  lastUpdateEl.textContent = `最終更新: ${now.toLocaleTimeString('ja-JP')}`;
}

// ローダー表示制御
function showLoader(visible) {
  const loader = document.getElementById('loading-modal');
  loader.style.display = visible ? 'block' : 'none'; // ローダーを表示または非表示
}
