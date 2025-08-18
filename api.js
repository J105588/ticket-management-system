/**
 * GAS APIとの通信を行うモジュール
 */

class GasAPI {
  static async call(functionName, params = []) {
    debugLog(`API Call: ${functionName}`, params);
    
    try {
      const response = await fetch(GAS_API_URL, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          function: functionName,
          params: params
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      debugLog(`API Response: ${functionName}`, data);
      
      return data;
    } catch (error) {
      console.error(`API Error (${functionName}):`, error);
      throw error;
    }
  }
  
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
