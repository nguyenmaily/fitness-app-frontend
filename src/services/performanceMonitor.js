import { AppState } from 'react-native';
import analyticsService from './analyticsService';

class PerformanceMonitor {
  constructor() {
    this.appStartTime = Date.now();
    this.sessionStartTime = Date.now();
    this.lastScreenTime = Date.now();
    this.currentScreen = null;
    this.screenTimes = {};
    this.appStateSubscription = null; // lưu subscription 
  }

  start() {
    // Theo dõi thời gian khởi động ứng dụng
    setTimeout(() => {
      const startupTime = Date.now() - this.appStartTime;
      analyticsService.logEvent('app_startup_time', {
        time_ms: startupTime
      });
    }, 0);

    // Đăng ký listener mới và lưu subscription 
    this.appStateSubscription = AppState.addEventListener('change',this.handleAppStateChange);
    
    // Trả về hàm cleanup để hủy listener đúng chuẩn
    return () => {
      if ( this.appStateSubscription && typeof this.appStateSubscription.remove === 'function'){
        this.appStateSubscription.remove();
        this.appStateSubscription = null;
      }
    };
  }

   handleAppStateChange = (nextAppState) => {
    if (nextAppState === 'active') {
      // App chuyển về foreground
      this.sessionStartTime = Date.now();
      analyticsService.logEvent('app_to_foreground');
    } else if (nextAppState === 'background') {
      // App chuyển vào background
      const sessionDuration = Math.floor((Date.now() - this.sessionStartTime) / 1000);
      analyticsService.logEvent('app_to_background', {
        session_duration_seconds: sessionDuration
      });
    }
  };

  trackScreenTime(screenName) {
    const now = Date.now();
    
    // Tính thời gian ở màn hình trước
    if (this.currentScreen) {
      const timeSpent = now - this.lastScreenTime;
      this.screenTimes[this.currentScreen] = (this.screenTimes[this.currentScreen] || 0) + timeSpent;
      
      // Log thời gian nếu ở màn hình quá 5 giây (tránh log nhiễu)
      if (timeSpent > 5000) {
        analyticsService.logEvent('screen_time', {
          screen_name: this.currentScreen,
          time_ms: timeSpent
        });
      }
    }

    // Cập nhật màn hình hiện tại
    this.currentScreen = screenName;
    this.lastScreenTime = now;
  }

  // Theo dõi hiệu suất tải dữ liệu
  trackDataFetch(dataType, startTime) {
    const fetchTime = Date.now() - startTime;
    analyticsService.logDataLoadTime(dataType, fetchTime);
    return fetchTime;
  }
}

export default new PerformanceMonitor();