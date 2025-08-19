/**
 * GAS APIとの通信を行うモジュール (POSTリクエスト対応版)
 * config.jsに定義されたGAS_API_URLとdebugLogを使用します。
 * POSTリクエストを利用してCORSの問題を回避します。
 */
class GasAPI {
  /**
   * GASのdoPost関数を呼び出すコアメソッド
   * @param {string} functionName - 実行したいGAS側の関数名
   * @param {Array} params - その関数に渡す引数の配列
   * @returns {Promise<any>} - GASからの応答結果
   */
  static async call(functionName, params = []) {
    // config.jsのdebugLogを呼び出す
    debugLog(`API Call (POST): ${functionName}`, params);

    // GASのウェブアプリURLをconfig.jsから取得
    if (!window.GAS_API_URL) {
      const errorMessage = "GASのAPI URLが定義されていません(GAS_API_URL)。config.jsを確認してください。";
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    // 1. POSTで送信するデータオブジェクトを作成
    const postData = {
      func: functionName,
      params: params
    };

    debugLog('Request Body:', postData);

    try {
      // 2. fetchをPOSTリクエストとして実行
      const response = await fetch(GAS_API_URL, {
        method: 'POST',
        headers: {
          // GASのdoPostでリクエストボディを正しく受け取るための定型ヘッダー
          'Content-Type': 'text/plain;charset=utf-8',
        },
        // リクエストのボディに、JSONデータを文字列化して含める
        body: JSON.stringify(postData),
        // GASからのリダイレクトに自動で追従するための設定
        redirect: 'follow'
      });
      
      if (!response.ok) {
        throw new Error(`サーバーとの通信に失敗しました (HTTPステータス: ${response.status})`);
      }
      
      const data = await response.json();
      debugLog(`API Response: ${functionName}`, data);

      // GAS側が返すカスタムエラーをハンドリング
      if (data.success === false) {
        throw new Error(data.error || 'GAS側で処理エラーが発生しました。');
      }
      
      return data;

    } catch (error) {
      // 通信全体のエラーをハンドリング
      const errorMessage = error.message || '不明なエラー';
      console.error(`API Error (${functionName}):`, errorMessage, error);
      // エラーメッセージを呼び出し元にスローしてUIに表示させる
      throw new Error(`API呼び出しに失敗しました: ${errorMessage}`);
    }
  }
  
  // ==========================================================
  // === 各API関数の呼び出し（ここから下は変更の必要なし） ===
  // ==========================================================
  
  // 座席データ取得
  static async getSeatData(group, day, timeslot, isAdmin) {
    return this.call('getSeatData', [group, day, timeslot, isAdmin]);
  }
  
  // 座席予約
  static async reserveSeats(group, day, timeslot, selectedSeats) {
    return this.call('reserveSeats', [group, day, timeslot, selectedSeats]);
  }
  
  // チェックイン
  static async checkInSeat(group, day, timeslot, seatId) {
    return this.call('checkInSeat', [group, day, timeslot, seatId]);
  }
  
  // 当日券発行
  static async assignWalkInSeat(group, day, timeslot) {
    return this.call('assignWalkInSeat', [group, day, timeslot]);
  }
  
  // 管理者パスワード検証
  static async verifyAdminPassword(password) {
    return this.call('verifyAdminPassword', [password]);
  }
  
  // モードパスワード検証
  static async verifyModePassword(mode, password) {
    return this.call('verifyModePassword', [mode, password]);
  }
  
  // 時間帯データ取得
  static async getAllTimeslotsForGroup(group) {
    return this.call('getAllTimeslotsForGroup', [group]);
  }
}
