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
    
    console.log("Received seatData:", seatData);

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

// 最終アップデート時間を取得
function updateLastUpdateTime() {
  const lastUpdateEl = document.getElementById('last-update');
  const now = new Date();
  lastUpdateEl.textContent = `最終更新: ${now.toLocaleTimeString('ja-JP')}`;
}

// ローダー表示制御
function showLoader(visible) {
  const loader = document.getElementById('loading-modal');
  if (loader) {
    loader.style.display = visible ? 'block' : 'none'; // ローダーを表示または非表示
  } else {
    console.warn('Loader element not found');
  }
}

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

// 座席要素を作成する関数
function createSeatElement(seat) {
  const el = document.createElement('div'); // 新しい座席要素を作成
  el.className = `seat ${seat.status}`; // 状態に応じたクラスを設定
  el.dataset.id = seat.id; // データ属性に座席IDを設定
  el.innerHTML = `<span class="seat-id">${seat.id}</span>`; // 座席IDを表示

  // 管理者モードでの座席名の表示
  if (IS_ADMIN && seat.name) {
    el.innerHTML += `<span class="seat-name">${seat.name}</span>`;
  }

  // 空いている座席の場合、クリックイベントを設定
  if (seat.status === 'available') {
    el.onclick = () => {
      toggleSeatSelection(seat.id); // 座席がクリックされた際の処理
    };
  }

  return el; // 作成した座席要素を返す
}

// 座席選択用のトグル関数
function toggleSeatSelection(seatId) {
  const el = document.querySelector(`.seat[data-id='${seatId}']`);
  if (!el) return;

  const index = selectedSeats.indexOf(seatId);
  if (index > -1) { // 既に選択されている座席を解除
    selectedSeats.splice(index, 1);
    el.classList.remove('selected'); // 無選択状態
  } else { // 新たに選択
    selectedSeats.push(seatId);
    el.classList.add('selected'); // 選択状態
  }
}
