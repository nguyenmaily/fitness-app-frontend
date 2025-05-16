import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserBadges } from '../../store/reducers/challengeSlice';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import COLORS from '../../constants/colors';

const BadgesScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { badges, loading } = useSelector((state) => state.challenges);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'earned', 'unearned'
  
  // Giả định user_id từ auth state
  const userId = 'current_user_id';

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    await dispatch(fetchUserBadges(userId));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBadges();
    setRefreshing(false);
  };
  
  const getFilteredBadges = () => {
    if (filter === 'all') return badges;
    if (filter === 'earned') return badges.filter(badge => badge.date_earned);
    if (filter === 'unearned') return badges.filter(badge => !badge.date_earned);
    return badges;
  };
  
  // Thay thế badge image bằng component
  const BadgeImage = ({ badge, isEarned, size = 80 }) => {
    // Màu gradient dựa trên loại badge
    const getGradientColors = () => {
      if (!badge || !badge.badge) return [COLORS.primary, COLORS.secondary];
      
      const name = badge.badge.name?.toLowerCase() || '';
      
      if (name.includes('gold') || name.includes('vàng')) {
        return ['#FFD700', '#FFC000']; // Gold gradient
      } else if (name.includes('silver') || name.includes('bạc')) {
        return ['#C0C0C0', '#A9A9A9']; // Silver gradient
      } else if (name.includes('bronze') || name.includes('đồng')) {
        return ['#CD7F32', '#8B4513']; // Bronze gradient
      } else if (name.includes('streak') || name.includes('liên tục')) {
        return [COLORS.tertiary, COLORS.quaternary]; // Streak badges
      }
      
      return [COLORS.primary, COLORS.secondary]; // Default
    };
    
    // Chọn icon dựa trên loại badge
    const getBadgeIcon = () => {
      if (!badge || !badge.badge) return 'ribbon';
      
      const name = badge.badge.name?.toLowerCase() || '';
      const description = badge.badge.description?.toLowerCase() || '';
      
      if (name.includes('distance') || name.includes('khoảng cách') || description.includes('km')) {
        return 'speedometer';
      } else if (name.includes('calorie') || name.includes('calo')) {
        return 'flame';
      } else if (name.includes('time') || name.includes('thời gian')) {
        return 'time';
      } else if (name.includes('streak') || name.includes('liên tục')) {
        return 'calendar';
      } else if (name.includes('challenge') || name.includes('thử thách')) {
        return 'trophy';
      }
      
      return 'ribbon';
    };

     return (
      <View style={{ opacity: isEarned ? 1 : 0.5 }}>
        <LinearGradient
          colors={getGradientColors()}
          style={[
            styles.badgeImage, 
            { 
              width: size, 
              height: size,
              borderRadius: size/2 
            }
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name={getBadgeIcon()} size={size * 0.5} color={COLORS.white} />
        </LinearGradient>
        
        {isEarned && (
          <View style={styles.earnedBadge}>
            <Ionicons name="checkmark-circle" size={24} color="#4CD964" />
          </View>
        )}
      </View>
    );
  };
  

  const renderBadgeItem = ({ item }) => {
    const isEarned = item.date_earned != null;
    
    return (
      <TouchableOpacity 
        style={[
          styles.badgeCard,
          !isEarned && styles.unearnedBadge
        ]}
        onPress={() => {/* Xử lý khi nhấn vào huy hiệu */}}
      >
        <View style={styles.badgeImageContainer}>
          <BadgeImage badge={item} isEarned={isEarned} />
        </View>
        
        <Text style={styles.badgeName}>{item.badge?.name || 'Huy hiệu'}</Text>
        <Text style={styles.badgeDescription}>{item.badge?.description || 'Mô tả huy hiệu'}</Text>
        
        {isEarned ? (
          <Text style={styles.earnedText}>Đã đạt được vào {new Date(item.date_earned).toLocaleDateString('vi-VN')}</Text>
        ) : (
          <Text style={styles.unearnedText}>Chưa đạt được</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[
            styles.filterButton,
            filter === 'all' && styles.activeFilter
          ]}
          onPress={() => setFilter('all')}
        >
          <Text style={[
            styles.filterText,
            filter === 'all' && styles.activeFilterText
          ]}>Tất cả</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterButton,
            filter === 'earned' && styles.activeFilter
          ]}
          onPress={() => setFilter('earned')}
        >
          <Text style={[
            styles.filterText,
            filter === 'earned' && styles.activeFilterText
          ]}>Đã đạt được</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterButton,
            filter === 'unearned' && styles.activeFilter
          ]}
          onPress={() => setFilter('unearned')}
        >
          <Text style={[
            styles.filterText,
            filter === 'unearned' && styles.activeFilterText
          ]}>Chưa đạt được</Text>
        </TouchableOpacity>
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={getFilteredBadges()}
          renderItem={renderBadgeItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="ribbon-outline" size={64} color={COLORS.lightGray} />
              <Text style={styles.emptyText}>Không có huy hiệu</Text>
              <Text style={styles.emptySubText}>Hoàn thành các thử thách để nhận huy hiệu</Text>
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
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  activeFilter: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  activeFilterText: {
    color: COLORS.white,
    fontWeight: '500',
  },
  listContainer: {
    padding: 8,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    padding: 8,
  },
  badgeCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  unearnedBadge: {
    opacity: 0.8,
  },
  badgeImageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  badgeImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  earnedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: 8,
  },
  earnedText: {
    fontSize: 10,
    color: '#4cd964',
    fontWeight: '500',
    textAlign: 'center',
  },
  unearnedText: {
    fontSize: 10,
    color: COLORS.darkGray,
    textAlign: 'center',
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

export default BadgesScreen;