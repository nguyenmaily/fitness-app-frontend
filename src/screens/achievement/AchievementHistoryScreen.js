import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserAchievements } from '../../store/reducers/achievementSlice';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import COLORS from '../../constants/colors';
import moment from 'moment';
import 'moment/locale/vi';
import analyticsService from '../../services/analyticsService';
import performanceMonitor from '../../services/performanceMonitor';
import { selectCurrentUserId } from '../../store/reducers/authSlice';
moment.locale('vi');

const AchievementHistoryScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { achievements, loading } = useSelector((state) => state.achievements);
  const [refreshing, setRefreshing] = useState(false);

  // Giả định user_id từ Auth state
  const userId = useSelector(selectCurrentUserId);

  // Log screen view khi component mount
  useEffect(() => {
    analyticsService.logScreenView('AchievementHistory', 'AchievementHistoryScreen');
  }, []);

  useEffect(() => {
    const startTime = Date.now(); // Bắt đầu đo thời gian tải
    loadAchievements().then(() => {
      // Theo dõi thời gian tải
      performanceMonitor.trackDataFetch('achievements', startTime);
    });
  }, []);

  const loadAchievements = async () => {
    await dispatch(fetchUserAchievements(userId));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    analyticsService.logEvent('pull_to_refresh', {
      screen: 'AchievementHistory'
    });
    
    const startTime = Data.now();
    await loadAchievements();
    performanceMonitor.trackDataFetch('achievements_refresh', startTime);
    
    setRefreshing(false);
  };

  const getAchievementIcon = (type) => {
    switch (type) {
      case 'distance':
        return 'walk-outline';
      case 'calories':
        return 'flame-outline';
      case 'time':
        return 'time-outline';
      case 'streak':
        return 'calendar-outline';
      default:
        return 'trophy-outline';
    }
  };

  const getIconBgColor = (type) => {
    switch (type) {
      case 'distance':
      case 'time':
        return '${COLORS.primary}20'; // 20 là opacity 0.12
      case 'calories':
      case 'streak':
        return '${COLORS.tertiary}20';
      default:
        return '${COLORS.primary}20';
    }
  };
  
  // Log khi người dùng xem chi tiết thành tích
  const handleAchievementPress = (achievement) => {
    analyticsService.logEvent('view_achievement_detail', {
      achievement_id: achievement.id,
      achievement_type: achievement.achievement_type
    });
    
    navigation.navigate('ShareAchievement', { achievement });
  };

  const renderAchievementItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.achievementCard}
        onPress={() => handleAchievementPress(item)}
      >
        <View style={styles.achievementHeader}>
          <View style={[
            styles.iconContainer,
            { backgroundColor: getIconBgColor(item.achievement_type)}
          ]}>
            <Ionicons name={getAchievementIcon(item.achievement_type)} size={24} color={getIconBgColor(item.achievement_type)} />
          </View>
          <View style={styles.achievementInfo}>
            <Text style={styles.achievementTitle}>
              {item.achievement_type === 'distance' ? 'Khoảng cách' :
               item.achievement_type === 'calories' ? 'Đốt calo' :
               item.achievement_type === 'time' ? 'Thời gian tập' :
               item.achievement_type === 'streak' ? 'Tập liên tục' : 'Thành tích'}
            </Text>
            <Text style={styles.achievementDate}>
              {new Date(item.date_achieved).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
          <View style={styles.shareIcon}>
            {item.is_shared ? (
              <Ionicons name="share-social" size={24} color= {COLORS.primary} />
            ) : (
              <Ionicons name="share-social-outline" size={24} color= {COLORS.mediumGray} />
            )}
          </View>
        </View>
        
        <View style={styles.metricsContainer}>
          {item.metrics && item.metrics.distance && (
            <View style={styles.metricItem}>
              <Ionicons name="walk-outline" size={16} color= {COLORS.primary} />
              <Text style={styles.metricText}>{item.metrics.distance} km</Text>
            </View>
          )}
          
          {item.metrics && item.metrics.calories && (
            <View style={styles.metricItem}>
              <Ionicons name="flame-outline" size={16} color= {COLORS.tertiary} />
              <Text style={styles.metricText}>{item.metrics.calories} kcal</Text>
            </View>
          )}
          
          {item.metrics && item.metrics.time && (
            <View style={styles.metricItem}>
              <Ionicons name="time-outline" size={16} color= {COLORS.primary} />
              <Text style={styles.metricText}>{item.metrics.time} phút</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color= {COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={achievements}
        renderItem={renderAchievementItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={() => {
          // Log khi người dùng cuộn đến cuối danh sách
          if (achievements.length > 0) {
            analyticsService.logEvent('list_end_reached', {
              screen: 'AchievementHistory',
              items_count: achievements.length
            });
          }
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="fitness-outline" size={64} color={COLORS.lightGray} />
            <Text style={styles.emptyText}>Bạn chưa có thành tích nào</Text>
            <Text style={styles.emptySubText}>Hãy bắt đầu tập luyện để có thành tích</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.border,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  achievementCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementInfo: {
    flex: 1,
    marginLeft: 12,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
  },
  achievementDate: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 2,
  },
  shareIcon: {
    padding: 8,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  metricText: {
    fontSize: 14,
    marginLeft: 4,
    color: COLORS.black,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default AchievementHistoryScreen;