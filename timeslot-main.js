// timeslot-main.js

// 必要なモジュールをインポート
import GasAPI from './api.js';
import { loadSidebar, toggleSidebar } from './sidebar.js';
import { getAllTimeslotsForGroup } from './timeslot-schedules.js'; // timeslot-schedules.js からもインポート

// --- 初期化処理 ---
const urlParams = new URLSearchParams(window.location.search);
const group = urlParams.get('group');

// 組名を表示
document.getElementById('group-name').textContent = isNaN(parseInt(group)) ? group : group + '組';

// サイドバーを読み込み
loadSidebar();

// 時間帯データを非同期で読み込み
loadTimeslots(group);

// グローバルに関数を公開
window.toggleSidebar = toggleSidebar;
window.selectTimeslot = selectTimeslot;

// --- 関数定義 ---

// 時間帯選択関数
function selectTimeslot(day, timeslot) {
  // getCurrentMode() はグローバルにないので、ここで定義するか、または別の方法を考える必要があります
  // 一旦、管理者モードかどうかだけを単純に判定します。
  const isAdmin = urlParams.get('admin') === 'true';
  
  let targetPage = 'seats.html';
  let additionalParams = '';
  
  // walkinモードの判定ロジックは sidebar.js などに共通化する必要がありそうですが、一旦保留
  // if (currentMode === 'walkin') { ... } 
  
  if (isAdmin) {
    additionalParams = '&admin=true';
  }
  
  const url = `${targetPage}?group=${encodeURIComponent(group)}&day=${day}&timeslot=${timeslot}${additionalParams}`;
  window.location.href = url;
}

// 時間帯データを読み込んで表示
function loadTimeslots(group) {
  const container = document.getElementById('timeslot-container');
  const timeslots = getAllTimeslotsForGroup(group); // timeslot-schedules.js の関数を呼び出す
  
  if (!timeslots || timeslots.length === 0) {
    container.innerHTML = '<p class="description">この組に設定された公演時間帯がありません。</p>';
    return;
  }
  
  const timeslotsByDay = timeslots.reduce((acc, ts) => {
    (acc[ts.day] = acc[ts.day] || []).push(ts);
    return acc;
  }, {});
  
  let html = '';
  for (let day in timeslotsByDay) {
    html += `
      <div class="timeslot-section">
        <h2>${getDayName(day)}</h2>
        <div class="grid-container">
    `;
    
    for (let ts of timeslotsByDay[day]) {
      html += `<a class="grid-item" href="javascript:void(0)" onclick="selectTimeslot('${ts.day}', '${ts.timeslot}')">${ts.displayName}</a>`;
    }
    
    html += `
        </div>
      </div>
    `;
  }
  
  container.innerHTML = html;
}

function getDayName(day) {
  return day == 1 ? '1日目' : '2日目';
}
