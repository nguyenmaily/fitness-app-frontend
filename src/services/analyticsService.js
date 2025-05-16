import analytics from 'expo-firebase-analytics';

class AnalyticsService {
  // Đánh dấu khi người dùng xem màn hình
  async logScreenView(screenName, screenClass) {
    try {
      await analytics().logScreenView({
        screen_name: screenName,
        screen_class: screenClass,
      });
    } catch (error) {
      console.error('Error logging screen view:', error);
    }
  }

  // Đánh dấu khi người dùng đạt thành tích
  async logAchievement(achievementId, type) {
    try {
      await analytics().logEvent('achievement_unlocked', {
        achievement_id: achievementId,
        achievement_type: type,
      });
    } catch (error) {
      console.error('Error logging achievement:', error);
    }
  }

  // Đánh dấu khi người dùng chia sẻ nội dung
  async logShare(contentType, itemId, method) {
    try {
      await analytics().logShare({
        content_type: contentType,
        item_id: itemId,
        method: method,
      });
    } catch (error) {
      console.error('Error logging share:', error);
    }
  }

  // Đánh dấu khi người dùng tham gia thử thách
  async logJoinChallenge(challengeId, challengeName) {
    try {
      await analytics().logEvent('join_challenge', {
        challenge_id: challengeId,
        challenge_name: challengeName,
      });
    } catch (error) {
      console.error('Error logging join challenge:', error);
    }
  }

  // Đánh dấu khi người dùng phát nhạc
  async logPlayMusic(trackId, trackName, playlistId) {
    try {
      await analytics().logEvent('play_music', {
        track_id: trackId,
        track_name: trackName,
        playlist_id: playlistId,
      });
    } catch (error) {
      console.error('Error logging play music:', error);
    }
  }

  // Đánh dấu khi người dùng gửi phản hồi
  async logSendFeedback(type, hasAttachments) {
    try {
      await analytics().logEvent('send_feedback', {
        feedback_type: type,
        has_attachments: hasAttachments,
      });
    } catch (error) {
      console.error('Error logging send feedback:', error);
    }
  }
}

export default new AnalyticsService();