/**
 * GAS APIとの通信を行うモジュール (GETリクエスト対応版)
 * config.jsに定義されたGAS_API_URLとdebugLogを使用します。
 */
class GasAPI {
  /**
   * GASのdoGet関数を呼び出すコアメソッド
   * @param {string} functionName - 実行したいGAS側の関数名
   * @param {Array} params - その関数に渡す引数の配列
   * @returns {Promise<any>} - GASからの応答結果
   */
  static async call(functionName, params = []) {
    // config.jsのdebugLogを呼び出す
    debugLog(`API Call (GET): ${functionName}`, params);

    // 1. URLのクエリパラメータを組み立てる
    const queryParams = new URLSearchParams();
    queryParams.append('func', functionName);
    
    // 2. 引数の配列をJSON文字列に変換し、URLエンコードして追加
    queryParams.append('params', JSON.stringify(params));
    
    // 3. セキュリティチェック用のoriginパラメータを追加
    queryParams.append('origin', 'github');

    // config.jsのGAS_API_URLを使ってリクエストURLを生成
    const requestUrl = `${GAS_API_URL}?${queryParams.toString()}`;
    debugLog('Request URL:', requestUrl);
    
    try {
      // 4. fetchをGETリクエストとして実行
      const response = await fetch(requestUrl);
      
      if (!response.ok) {
        throw new Error(`サーバーとの通信に失敗しました (HTTPステータス: ${response.status})`);
      }
      
      const data = await response.json();
      debugLog(`API Response: ${functionName}`, data);

      // GAS側が返すエラーをハンドリング
      if (data.success === false) {
        throw new Error(data.error || 'GAS側でエラーが発生しました。');
      }
      
      return data;

    } catch (error) {
      console.error(`API Error (${functionName}):`, error);
      throw error;
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
