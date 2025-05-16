import * as Linking from 'expo-linking';
import { Alert } from 'react-native';

export const deepLinkPrefix = Linking.createURL('/');

export const deepLinkingConfig = {
  prefixes: [deepLinkPrefix, 'fitnessapp://', 'https://fitnessapp.example.com'],
  config: {
    screens: {
      // Định nghĩa cấu trúc màn hình cho deep linking
      Achievements: {
        path: 'achievements',
        screens: {
          AchievementHistory: 'history',
          ShareAchievement: 'share/:id',
        },
      },
      Challenges: {
        path: 'challenges',
        screens: {
          Challenges: 'list',
          Leaderboard: 'leaderboard/:id',
          Badges: 'badges',
        },
      },
      Feedback: {
        path: 'feedback',
        screens: {
          TrainerFeedback: 'list',
          SendMedia: 'send-media',
        },
      },
      Music: {
        path: 'music',
        screens: {
          Playlists: 'playlists',
          MusicPlayer: 'player/:id',
        },
      },
    },
  },
};

export const createShareLink = (screenPath, params = {}) => {
  return Linking.createURL(screenPath, {
    queryParams: params,
  });
};

export const handleDeepLink = (url, navigation) => {
  // Xử lý khi nhận được Deep Link
  console.log('Received deep link:', url);
  // Logic xử lý deep link tùy vào ứng dụng
};

export const shareViaDeepLink = async (link, message) => {
  try {
    const result = await Linking.canOpenURL(link);
    
    if (result) {
      await Linking.openURL(link);
    } else {
      Alert.alert('Lỗi', 'Không thể mở ứng dụng để chia sẻ.');
    }
  } catch (error) {
    console.error('Error sharing via deep link:', error);
    Alert.alert('Lỗi', 'Không thể chia sẻ: ' + error.message);
  }
};