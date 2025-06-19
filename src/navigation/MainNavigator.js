import React from 'react';
import { ScrollView } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import COLORS from '../constants/colors';
import analyticsService from '../services/analyticsService';
import { useSelector } from 'react-redux';

// Import màn hình
import AchievementHistoryScreen from '../screens/achievement/AchievementHistoryScreen';
import ShareAchievementScreen from '../screens/achievement/ShareAchievementScreen';
import LeaderboardScreen from '../screens/challenge/LeaderboardScreen';
import ChallengesScreen from '../screens/challenge/ChallengesScreen';
import BadgesScreen from '../screens/challenge/BadgesScreen';
import TrainerFeedbackScreen from '../screens/feedback/TrainerFeedbackScreen';
import SendMediaScreen from '../screens/feedback/SendMediaScreen';
import MusicPlayerScreen from '../screens/music/MusicPlayerScreen';
import PlaylistsScreen from '../screens/music/PlaylistsScreen';
import PlaceholderLoginScreen from '../screens/auth/PlaceholderLoginScreen'; 

// Stack Navigators
const AchievementStack = createNativeStackNavigator();
const AchievementNavigator = () => (
  <AchievementStack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: COLORS.white,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
      },
      headerTintColor: COLORS.black,
      headerTitleStyle: {
        fontWeight: '600',
      },
    }}
  >
    <AchievementStack.Screen name="AchievementHistory" component={AchievementHistoryScreen} options={{ title: 'Lịch sử thành tích', headerShown: true }} />
    <AchievementStack.Screen name="ShareAchievement" component={ShareAchievementScreen} options={{ title: 'Chia sẻ thành tích' , headerShown: true }} />
  </AchievementStack.Navigator>
);

const ChallengeStack = createNativeStackNavigator();
const ChallengeNavigator = () => (
  <ChallengeStack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: COLORS.white,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
      },
      headerTintColor: COLORS.black,
      headerTitleStyle: {
        fontWeight: '600',
      },
    }}
  >
    <ChallengeStack.Screen name="Challenges" component={ChallengesScreen} options={{ title: 'Thử thách' , headerShown: true }} />
    <ChallengeStack.Screen name="Leaderboard" component={LeaderboardScreen} options={{ title: 'Bảng xếp hạng' , headerShown: true}} />
    <ChallengeStack.Screen name="Badges" component={BadgesScreen} options={{ title: 'Huy hiệu' , headerShown: true}} />
  </ChallengeStack.Navigator>
);

const FeedbackStack = createNativeStackNavigator();
const FeedbackNavigator = () => (
  <FeedbackStack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: COLORS.white,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
      },
      headerTintColor: COLORS.black,
      headerTitleStyle: {
        fontWeight: '600',
      },
    }}
  >
    <FeedbackStack.Screen name="TrainerFeedback" component={TrainerFeedbackScreen} options={{ title: 'Phản hồi từ HLV' , headerShown: true}} />
    <FeedbackStack.Screen name="SendMedia" component={SendMediaScreen} options={{ title: 'Gửi media' , headerShown: true }} />
  </FeedbackStack.Navigator>
);

const MusicStack = createNativeStackNavigator();
const MusicNavigator = () => (
  <MusicStack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: COLORS.white,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
      },
      headerTintColor: COLORS.black,
      headerTitleStyle: {
        fontWeight: '600',
      },
    }}
  >
    <MusicStack.Screen name="Playlists" component={PlaylistsScreen} options={{ title: 'Danh sách nhạc' , headerShown: true }} />
    <MusicStack.Screen 
      name="MusicPlayer" 
      component={MusicPlayerScreen} 
      options={{ title: 'Trình phát nhạc' , headerShown: true }}
    />
  </MusicStack.Navigator>
);
// Auth Navigator
const AuthStack = createNativeStackNavigator();
const AuthNavigator = () => (
  <AuthStack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <AuthStack.Screen name="Login" component={PlaceholderLoginScreen} />
    {/* Thêm màn hình đăng ký nếu cần */}
    {/* <AuthStack.Screen name="Signup" component={SignupScreen} /> */}
  </AuthStack.Navigator>
);

// Main Navigator - Điều hướng dựa trên trạng thái đăng nhập
const MainStack = createNativeStackNavigator();
const RootNavigator = () => {
  const authState = useSelector(state => {
    // Debug để xem state có tồn tại không
    console.log('Full state in RootNavigator:', state);
    
    // Kiểm tra an toàn hơn
    if (!state) {
      console.warn('Redux state is null/undefined');
      return { user: null, status: 'idle', error: null };
    }
    
    if (!state.auth) {
      console.warn('Auth state not found in Redux store');
      return { user: null, status: 'idle', error: null };
    }
    
    return state.auth;
  });
  
  console.log('Redux auth state:', authState);

  // Các logic điều hướng dựa trên state
  const { user } = authState;

  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <MainStack.Screen name="MainTab" component={MainNavigator} />
      ) : (
        <MainStack.Screen name="Auth" component={AuthNavigator} />
      )}
    </MainStack.Navigator>
  );
};


// Tab Navigator
const Tab = createBottomTabNavigator();

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Achievements') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'Challenges') {
            iconName = focused ? 'medal' : 'medal-outline';
          } else if (route.name === 'Feedback') {
            iconName = focused ? 'chatbubble' : 'chatbubble-outline';
          } else if (route.name === 'Music') {
            iconName = focused ? 'musical-notes' : 'musical-notes-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.mediumGray,
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 60,
          paddingBottom: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
      screenListeners={({ route }) => ({
        tabPress: e => {
          // Log khi người dùng nhấn vào tab
          analyticsService.logEvent('tab_pressed', {
            tab_name: route.name
          });
        },
      })}
    >
      <Tab.Screen 
        name="Achievements" 
        component={AchievementNavigator} 
        options={{ title: 'Thành tích' }}
      />
      <Tab.Screen 
        name="Challenges" 
        component={ChallengeNavigator} 
        options={{ title: 'Thử thách' }}
      />
      <Tab.Screen 
        name="Feedback" 
        component={FeedbackNavigator} 
        options={{ title: 'Phản hồi' }}
      />
      <Tab.Screen 
        name="Music" 
        component={MusicNavigator} 
        options={{ title: 'Nhạc' }}
      />
    </Tab.Navigator>
  );
};

export default RootNavigator;