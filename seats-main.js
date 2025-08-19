import GasAPI from './api.js';
import { loadSidebar } from './sidebar.js';
/**
 * 座席選択画面のメイン処理
 */

// URLパラメータ取得
const urlParams = new URLSearchParams(window.location.search);
const GROUP = urlParams.get('group');
const DAY = urlParams.get('day');
const TIMESLOT = urlParams.get('timeslot');
const IS_ADMIN = urlParams.get('admin') === 'true';

// グローバル変数
let selectedSeats = [];
let autoRefreshInterval = null;
let lastUpdateTime = null;
let isAutoRefreshEnabled = true;
let isRefreshing = false;
let settingsOpen = false;

// 初期化
window.onload = async () => {
  // サイドバー読み込み
  loadSidebar();
  
  // 表示情報設定
  const groupName = isNaN(parseInt(GROUP)) ? GROUP : GROUP + '組';
  document.getElementById('performance-info').textContent = `${groupName} ${DAY}日目 ${TIMESLOT}`;
  
  // 管理者モード表示制御
  if (IS_ADMIN) {
    document.getElementById('admin-indicator').style.display = 'block';
    document.getElementById('admin-login-btn').style.display = 'none';
    document.getElementById('submit-button').style.display = 'none';
  } else {
    document.getElementById('admin-indicator').style.display = 'none';
    document.getElementById('admin-login-btn').style.display = 'block';
    document.getElementById('submit-button').style.display = 'block';
  }
  
  // 初期データ読み込み
  showLoader(true);
  try {
    const seatData = await GasAPI.getSeatData(GROUP, DAY, TIMESLOT, IS_ADMIN);
    if (seatData.error) {
      alert('データ読み込み失敗: ' + seatData.error);
      return;
    }
    drawSeatMap(seatData);
    updateLastUpdateTime();
    startAutoRefresh();
  } catch (error) {
    alert('サーバー通信失敗: ' + error.message);
  } finally {
    showLoader(false);
  }
};

// ローダー表示制御
function showLoader(visible) {
  const loader = document.getElementById('loading-modal');
  loader.style.display = visible ? 'block' : 'none';
}

// 設定パネル制御
function toggleSettings() {
  settingsOpen = !settingsOpen;
  const settingsPanel = document.getElementById('settings-panel');
  const overlay = document.getElementById('overlay');
  
  if (settingsOpen) {
    settingsPanel.classList.add('show');
    overlay.classList.add('show');
  } else {
    closeSettings();
  }
}

function closeSettings() {
  settingsOpen = false;
  document.getElementById('settings-panel').classList.remove('show');
  document.getElementById('overlay').classList.remove('show');
}

// 更新処理
function updateLastUpdateTime() {
  lastUpdateTime = new Date();
  const lastUpdateEl = document.getElementById('last-update');
  lastUpdateEl.textContent = `最終更新: ${lastUpdateTime.toLocaleTimeString('ja-JP', {hour: '2-digit', minute: '2-digit'})}`;
}

function startAutoRefresh() {
  if (autoRefreshInterval) clearInterval(autoRefreshInterval);
  if (!isAutoRefreshEnabled) return;
  
  autoRefreshInterval = setInterval(() => {
    if (!document.hidden && !isRefreshing) {
      updateSeatData(false);
    }
  }, 30000); // 30秒間隔
}

function stopAutoRefresh() {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
  }
}

function toggleAutoRefresh() {
  const toggle = document.getElementById('auto-refresh-toggle');
  isAutoRefreshEnabled = toggle.checked;
  
  if (isAutoRefreshEnabled) {
    startAutoRefresh();
  } else {
    stopAutoRefresh();
  }
}

function manualRefresh() {
  updateSeatData(true);
  closeSettings();
}

async function updateSeatData(showLoaderFlag = false) {
  if (isRefreshing) return;
  isRefreshing = true;
  
  const refreshBtn = document.getElementById('refresh-btn');
  
  if (showLoaderFlag) showLoader(true);
  refreshBtn.disabled = true;
  refreshBtn.textContent = '更新中...';
  
  try {
    const seatData = await GasAPI.getSeatData(GROUP, DAY, TIMESLOT, IS_ADMIN);
    
    if (seatData.error) {
      console.error('座席データ取得エラー:', seatData.error);
      return;
    }
    
    drawSeatMap(seatData, true);
    updateLastUpdateTime();
    
  } catch (error) {
    console.error('座席データ更新失敗:', error.message);
  } finally {
    if (showLoaderFlag) showLoader(false);
    refreshBtn.disabled = false;
    refreshBtn.textContent = '手動更新';
    isRefreshing = false;
  }
}

// 座席マップ描画
function drawSeatMap(seatMap, preserveSelection = false) {
  const container = document.getElementById('seat-map-container');
  
  let currentSelections = [];
  if (preserveSelection) {
    currentSelections = [...selectedSeats];
  }
  
  container.innerHTML = '';
  const layout = {
    main: { rows: ['A', 'B', 'C', 'D'], cols: 12, passageAfter: 6 },
    sub:  { rows: ['E'], cols: 12, passageAfter: 6 }
  };

  // A-D列の描画
  const mainSection = document.createElement('div');
  mainSection.className = 'seat-section';
  layout.main.rows.forEach(rowLabel => {
    const rowEl = document.createElement('div');
    rowEl.className = 'seat-row';
    for (let i = 1; i <= layout.main.cols; i++) {
      const seatId = rowLabel + i;
      const seatData = seatMap[seatId] || { id: seatId, status: 'unavailable', name: null };
      rowEl.appendChild(createSeatElement(seatData, currentSelections));
      if (i === layout.main.passageAfter) {
        const passage = document.createElement('div');
        passage.className = 'passage';
        rowEl.appendChild(passage);
      }
    }
    mainSection.appendChild(rowEl);
  });
  container.appendChild(mainSection);

  // E列の描画
  const subSection = document.createElement('div');
  subSection.className = 'seat-section';
  layout.sub.rows.forEach(rowLabel => {
    const rowEl = document.createElement('div');
    rowEl.className = 'seat-row';
    
    for (let i = 1; i <= layout.sub.cols; i++) {
      if (i >= 1 && i <= 3) {
        const dummy = document.createElement('div');
        dummy.style.width = '50px';
        dummy.style.height = '50px';
        dummy.style.visibility = 'hidden';
        rowEl.appendChild(dummy);
      } else if (i >= 4 && i <= 6) {
        const seatNum = i - 3;
        const seatId = rowLabel + seatNum;
        const seatData = seatMap[seatId] || { id: seatId, status: 'unavailable', name: null };
        rowEl.appendChild(createSeatElement(seatData, currentSelections));
      } else if (i >= 7 && i <= 9) {
        const seatNum = i - 3;
        const seatId = rowLabel + seatNum;
        const seatData = seatMap[seatId] || { id: seatId, status: 'unavailable', name: null };
        rowEl.appendChild(createSeatElement(seatData, currentSelections));
      } else {
        const dummy = document.createElement('div');
        dummy.style.width = '50px';
        dummy.style.height = '50px';
        dummy.style.visibility = 'hidden';
        rowEl.appendChild(dummy);
      }
      
      if (i === layout.sub.passageAfter) {
        const passage = document.createElement('div');
        passage.className = 'passage';
        rowEl.appendChild(passage);
      }
    }
    
    subSection.appendChild(rowEl);
  });
  container.appendChild(subSection);
  
  if (preserveSelection) {
    selectedSeats = currentSelections.filter(seatId => {
      const seat = seatMap[seatId];
      return seat && seat.status === 'available';
    });
  }
}

function createSeatElement(seat, currentSelections = []) {
  const el = document.createElement('div');
  el.className = `seat ${seat.status}`;
  el.dataset.id = seat.id;
  el.innerHTML = `<span class="seat-id">${seat.id}</span>`;
  
  if (currentSelections.includes(seat.id) && seat.status === 'available') {
    el.classList.add('selected');
  }
  
  if (IS_ADMIN && seat.name) {
    el.innerHTML += `<span class="seat-name">${seat.name}</span>`;
  }
  
  if (seat.status === 'available' && !IS_ADMIN) {
    el.onclick = () => toggleSeatSelection(seat.id);
  }
  
  if ((seat.status === 'to-be-checked-in' || seat.status === 'reserved') && IS_ADMIN) {
    const btn = document.createElement('button');
    btn.className = 'check-in-btn';
    btn.textContent = '✔';
    btn.onclick = (e) => {
      e.stopPropagation();
      checkIn(seat.id);
    };
    el.appendChild(btn);
  }
  
  return el;
}

function toggleSeatSelection(seatId) {
  const el = document.querySelector(`.seat[data-id='${seatId}']`);
  if (!el) return;
  
  const index = selectedSeats.indexOf(seatId);
  if (index > -1) {
    selectedSeats.splice(index, 1);
    el.classList.remove('selected');
  } else {
    selectedSeats.push(seatId);
    el.classList.add('selected');
  }
}

// 管理者機能
async function promptForAdminPassword() {
  const password = prompt("管理者パスワードを入力してください:");
  if (password === null) return;
  
  showLoader(true);
  try {
    const isValid = await GasAPI.verifyAdminPassword(password);
    if (isValid) {
      const url = `seats.html?group=${GROUP}&day=${DAY}&timeslot=${TIMESLOT}&admin=true`;
      window.location.href = url;
    } else {
      alert("パスワードが違います。");
    }
  } catch (error) {
    alert("認証エラー: " + error.message);
  } finally {
    showLoader(false);
  }
}

async function checkIn(seatId) {
  const seatElement = document.querySelector(`.seat[data-id='${seatId}']`);
  const nameElement = seatElement ? seatElement.querySelector('.seat-name') : null;
  const reservedName = nameElement ? nameElement.textContent : '';
  
  const confirmMessage = reservedName 
    ? `${seatId} (${reservedName}) をチェックインしますか？`
    : `${seatId} をチェックインしますか？`;
    
  if (!confirm(confirmMessage)) return;
  
  showLoader(true);
  try {
    const res = await GasAPI.checkInSeat(GROUP, DAY, TIMESLOT, seatId);
    const alertMessage = res.success && res.checkedInName
        ? `${seatId} (${res.checkedInName})のチェックインが完了しました。`
        : res.message;
    alert(alertMessage);
    
    if (res.success) {
      updateSeatData(false);
    }
  } catch (error) {
    alert(`エラー: ${error.message}`);
  } finally {
    showLoader(false);
  }
}

async function confirmReservation() {
  if (selectedSeats.length === 0) {
    alert('座席を1つ以上選択してください。');
    return;
  }
  
  if (confirm(`選択した ${selectedSeats.length} 席で予約を確定しますか？\n座席: ${selectedSeats.join(', ')}`)) {
    showLoader(true);
    try {
      const res = await GasAPI.reserveSeats(GROUP, DAY, TIMESLOT, selectedSeats);
      alert(res.message);
      
      if (res.success) {
        selectedSeats = [];
        updateSeatData(false);
      }
    } catch (error) {
      alert(`エラー: ${error.message}`);
    } finally {
      showLoader(false);
    }
  }
}

// ページ表示/非表示の監視
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && isAutoRefreshEnabled) {
    startAutoRefresh();
  }
});

// ページ離脱時の処理
window.addEventListener('beforeunload', () => {
  stopAutoRefresh();
});
