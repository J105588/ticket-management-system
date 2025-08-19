/**
 * サイドバー機能とモード管理
 */

// サイドバーHTML
const sidebarHTML = `
  <div id="mySidebar" class="sidebar">
    <a href="javascript:void(0)" class="closebtn" onclick="toggleSidebar()">&times;</a>
    <a href="index.html">組選択</a>
    
    <div class="mode-section">
      <div class="mode-title">動作モード</div>
      <div class="current-mode">
        現在: <span id="current-mode-display">通常モード</span>
      </div>
      <button class="change-mode-btn" onclick="showModeChangeModal()">
        モード変更
      </button>
    </div>
  </div>
  
  <!-- モード変更モーダル -->
  <div id="mode-change-modal" class="modal" style="display: none;">
    <div class="modal-content">
      <h3>モード変更</h3>
      <div class="mode-options">
        <label class="mode-option">
          <input type="radio" name="mode" value="normal" checked> 
          <span>通常モード</span>
          <small>一般的な座席予約</small>
        </label>
        <label class="mode-option">
          <input type="radio" name="mode" value="admin"> 
          <span>管理者モード</span>
          <small>座席管理・チェックイン機能</small>
        </label>
        <label class="mode-option">
          <input type="radio" name="mode" value="walkin"> 
          <span>当日券モード</span>
          <small>当日券発行</small>
        </label>
      </div>
      <div class="password-section">
        <input type="password" id="mode-password" placeholder="パスワード（管理者・当日券モードのみ必要）">
      </div>
      <div class="modal-buttons">
        <button class="btn-primary" onclick="applyModeChange()">変更</button>
        <button class="btn-secondary" onclick="closeModeModal()">キャンセル</button>
      </div>
    </div>
  </div>
`;

// サイドバーを読み込む関数
export function loadSidebar() {
  const container = document.getElementById('sidebar-container');
  if (container) {
    container.innerHTML = sidebarHTML;
    updateModeDisplay();
  }
}

// サイドバー開閉
export function toggleSidebar() {
  const sidebar = document.getElementById("mySidebar");
  const main = document.getElementById("main-content");
  
  if (!sidebar || !main) return;
  
  if (sidebar.style.width === "250px") {
    sidebar.style.width = "0";
    main.style.marginLeft = "0";
  } else {
    sidebar.style.width = "250px";
    main.style.marginLeft = "250px";
  }
}

// モード管理
const MODES = {
  NORMAL: 'normal',
  ADMIN: 'admin',
  WALKIN: 'walkin'
};

const MODE_NAMES = {
  normal: '通常モード',
  admin: '管理者モード',
  walkin: '当日券モード'
};

const MODE_STORAGE_KEY = 'seatReservationMode';

function getCurrentMode() {
  try {
    return localStorage.getItem(MODE_STORAGE_KEY) || MODES.NORMAL;
  } catch (error) {
    console.error('モード取得エラー:', error);
    return MODES.NORMAL;
  }
}

function saveMode(mode) {
  try {
    localStorage.setItem(MODE_STORAGE_KEY, mode);
    updateModeDisplay();
  } catch (error) {
    console.error('モード保存エラー:', error);
  }
}

function updateModeDisplay() {
  try {
    const currentMode = getCurrentMode();
    const displayElement = document.getElementById('current-mode-display');
    if (displayElement) {
      displayElement.textContent = MODE_NAMES[currentMode] || '通常モード';
    }
  } catch (error) {
    console.error('モード表示更新エラー:', error);
  }
}

function showModeChangeModal() {
  try {
    const modal = document.getElementById('mode-change-modal');
    if (!modal) return;
    
    const currentMode = getCurrentMode();
    
    const radioButtons = document.querySelectorAll('input[name="mode"]');
    radioButtons.forEach(radio => {
      radio.checked = (radio.value === currentMode);
    });
    
    const passwordField = document.getElementById('mode-password');
    if (passwordField) {
      passwordField.value = '';
    }
    
    modal.style.display = 'flex';
  } catch (error) {
    console.error('モーダル表示エラー:', error);
  }
}

function closeModeModal() {
  try {
    const modal = document.getElementById('mode-change-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  } catch (error) {
    console.error('モーダル閉じるエラー:', error);
  }
}

async function applyModeChange() {
  try {
    const selectedModeRadio = document.querySelector('input[name="mode"]:checked');
    const passwordField = document.getElementById('mode-password');
    
    if (!selectedModeRadio) {
      alert('モードを選択してください');
      return;
    }
    
    const selectedMode = selectedModeRadio.value;
    const password = passwordField ? passwordField.value : '';
    const currentMode = getCurrentMode();
    
    if (selectedMode === currentMode && selectedMode === MODES.NORMAL) {
      closeModeModal();
      showMessage('既に通常モードです');
      return;
    }
    
    if (selectedMode === MODES.NORMAL) {
      saveMode(selectedMode);
      closeModeModal();
      showMessage(MODE_NAMES[selectedMode] + 'に変更しました');
      return;
    }
    
    if (!password) {
      alert('パスワードを入力してください');
      return;
    }
    
    // APIでパスワード検証
    try {
      const isValid = await GasAPI.verifyModePassword(selectedMode, password);
      if (isValid) {
        saveMode(selectedMode);
        closeModeModal();
        showMessage(MODE_NAMES[selectedMode] + 'に変更しました');
      } else {
        alert('パスワードが間違っています');
      }
    } catch (error) {
      console.error('パスワード検証エラー:', error);
      alert('エラーが発生しました: ' + error.message);
    }
    
  } catch (error) {
    console.error('モード変更適用エラー:', error);
    alert('モード変更中にエラーが発生しました');
  }
}

function showMessage(message) {
  alert(message);
}

// HTMLドキュメントの読み込みが完了したら実行
document.addEventListener('DOMContentLoaded', () => {
    // id="menu-btn" の要素を取得
    const menuBtn = document.getElementById('menu-btn');
    // 要素が存在すれば、クリックされたら toggleSidebar 関数を呼び出すように設定
    if (menuBtn) {
        menuBtn.addEventListener('click', toggleSidebar);
    }
});

// モーダル外クリックで閉じる
document.addEventListener('click', function(event) {
  const modal = document.getElementById('mode-change-modal');
  if (modal && event.target === modal) {
    closeModeModal();
  }
});

// onclick="showModeChangeModal()" から呼び出せるように export を付けます。
export function showModeChangeModal() {
  // パスワード入力用のプロンプトを表示
  const password = prompt("モード変更用のパスワードを入力してください:", "");

  // キャンセルされたり空の場合は何もしない
  if (password === null || password === "") {
    return;
  }
  
  // ここでパスワードを検証する必要があるが、一旦アラートでどのモードに行きたいかを表示する
  // 本来は GasAPI.verifyModePassword(mode, password) を呼び出す
  alert(`入力されたパスワード: ${password}\nここでパスワードを検証し、適切なページに遷移します。`);

  // TODO: パスワード検証とページ遷移のロジックを実装する
  // 例:
  // if (password === 'admin_pass') {
  //   window.location.href = 'index.html?mode=admin';
  // } else if (password === 'walkin_pass') {
  //   window.location.href = 'index.html?mode=walkin';
  // } else {
  //   alert('パスワードが違います。');
  // }
}
