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
    if (seatData.error) {
      alert('データ読み込み失敗: ' + seatData.error);
      return;
    }
    drawSeatMap(seatData);
    updateLastUpdateTime();
  } catch (error) {
    alert('サーバー通信失敗: ' + error.message);
  }
};

function drawSeatMap(seatMap) {
  const container = document.getElementById('seat-map-container');
  container.innerHTML = ''; // 既存の座席マップをクリア

  Object.values(seatMap).forEach(seat => {
    const seatElement = document.createElement('div');
    seatElement.className = `seat ${seat.status}`;
    seatElement.innerText = `Seat ${seat.id}`;
    
    // 座席と対応する処理を追加
    container.appendChild(seatElement);
  });
}

// ローダー表示制御
function showLoader(visible) {
  const loader = document.getElementById('loading-modal');
  loader.style.display = visible ? 'block' : 'none';
}
