import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để tự động thêm token authentication vào header
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API functions cho Lịch sử thành tích
export const achievementAPI = {
  getUserAchievements: (userId) => api.get(`/achievements/user/${userId}`),
  createAchievement: (data) => api.post('/achievements', data),
  shareAchievement: (data) => api.post('/achievements/share', data),
};

// API functions cho Thử thách & Xếp hạng
export const challengeAPI = {
  getChallenges: () => api.get('/challenges'),
  joinChallenge: (data) => api.post('/challenges/join', data),
  getChallengeLeaderboard: (challengeId) => api.get(`/challenges/${challengeId}/leaderboard`),
  getUserBadges: (userId) => api.get(`/challenges/badges/user/${userId}`),
};

// API functions cho Phản hồi từ huấn luyện viên
export const feedbackAPI = {
  getUserFeedback: (userId) => api.get(`/feedback/user/${userId}`),
  sendFeedback: (data) => api.post('/feedback/send', data),
  sendMediaForFeedback: (data) => api.post('/feedback/send-media', data),
  markFeedbackAsRead: (feedbackId) => api.put(`/feedback/${feedbackId}/read`),
};

// API functions cho Thư viện nhạc
export const musicAPI = {
  getPlaylists: () => api.get('/music/playlists'),
  getPlaylistsByWorkoutType: (workoutType) => api.get(`/music/playlists/workout/${workoutType}`),
  createPlaylist: (data) => api.post('/music/playlists', data),
  searchSpotifyTracks: (query) => api.get(`/music/search?q=${query}`),
  updateMusicPreferences: (data) => api.put('/music/preferences', data),
};

export default api;