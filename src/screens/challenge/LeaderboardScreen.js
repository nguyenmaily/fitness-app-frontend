import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchChallengeLeaderboard } from '../../store/reducers/challengeSlice';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import COLORS from '../../constants/colors';
import moment from 'moment';
import 'moment/locale/vi';

moment.locale('vi');

const LeaderboardScreen = ({ route, navigation }) => {
  const { challenge } = route.params;
  const dispatch = useDispatch();
  const { leaderboard, loading } = useSelector((state) => state.challenges);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    if (challenge?.id) {
      await dispatch(fetchChallengeLeaderboard(challenge.id));
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboard();
    setRefreshing(false);
  };

  const getFormattedDate = () => {
    if (!challenge) return '';
    
    const startDate = moment(challenge.start_date).format('DD/MM/YYYY');
    const endDate = moment(challenge.end_date).format('DD/MM/YYYY');
    return `${startDate} - ${endDate}`;
  };
  
  // Component thay thế cho avatar
  const UserAvatar = ({ user, rank, size = 48 }) => {
    // Màu dựa vào thứ hạng
    const getAvatarColors = () => {
      switch(rank) {
        case 1: return ['#FFD700', '#FFC000']; // Gold
        case 2: return ['#C0C0C0', '#A9A9A9']; // Silver
        case 3: return ['#CD7F32', '#8B4513']; // Bronze
        default: return [COLORS.primary, COLORS.secondary]; // Default
      }
    };
    
    // Icon dựa vào thứ hạng
    const getAvatarIcon = () => {
      if (rank === 1) return 'trophy';
      return 'person';
    };
    
    return (
      <LinearGradient
        colors={getAvatarColors()}
        style={[
          styles.userAvatar, 
          { 
            width: size, 
            height: size, 
            borderRadius: size/2 
          }
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name={getAvatarIcon()} size={size * 0.6} color={COLORS.white} />
      </LinearGradient>
    );
  };

  const renderLeaderboardItem = ({ item, index }) => {
    // Màu sắc theo thứ hạng
    let rankColor = '#8e9aaf';
    let rankBgColor = '#f4f5fa';
    
    if (index === 0) {
      rankColor = '#FFD700'; // Gold
      rankBgColor = 'rgba(255, 215, 0, 0.1)';
    } else if (index === 1) {
      rankColor = '#C0C0C0'; // Silver
      rankBgColor = 'rgba(192, 192, 192, 0.1)';
    } else if (index === 2) {
      rankColor = '#CD7F32'; // Bronze
      rankBgColor = 'rgba(205, 127, 50, 0.1)';
    }
    
    return (
      <View style={styles.leaderboardItem}>
        <View 
          style={[
            styles.rankContainer,
            { backgroundColor: rankBgColor }
          ]}
        >
          <Text style={[styles.rankText, { color: rankColor }]}>
            {index + 1}
          </Text>
        </View>
        
        <UserAvatar 
          user={item.users} 
          rank={index + 1}
        />
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.users?.username || 'Người dùng'}</Text>
          <Text style={styles.progressText}>Tiến độ: {Math.round(item.progress * 100)}%</Text>
        </View>
        
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{Math.round(item.progress * 100)}</Text>
          <Text style={styles.scoreLabel}>Điểm</Text>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.challengeName}>{challenge?.name}</Text>
      <Text style={styles.challengeDate}>{getFormattedDate()}</Text>
      
      <View style={styles.challengeInfoContainer}>
        <View style={styles.infoItem}>
          <Ionicons name="people-outline" size={20} color={COLORS.primary} />
          <Text style={styles.infoText}>{leaderboard.length} người tham gia</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Ionicons name="trophy-outline" size={20} color="#FFD700" />
          <Text style={styles.infoText}>{challenge?.reward_points || 0} điểm</Text>
        </View>
      </View>
      
      <View style={styles.leaderboardHeader}>
        <Text style={styles.leaderboardTitle}>Bảng xếp hạng</Text>
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => {/* Xử lý lọc */}}
        >
          <Ionicons name="filter-outline" size={20} color={COLORS.primary} />
          <Text style={styles.filterText}>Lọc</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={leaderboard}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="podium-outline" size={64} color={COLORS.lightGray} />
            <Text style={styles.emptyText}>Chưa có người tham gia</Text>
            <Text style={styles.emptySubText}>Hãy là người đầu tiên tham gia thử thách này</Text>
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
  headerContainer: {
    marginBottom: 16,
  },
  challengeName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 4,
  },
  challengeDate: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 16,
  },
  challengeInfoContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    marginLeft: 4,
    fontSize: 14,
    color: COLORS.black,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterText: {
    marginLeft: 4,
    fontSize: 14,
    color: COLORS.primary,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  rankContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 16,
    fontWeight: '700',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 4,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  scoreLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 20,
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

export default LeaderboardScreen;