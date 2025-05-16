import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchChallenges, joinChallenge } from '../../store/reducers/challengeSlice';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import COLORS from '../../constants/colors';
import moment from 'moment';
import 'moment/locale/vi';

moment.locale('vi');

const ChallengesScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { challenges, userChallenges, loading } = useSelector((state) => state.challenges);
  const [refreshing, setRefreshing] = useState(false);
  
  // Giả định user_id từ Auth state
  const userId = 'current_user_id';

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    await dispatch(fetchChallenges());
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadChallenges();
    setRefreshing(false);
  };
  
  const handleJoinChallenge = (challengeId) => {
    dispatch(joinChallenge({
      user_id: userId,
      challenge_id: challengeId
    }));
    Alert.alert('Thành công', 'Bạn đã tham gia thử thách thành công!');
  };
  
  const isUserJoinedChallenge = (challengeId) => {
    return userChallenges.some(uc => uc.challenge_id === challengeId);
  };
  
  // Hàm này sẽ trả về màu sắc (gradient colors) dựa trên mức độ khó
  const getDifficultyColor = (level) => {
    switch(level) {
      case 1: return [COLORS.primary , COLORS.secondary]; // Dễ - gradient xanh dương
      case 2: return [COLORS.tertiary , COLORS.quaternary]; // Trung bình - gradient tím hồng
      case 3: return ['#FF9B9B', '#FFBDBC']; // Khó - gradient cam đỏ
      case 4: return ['#FF6B6B', '#FF8B8B']; // Rất khó - gradient đỏ
      default: return [COLORS.primary , COLORS.secondary]; // Mặc định - gradient xanh dương
    }
  };
  // Hàm này sẽ trả về icon dựa trên mức độ khó
  const getDifficultyIcon = (level) => {
    switch(level) {
      case 1: return 'sunny-outline'; // Dễ
      case 2: return 'partly-sunny-outline'; // Trung bình
      case 3: return 'thunderstorm-outline'; // Khó
      case 4: return 'flash-outline'; // Rất khó
      default: return 'sunny-outline'; // Mặc định
    }
  };

  // Hàm này sẽ trả về text dựa trên mức độ khó
  const getDifficultyText = (level) => {
    switch(level) {
      case 1: return 'Dễ';
      case 2: return 'Trung bình';
      case 3: return 'Khó';
      case 4: return 'Rất khó';
      default: return 'Không xác định';
    }
  };

  const renderChallengeItem = ({ item }) => {
    const isJoined = isUserJoinedChallenge(item.id);
    const isActive = new Date() >= new Date(item.start_date) && new Date() <= new Date(item.end_date);
    const difficultyColor = getDifficultyColor(item.difficulty_level);
    
    return (
      <TouchableOpacity 
        style={styles.challengeCard}
        onPress={() => navigation.navigate('Leaderboard', { challenge: item })}
      >
        <View style={styles.challengeHeader}>
          <View style={[styles.challengeStatus, isActive ? styles.activeStatus : styles.inactiveStatus]}>
            <Text style={styles.statusText}>{isActive ? 'Đang diễn ra' : 'Sắp diễn ra'}</Text>
          </View>

          <LinearGradient
            colors={difficultyColor}
            style={styles.difficultyBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name={getDifficultyIcon(item.difficulty_level)} size={12} color={COLORS.white} style={{marginRight: 4}} />
            <Text style={styles.difficultyText}>{getDifficultyText(item.difficulty_level)}</Text>
          </LinearGradient>
        </View>
        
        <Text style={styles.challengeName}>{item.name}</Text>
        <Text style={styles.challengeDescription}>{item.description}</Text>
        
        <View style={styles.timeContainer}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.darkGray} />
          <Text style={styles.timeText}>
            {new Date(item.start_date).toLocaleDateString('vi-VN')} - {new Date(item.end_date).toLocaleDateString('vi-VN')}
          </Text>
        </View>
        
        <View style={styles.rewardContainer}>
          <Ionicons name="trophy-outline" size={16} color="#ffd700" />
          <Text style={styles.rewardText}>{item.reward_points} điểm</Text>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.leaderboardButton]}
            onPress={() => navigation.navigate('Leaderboard', { challenge: item })}
          >
            <Ionicons name="podium-outline" size={16} color={COLORS.primary} />
            <Text style={styles.leaderboardButtonText}>Bảng xếp hạng</Text>
          </TouchableOpacity>
          
          {!isJoined ? (
            <TouchableOpacity 
              style={[styles.actionButton, styles.joinButton , !isActive && styles.disabledButton]}
              onPress={() => handleJoinChallenge(item.id)}
              disabled={!isActive}
            >
              <Ionicons name="add-circle-outline" size={16} color={COLORS.white} />
              <Text style={styles.joinButtonText}>Tham gia</Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.actionButton, styles.joinedButton]}>
              <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.white}/>
              <Text style={styles.joinButtonText}>Đã tham gia</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerButtons}>
        <TouchableOpacity 
          style={styles.badgesButton}
          onPress={() => navigation.navigate('Badges')}
        >
          <Ionicons name="ribbon-outline" size={16} color={COLORS.primary} />
          <Text style={styles.badgesButtonText}>Huy hiệu của tôi</Text>
        </TouchableOpacity>
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={challenges}
          renderItem={renderChallengeItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="fitness-outline" size={64} color="#c1c9d6" />
              <Text style={styles.emptyText}>Không có thử thách nào</Text>
              <Text style={styles.emptySubText}>Các thử thách mới sẽ sớm được cập nhật</Text>
            </View>
          }
        />
      )}
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
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    paddingBottom: 8,
  },
  badgesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  badgesButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  challengeCard: {
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
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  challengeStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  activeStatus: {
    backgroundColor: '#e8f5e9',
  },
  inactiveStatus: {
    backgroundColor: '#e0f7fa',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.black,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.white,
  },
  challengeName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 8,
  },
  challengeDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginLeft: 6,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rewardText: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '500',
    marginLeft: 6,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
  },
  leaderboardButton: {
    backgroundColor: '${COLORS.primary}20',
    marginRight: 8,
  },
  leaderboardButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  joinButton: {
    backgroundColor: COLORS.primary,
  },
  disabledButton: {
    backgroundColor: COLORS.mediumGray,
  },
  joinedButton: {
    backgroundColor: '#4CD964', // Success green
  },
  joinButtonText: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color:COLORS.black,
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color:  COLORS.darkGray,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default ChallengesScreen;