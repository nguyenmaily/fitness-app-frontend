import { getAnalytics, logEvent , setUserId, setUserProperties as setUserPropertiesFn } from '@react-native-firebase/analytics';
import { Platform } from 'react-native';

// Khởi tạo analytics instance
const analytics = getAnalytics();

class AnalyticsService {
  /**
   * Đánh dấu khi người dùng xem một màn hình
   * @param {string} screenName - Tên màn hình (ví dụ: 'AchievementHistory')
   * @param {string} screenClass - Tên class của màn hình (ví dụ: 'AchievementHistoryScreen')
   */
  async logScreenView(screenName, screenClass) {
    try {
      await logEvent(analytics, 'screen_view',{
        screen_name: screenName,
        screen_class: screenClass,
      });
      console.log(`[Analytics] Screen view: ${screenName}`);
    } catch (error) {
      console.error('[Analytics Error] Screen view:', error);
    }
  }

  /**
   * Đánh dấu sự kiện tùy chỉnh
   * @param {string} eventName - Tên sự kiện
   * @param {Object} params - Tham số bổ sung cho sự kiện
   */
  async logEvent(eventName, params = {}) {
    try {
      await logEvent(analytics,eventName, params);
      console.log(`[Analytics] Event: ${eventName}`, params);
    } catch (error) {
      console.error(`[Analytics Error] Event ${eventName}:`, error);
    }
  }

  /**
   * Đánh dấu khi người dùng đạt được thành tích
   * @param {string} achievementId - ID của thành tích
   * @param {string} type - Loại thành tích
   */
  async logAchievement(achievementId, type) {
    try {
      await logEvent(analytics,'unlock_achievement', {
        achievement_id: achievementId,
        achievement_type: type,
      });
      console.log(`[Analytics] Achievement unlocked: ${type}`);
    } catch (error) {
      console.error('[Analytics Error] Achievement:', error);
    }
  }

  /**
   * Đánh dấu khi người dùng chia sẻ nội dung
   * @param {string} contentType - Loại nội dung (achievement, challenge)
   * @param {string} itemId - ID của nội dung
   * @param {string} method - Phương thức chia sẻ (social, message, email)
   */
  async logShare(contentType, itemId, method) {
    try {
      await logEvent(analytics, 'share', {
        content_type: contentType,
        item_id: itemId,
        method: method,
      });
      console.log(`[Analytics] Share: ${contentType}`);
    } catch (error) {
      console.error('[Analytics Error] Share:', error);
    }
  }

  /**
   * Đánh dấu khi người dùng tham gia thử thách
   * @param {string} challengeId - ID của thử thách
   * @param {string} challengeName - Tên của thử thách
   */
  async logJoinChallenge(challengeId, challengeName) {
    try {
      await logEvent(analytics,'join_challenge', {
        challenge_id: challengeId,
        challenge_name: challengeName,
      });
      console.log(`[Analytics] Join challenge: ${challengeName}`);
    } catch (error) {
      console.error('[Analytics Error] Join challenge:', error);
    }
  }

  /**
   * Đánh dấu khi người dùng phát nhạc
   * @param {string} trackId - ID của bài hát
   * @param {string} trackName - Tên bài hát
   * @param {string} playlistId - ID của playlist
   */
  async logPlayMusic(trackId, trackName, playlistId) {
    try {
      await logEvent(analytics,'play_music', {
        track_id: trackId,
        track_name: trackName,
        playlist_id: playlistId,
      });
      console.log(`[Analytics] Play music: ${trackName}`);
    } catch (error) {
      console.error('[Analytics Error] Play music:', error);
    }
  }

  /**
   * Đánh dấu khi người dùng gửi phản hồi
   * @param {string} type - Loại phản hồi (media, text)
   * @param {boolean} hasAttachments - Có tệp đính kèm hay không
   */
  async logSendFeedback(type, hasAttachments) {
    try {
      await logEvent(analytics,'send_feedback', {
        feedback_type: type,
        has_attachments: hasAttachments,
      });
      console.log(`[Analytics] Send feedback: ${type}`);
    } catch (error) {
      console.error('[Analytics Error] Send feedback:', error);
    }
  }

  /**
   * Đánh dấu khi người dùng đăng nhập
   * @param {string} method - Phương thức đăng nhập (email, google, facebook)
   */
  async logLogin(method) {
    try {
      await logEvent(analytics, 'login',{
        method: method,
      });
      console.log(`[Analytics] Login: ${method}`);
    } catch (error) {
      console.error('[Analytics Error] Login:', error);
    }
  }

  /**
   * Đánh dấu khi xảy ra lỗi trong ứng dụng
   * @param {string} errorCode - Mã lỗi
   * @param {string} errorMessage - Thông báo lỗi
   */
  async logError(errorCode, errorMessage) {
    try {
      await logEvent(analytics,'app_error', {
        error_code: errorCode,
        error_message: errorMessage,
        device_os: Platform.OS,
        device_os_version: Platform.Version,
      });
      console.log(`[Analytics] Error: ${errorCode}`);
    } catch (error) {
      console.error('[Analytics Error] Log error:', error);
    }
  }

  /**
   * Thiết lập thuộc tính người dùng
   * @param {string} userId - ID của người dùng
   * @param {Object} properties - Thuộc tính người dùng
   */
  async setUserProperties(userId, properties = {}) {
    try {
      await setUserId(analytics, userId);
      
      // Thiết lập các thuộc tính người dùng
      await setUserPropertiesFn(analytics, properties);
      
      console.log(`[Analytics] Set user properties for user: ${userId}`);
    } catch (error) {
      console.error('[Analytics Error] Set user properties:', error);
    }
  }

  /**
   * Theo dõi hoàn thành bài tập
   * @param {string} workoutType - Loại bài tập
   * @param {number} durationMinutes - Thời gian tập (phút)
   * @param {number} caloriesBurned - Calo đã đốt
   */
  async logWorkoutComplete(workoutType, durationMinutes, caloriesBurned) {
    try {
      await logEvent(analytics,'workout_complete', {
        workout_type: workoutType,
        duration_minutes: durationMinutes,
        calories: caloriesBurned,
      });
      console.log(`[Analytics] Workout complete: ${workoutType}`);
    } catch (error) {
      console.error('[Analytics Error] Workout complete:', error);
    }
  }

  /**
   * Theo dõi tiến độ mục tiêu
   * @param {string} goalId - ID của mục tiêu
   * @param {string} goalType - Loại mục tiêu
   * @param {number} progressPercent - Phần trăm tiến độ
   */
  async logGoalProgress(goalId, goalType, progressPercent) {
    try {
      await logEvent(analytics,'goal_progress', {
        goal_id: goalId,
        goal_type: goalType,
        progress_percent: progressPercent,
      });
      console.log(`[Analytics] Goal progress: ${goalType} - ${progressPercent}%`);
    } catch (error) {
      console.error('[Analytics Error] Goal progress:', error);
    }
  }

  /**
   * Theo dõi đạt được huy hiệu
   * @param {string} badgeId - ID của huy hiệu
   * @param {string} badgeName - Tên huy hiệu
   */
  async logBadgeEarned(badgeId, badgeName) {
    try {
      await logEvent(analytics,'badge_earned', {
        badge_id: badgeId,
        badge_name: badgeName,
      });
      console.log(`[Analytics] Badge earned: ${badgeName}`);
    } catch (error) {
      console.error('[Analytics Error] Badge earned:', error);
    }
  }

  /**
   * Theo dõi thời gian tải dữ liệu
   * @param {string} dataType - Loại dữ liệu
   * @param {number} loadTimeMs - Thời gian tải (ms)
   */
  async logDataLoadTime(dataType, loadTimeMs) {
    try {
      await logEvent(analytics,'data_load_time', {
        data_type: dataType,
        time_ms: loadTimeMs,
      });
      console.log(`[Analytics] Data load time: ${dataType} - ${loadTimeMs}ms`);
    } catch (error) {
      console.error('[Analytics Error] Data load time:', error);
    }
  }
}

export default new AnalyticsService();