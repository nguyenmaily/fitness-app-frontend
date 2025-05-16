import { configureStore } from '@reduxjs/toolkit';
import achievementReducer from './reducers/achievementSlice';
import challengeReducer from './reducers/challengeSlice';
import feedbackReducer from './reducers/feedbackSlice';
import musicReducer from './reducers/musicSlice';
import authReducer from './reducers/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    achievements: achievementReducer,
    challenges: challengeReducer,
    feedback: feedbackReducer,
    music: musicReducer,
  },
});

export default store;