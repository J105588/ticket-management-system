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
    
    console.log("Received seatData:", seatData);

    if (seatData.success === false) {
      alert('データ読み込み失敗: ' + seatData.error);
      return;
    }

    drawSeatMap(seatData.seatMap);

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

  const layout = {
    main: { rows: ['A', 'B', 'C', 'D'], cols: 12, passageAfter: 6 },
    sub:  { rows: ['E'], cols: 12, passageAfter: 6 }
  };

  // メインセクションの描画
  const mainSection = document.createElement('div');
  mainSection.className = 'seat-section';
  layout.main.rows.forEach(rowLabel => {
    const rowEl = document.createElement('div');
    rowEl.className = 'seat-row';
    for (let i = 1; i <= layout.main.cols; i++) {
      const seatId = rowLabel + i;
      const seatData = seatMap[seatId] || { id: seatId, status: 'unavailable', name: null };
      rowEl.appendChild(createSeatElement(seatData));
      
      if (i === layout.main.passageAfter) {
        const passage = document.createElement('div');
        passage.className = 'passage'; // 通路の追加
        rowEl.appendChild(passage);
      }
    }
    mainSection.appendChild(rowEl);
  });
  container.appendChild(mainSection);

  // サブセクションの描画
  const subSection = document.createElement('div');
  subSection.className = 'seat-section';
  layout.sub.rows.forEach(rowLabel => {
    const rowEl = document.createElement('div');
    rowEl.className = 'seat-row';
    for (let i = 1; i <= layout.sub.cols; i++) {
      const seatId = rowLabel + i;
      const seatData = seatMap[seatId] || { id: seatId, status: 'unavailable', name: null };
      rowEl.appendChild(createSeatElement(seatData));
      
      if (i === layout.sub.passageAfter) {
        const passage = document.createElement('div');
        passage.className = 'passage'; // 通路の追加
        rowEl.appendChild(passage);
      }
    }
    subSection.appendChild(rowEl);
  });
  container.appendChild(subSection);
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
