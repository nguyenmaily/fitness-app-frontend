import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserFeedback, markFeedbackAsRead } from '../../store/reducers/feedbackSlice';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import COLORS from '../../constants/colors';
import moment from 'moment';
import 'moment/locale/vi';

moment.locale('vi');

const TrainerFeedbackScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { feedback, loading } = useSelector((state) => state.feedback);
  const [refreshing, setRefreshing] = useState(false);
  
  // Giả định user_id từ Auth state
  const userId = 'current_user_id';
  
  useEffect(() => {
    loadFeedback();
  }, []);
  
  const loadFeedback = async () => {
    await dispatch(fetchUserFeedback(userId));
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFeedback();
    setRefreshing(false);
  };

  const handleMarkAsRead = (feedbackId) => {
    dispatch(markFeedbackAsRead(feedbackId));
  };
  
  // Thay thế avatar bằng component
  const TrainerAvatar = ({ trainer, size = 40 }) => {
    // Nếu trainer có avatar_url thì sẽ được xử lý ở component gọi
    // Đây là avatar mặc định khi không có hình
    return (
      <View style={[
        styles.trainerAvatarContainer, 
        { 
          width: size, 
          height: size, 
          borderRadius: size/2,
          backgroundColor: COLORS.tertiary
        }
      ]}>
        <Ionicons name="fitness" size={size*0.6} color={COLORS.white} />
      </View>
    );
  };

  const renderFeedbackItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={[
          styles.feedbackCard,
          !item.is_read && styles.unreadCard
        ]}
        onPress={() => {
          handleMarkAsRead(item.id);
          // Nếu có attachment_urls, hiển thị attachment
          if (item.attachment_urls && item.attachment_urls.length > 0) {
            navigation.navigate('FeedbackDetail', { feedback: item });
          }
        }}
      >
        <View style={styles.feedbackHeader}>
          <TrainerAvatar trainer={item.trainer} />
          <View style={styles.feedbackInfo}>
            <View style = {styles.nameContainer}>
              <Text style={styles.trainerName}>
                {item.trainer?.username || 'Huấn luyện viên'}
              </Text>
              {!item.is_read && <View style={styles.unreadDot} />}
            </View>
            <Text style={styles.feedbackDate}>
              {new Date(item.created_at).toLocaleDateString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
              })}.{new Date(item.created_at).toLocaleTimeString('vi-VN')}
            </Text>
          </View>
        </View>
        
        <Text style={styles.feedbackContent}>{item.content}</Text>
        
        {item.attachment_urls && item.attachment_urls.length > 0 && (
          <View style={styles.attachmentContainer}>
            <Ionicons name="attach" size={16} color={COLORS.darkGray} />
            <Text style={styles.attachmentText}>
              {item.attachment_urls.length} {item.attachment_urls.length > 1 ? 'tệp đính kèm' : 'tệp đính kèm'}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.headerButtons}>
        <TouchableOpacity 
          style={styles.sendMediaButton}
          onPress={() => navigation.navigate('SendMedia')}
        >
          <Ionicons name="camera-outline" size={16} color="#5e72e4" />
          <Text style={styles.sendMediaButtonText}>Gửi video/hình ảnh</Text>
        </TouchableOpacity>
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={feedback}
          renderItem={renderFeedbackItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color={COLORS.lightGray} />
              <Text style={styles.emptyText}>Chưa có phản hồi nào</Text>
              <Text style={styles.emptySubText}>Hãy gửi video tập luyện để nhận phản hồi từ huấn luyện viên</Text>
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
  sendMediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  sendMediaButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  feedbackCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  trainerAvatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackInfo: {
    marginLeft: 12,
    flex: 1,
  },
  trainerName: {
    fontSize: 16,
    fontWeight: '600',
   color: COLORS.black,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  feedbackDate: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 2,
  },
  feedbackContent: {
    fontSize: 14,
    color: COLORS.black,
    lineHeight: 20,
    marginBottom: 12,
  },
  attachmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  attachmentText: {
    fontSize: 12,
    marginLeft: 4,
    color: COLORS.darkGray,
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

export default TrainerFeedbackScreen;