import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { shareAchievement } from '../../store/reducers/achievementSlice';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot';
import moment from 'moment';
import 'moment/locale/vi';
import analyticsService from '../../services/analyticsService';

moment.locale('vi');

const ShareAchievementScreen = ({ route, navigation }) => {
  const { achievement } = route.params;
  const dispatch = useDispatch();
  const { sharingStatus } = useSelector((state) => state.achievements);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  

  const viewShotRef = React.useRef();
  
  // Log screen view
  useEffect(() => {
    analyticsService.logScreenView('ShareAchievement', 'ShareAchievementScreen');
  }, []);
  
  // Log khi chọn nền tảng chia sẻ
  const togglePlatform = (platform) => {
    analyticsService.logEvent('select_share_platform', {
      platform: platform,
      achievement_id: achievement.id
    });
    
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };

  // Thay đổi: Thay logo.png bằng Logo X component
  const LogoX = () => (
    <View style={styles.logoContainer}>
      <Text style={styles.logoX}>X</Text>
      <Text style={styles.appName}>Fitness X</Text>
    </View>
  );
  
  const handleShare = async () => {
    try {
      if (selectedPlatforms.length === 0) {
        Alert.alert('Thông báo', 'Vui lòng chọn ít nhất một nền tảng để chia sẻ');
        return;
      }
      
      // Ghi nhận bắt đầu quá trình chia sẻ
      analyticsService.logEvent('start_sharing_process', {
        achievement_id: achievement.id,
        platforms: selectedPlatforms.join(',')
      });

      // Chụp ảnh card thành tích
      const uri = await viewShotRef.current.capture();
      
      // Chia sẻ qua Expo Sharing
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
        
        // Cập nhật trạng thái chia sẻ lên server
        dispatch(shareAchievement({
          achievement_id: achievement.id,
          share_platforms: selectedPlatforms,
          media_urls: [uri]
        }));

        // Log sự kiện chia sẻ thành công
        analyticsService.logShare('achievement', achievement.id, selectedPlatforms.join(','));
        
        Alert.alert(
          'Thành công', 
          'Đã chia sẻ thành tích của bạn',
          [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]
        );
      } else {
        analyticsService.logError('sharing_unavailable', 'Device does not support sharing');
        Alert.alert('Lỗi', 'Thiết bị của bạn không hỗ trợ chia sẻ');
      }
    } catch (error) {
      analyticsService.logError('share_achievement_error', error.message);
      Alert.alert('Lỗi', 'Không thể chia sẻ thành tích: ' + error.message);
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <ViewShot ref={viewShotRef} style={styles.cardContainer}>
      <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.achievementCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cardHeader}>
            <LogoX />
          </View>
          
          <Text style={styles.cardTitle}>Thành tích tập luyện</Text>
          
          <View style={styles.metricsContainer}>
            {achievement.metrics && achievement.metrics.distance && (
              <View style={styles.metricBox}>
                <Ionicons name="speedometer-outline" size={32} color="#FFFFFF" />
                <Text style={styles.metricValue}>{achievement.metrics.distance}</Text>
                <Text style={styles.metricLabel}>km</Text>
              </View>
            )}
            
            {achievement.metrics && achievement.metrics.calories && (
              <View style={styles.metricBox}>
                <Ionicons name="flame-outline" size={32} color="#FFFFFF" />
                <Text style={styles.metricValue}>{achievement.metrics.calories}</Text>
                <Text style={styles.metricLabel}>kcal</Text>
              </View>
            )}
            
            {achievement.metrics && achievement.metrics.time && (
              <View style={styles.metricBox}>
                <Ionicons name="time-outline" size={32} color="#FFFFFF" />
                <Text style={styles.metricValue}>{achievement.metrics.time}</Text>
                <Text style={styles.metricLabel}>phút</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.achievementDate}>
            {new Date(achievement.date_achieved).toLocaleDateString('vi-VN', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
          
          <View style={styles.cardFooter}>
            <Text style={styles.footerText}>Chia sẻ từ Fitness X</Text>
          </View>
        </LinearGradient>
      </ViewShot>
      
      <View style={styles.platformsContainer}>
        <Text style={styles.sectionTitle}>Chia sẻ đến</Text>
        
        <View style={styles.platformsGrid}>
          <TouchableOpacity 
            style={[
              styles.platformButton, 
              selectedPlatforms.includes('facebook') && styles.selectedPlatform
            ]}
            onPress={() => togglePlatform('facebook')}
          >
            <Ionicons 
              name="logo-facebook" 
              size={28} 
              color={selectedPlatforms.includes('facebook') ? '#ffffff' : '#3b5998'} 
            />
            <Text 
              style={[
                styles.platformText,
                selectedPlatforms.includes('facebook') && styles.selectedPlatformText
              ]}
            >
              Facebook
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.platformButton, 
              selectedPlatforms.includes('instagram') && styles.selectedPlatform
            ]}
            onPress={() => togglePlatform('instagram')}
          >
            <Ionicons 
              name="logo-instagram" 
              size={28} 
              color={selectedPlatforms.includes('instagram') ? '#ffffff' : '#c13584'} 
            />
            <Text 
              style={[
                styles.platformText,
                selectedPlatforms.includes('instagram') && styles.selectedPlatformText
              ]}
            >
              Instagram
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.platformButton, 
              selectedPlatforms.includes('twitter') && styles.selectedPlatform
            ]}
            onPress={() => togglePlatform('twitter')}
          >
            <Ionicons 
              name="logo-twitter" 
              size={28} 
              color={selectedPlatforms.includes('twitter') ? '#ffffff' : '#1da1f2'} 
            />
            <Text 
              style={[
                styles.platformText,
                selectedPlatforms.includes('twitter') && styles.selectedPlatformText
              ]}
            >
              Twitter
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.shareButton}
        onPress={handleShare}
        disabled={sharingStatus === 'loading'}
      >
        {sharingStatus === 'loading' ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <>
            <Ionicons name="share-social" size={20} color="#ffffff" />
            <Text style={styles.shareButtonText}>Chia sẻ ngay</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8F8',
  },
  cardContainer: {
    padding: 16,
  },
  achievementCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoX: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 48,
    height: 48,
    textAlign: 'center',
    lineHeight: 48,
    borderRadius: 12,
    overflow: 'hidden',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#FFFFFF',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  metricBox: {
    alignItems: 'center',
    padding: 12,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333',
    marginVertical: 8,
  },
  metricLabel: {
    fontSize: 14,
    color: '#8e9aaf',
  },
  achievementDate: {
    fontSize: 14,
    color: '#8e9aaf',
    textAlign: 'center',
    marginBottom: 24,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#8e9aaf',
    textAlign: 'center',
  },
  platformsContainer: {
    padding: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  platformsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  platformButton: {
    width: '30%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
    marginBottom: 12,
  },
  selectedPlatform: {
    backgroundColor: '#5e72e4',
  },
  platformText: {
    fontSize: 12,
    marginTop: 8,
    color: '#333',
  },
  selectedPlatformText: {
    color: '#ffffff',
  },
  shareButton: {
    backgroundColor: '#5e72e4',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 16,
    marginTop: 24,
  },
  shareButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default ShareAchievementScreen;