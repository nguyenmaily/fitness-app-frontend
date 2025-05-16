import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { sendMediaForFeedback } from '../../store/reducers/feedbackSlice';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';


const SendMediaScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { sendingStatus } = useSelector((state) => state.feedback);
  
  const [media, setMedia] = useState([]);
  const [note, setNote] = useState('');
  // Giả định user_id từ Auth state
  const userId = 'current_user_id';
  // Giả định trainer_id được chỉ định cho người dùng
  const trainerId = 'assigned_trainer_id';
  
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Cần quyền truy cập', 'Chúng tôi cần quyền truy cập vào thư viện ảnh của bạn để chọn ảnh/video.');
      }
    })();
  }, []);
  
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setMedia([...media, result.assets[0]]);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chọn ảnh/video: ' + error.message);
    }
  };
  
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Cần quyền truy cập', 'Chúng tôi cần quyền truy cập vào camera của bạn.');
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setMedia([...media, result.assets[0]]);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chụp ảnh/quay video: ' + error.message);
    }
  };
  
  const removeMedia = (index) => {
    const updatedMedia = [...media];
    updatedMedia.splice(index, 1);
    setMedia(updatedMedia);
  };
  
  const handleSendMedia = async () => {
    if (media.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn ít nhất một ảnh hoặc video');
      return;
    }
    
    try {
      // Chuẩn bị dữ liệu gửi lên
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('trainer_id', trainerId);
      formData.append('content', note);
      
      media.forEach((item, index) => {
        const fileType = item.uri.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg';
        formData.append('media_files', {
          uri: item.uri,
          name: `file_${index}.${fileType === 'video/mp4' ? 'mp4' : 'jpg'}`,
          type: fileType,
        });
      });
      
      await dispatch(sendMediaForFeedback(formData));
      
      Alert.alert(
        'Thành công', 
        'Đã gửi ảnh/video của bạn tới huấn luyện viên',
        [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể gửi ảnh/video: ' + error.message);
    }
  };

  // Thay thế ảnh preview bằng component
  const MediaPreview = ({ item, index }) => {
    const isVideo = item.uri.endsWith('.mp4');
    
    return (
      <View style={styles.mediaPreview}>
        <LinearGradient
          colors={isVideo ? [COLORS.tertiary, COLORS.quaternary] : [COLORS.primary, COLORS.secondary]}
          style={styles.mediaPreviewContent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons 
            name={isVideo ? 'videocam' : 'image'} 
            size={30} 
            color={COLORS.white} 
          />
        </LinearGradient>
        
        <TouchableOpacity 
          style={styles.removeMediaButton}
          onPress={() => removeMedia(index)}
        >
          <Ionicons name="close-circle" size={24} color="#ff3b30" />
        </TouchableOpacity>
        
        {isVideo && (
          <View style={styles.videoIndicator}>
            <Ionicons name="videocam" size={20} color={COLORS.white} />
          </View>
        )}
      </View>
    );
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chọn ảnh/video</Text>
        <Text style={styles.sectionDescription}>
          Gửi ảnh hoặc video tập luyện của bạn để nhận phản hồi từ huấn luyện viên
        </Text>
        
        <View style={styles.mediaOptions}>
          <TouchableOpacity style={styles.mediaOptionButton} onPress={pickImage}>
            <Ionicons name="images-outline" size={24} color={COLORS.primary} />
            <Text style={styles.mediaOptionText}>Chọn từ thư viện</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.mediaOptionButton} onPress={takePhoto}>
            <Ionicons name="camera-outline" size={24} color={COLORS.primary} />
            <Text style={styles.mediaOptionText}>Chụp ảnh/quay video</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {media.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Media đã chọn ({media.length})</Text>
          
          <ScrollView horizontal style={styles.mediaPreviewContainer}>
            {media.map((item, index) => (
              <MediaPreview key={index} item={item} index={index} />
            ))}
          </ScrollView>
        </View>
      )}
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thêm ghi chú</Text>
        
        <TextInput
          style={styles.noteInput}
          placeholder="Thêm ghi chú cho huấn luyện viên..."
          multiline
          value={note}
          onChangeText={setNote}
          placeholderTextColor={COLORS.darkGray}
        />
      </View>
      
      <TouchableOpacity 
        style={styles.sendButton}
        onPress={handleSendMedia}
        disabled={sendingStatus === 'loading'}
      >
        {sendingStatus === 'loading' ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <>
            <Ionicons name="send" size={20} color={COLORS.white} />
            <Text style={styles.sendButtonText}>Gửi cho huấn luyện viên</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.border,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginBottom: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 16,
  },
  mediaOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mediaOptionButton: {
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  mediaOptionText: {
    fontSize: 14,
    color: COLORS.primary,
    marginTop: 8,
    textAlign: 'center',
  },
  mediaPreviewContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  mediaPreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  mediaPreviewImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeMediaButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    zIndex: 10,
  },
  videoIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4,
  },
  noteInput: {
    backgroundColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 14,
    color: COLORS.black,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 166,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 16,
  },
  sendButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default SendMediaScreen;