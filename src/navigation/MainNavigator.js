import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import COLORS from '../constants/colors';

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
const AchievementStack = createStackNavigator();
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
    <AchievementStack.Screen name="AchievementHistory" component={AchievementHistoryScreen} options={{ title: 'Lịch sử thành tích' }} />
    <AchievementStack.Screen name="ShareAchievement" component={ShareAchievementScreen} options={{ title: 'Chia sẻ thành tích' }} />
  </AchievementStack.Navigator>
);

const ChallengeStack = createStackNavigator();
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
    <ChallengeStack.Screen name="Challenges" component={ChallengesScreen} options={{ title: 'Thử thách' }} />
    <ChallengeStack.Screen name="Leaderboard" component={LeaderboardScreen} options={{ title: 'Bảng xếp hạng' }} />
    <ChallengeStack.Screen name="Badges" component={BadgesScreen} options={{ title: 'Huy hiệu' }} />
  </ChallengeStack.Navigator>
);

const FeedbackStack = createStackNavigator();
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
    <FeedbackStack.Screen name="TrainerFeedback" component={TrainerFeedbackScreen} options={{ title: 'Phản hồi từ HLV' }} />
    <FeedbackStack.Screen name="SendMedia" component={SendMediaScreen} options={{ title: 'Gửi media' }} />
  </FeedbackStack.Navigator>
);

const MusicStack = createStackNavigator();
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
    <MusicStack.Screen name="Playlists" component={PlaylistsScreen} options={{ title: 'Danh sách nhạc' }} />
    <MusicStack.Screen 
      name="MusicPlayer" 
      component={MusicPlayerScreen} 
      options={{ title: 'Trình phát nhạc' }}
    />
  </MusicStack.Navigator>
);
// Auth Navigator
const AuthStack = createStackNavigator();
const AuthNavigator = () => (
  <AuthStack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <AuthStack.Screen name="Login" component={PlaceholderLoginScreen} />
  </AuthStack.Navigator>
);

// Main Navigator (chứa Auth và Main tab)
const MainStack = createStackNavigator();
const RootNavigator = () => (
  <MainStack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <MainStack.Screen name="Auth" component={AuthNavigator} />
    <MainStack.Screen name="MainTab" component={MainNavigator} />
  </MainStack.Navigator>
);

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

export default MainNavigator;