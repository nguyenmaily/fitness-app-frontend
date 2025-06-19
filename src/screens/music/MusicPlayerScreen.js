import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, Dimensions } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentTrack, setPlaying } from '../../store/reducers/musicSlice';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import COLORS from '../../constants/colors';
import analyticsService from '../../services/analyticsService';

const { width } = Dimensions.get('window');

const MusicPlayerScreen = ({ route }) => {
  const dispatch = useDispatch();
  const { playlist } = route.params;
  const { currentTrack, playing } = useSelector((state) => state.music);
  
  const [sound, setSound] = useState(null);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(Date.now());
  
  // Log screen view và bắt đầu phiên nghe nhạc
  useEffect(() => {
    analyticsService.logScreenView('MusicPlayer', 'MusicPlayerScreen');
    analyticsService.logEvent('start_music_session', {
      playlist_id: playlist.id,
      playlist_name: playlist.name,
      workout_type: playlist.workout_type?.join(',') || 'unknown'
    });
    
    setSessionStartTime(Date.now());
    
    // Cleanup khi người dùng rời khỏi màn hình
    return () => {
      const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
      analyticsService.logEvent('end_music_session', {
        playlist_id: playlist.id,
        playlist_name: playlist.name,
        duration_seconds: sessionDuration
      });
      
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);
  
  // Chọn track đầu tiên khi vào màn hình
  useEffect(() => {
    if (playlist && playlist.tracks && playlist.tracks.length > 0 && !currentTrack) {
      dispatch(setCurrentTrack(playlist.tracks[0]));
    }
  }, [playlist]);
  
  // Xử lý sound khi currentTrack thay đổi
  useEffect(() => {
    if (currentTrack) {
      loadAudio();
    }
  }, [currentTrack]);
  
  // Xử lý trạng thái playing thay đổi
  useEffect(() => {
    if (sound) {
      if (playing) {
        sound.playAsync();
        
        // Log khi bắt đầu phát nhạc
        if (currentTrack) {
          analyticsService.logPlayMusic(
            currentTrack.id, 
            currentTrack.name, 
            playlist.id
          );
        }
      } else {
        sound.pauseAsync();
        
        // Log khi tạm dừng nhạc
        if (currentTrack) {
          analyticsService.logEvent('pause_music', {
            track_id: currentTrack.id,
            track_name: currentTrack.name,
            position_seconds: Math.floor(position / 1000)
          });
        }
      }
    }
  }, [playing, sound]);
  
  // Cập nhật vị trí phát mỗi 1 giây
  useEffect(() => {
    let interval;
    
    if (sound && playing) {
      interval = setInterval(async () => {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          setPosition(status.positionMillis);
          
          // Tự động chuyển bài khi kết thúc
          if (status.didJustFinish) {
            analyticsService.logEvent('track_finished', {
              track_id: currentTrack.id,
              track_name: currentTrack.name,
              auto_advance: true
            });
            handleNext();
          }
        }
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [sound, playing]);
  
  const loadAudio = async () => {
    if (sound) {
      await sound.unloadAsync();
    }
    
    try {
      setLoading(true);
      
      analyticsService.logEvent('loading_track', {
        track_id: currentTrack.id,
        track_name: currentTrack.name
      });
      
      const startTime = Date.now();
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: currentTrack.audio_url },
        { shouldPlay: playing },
        onPlaybackStatusUpdate
      );
      
      const loadTime = Date.now() - startTime;
      analyticsService.logEvent('track_loaded', {
        track_id: currentTrack.id,
        load_time_ms: loadTime
      });
      
      setSound(newSound);
      setLoading(false);
    } catch (error) {
      console.log('Error loading audio:', error);
      setLoading(false);
      
      analyticsService.logError('audio_load_error', error.message);
    }
  };
  
  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis);
    }
  };
  
  const handlePlayPause = () => {
    dispatch(setPlaying(!playing));
  };
  
  const handleNext = () => {
    if (playlist && playlist.tracks) {
      const currentIndex = playlist.tracks.findIndex(track => track.id === currentTrack.id);
      
      analyticsService.logEvent('skip_track', {
        direction: 'next',
        current_track_id: currentTrack.id,
        current_position_seconds: Math.floor(position / 1000)
      });
      
      if (currentIndex < playlist.tracks.length - 1) {
        dispatch(setCurrentTrack(playlist.tracks[currentIndex + 1]));
      } else {
        // Quay lại bài đầu tiên nếu đang ở bài cuối cùng
        dispatch(setCurrentTrack(playlist.tracks[0]));
      }
    }
  };
  
  const handlePrevious = () => {
    if (playlist && playlist.tracks) {
      const currentIndex = playlist.tracks.findIndex(track => track.id === currentTrack.id);
      
      analyticsService.logEvent('skip_track', {
        direction: 'previous',
        current_track_id: currentTrack.id,
        current_position_seconds: Math.floor(position / 1000)
      });
      
      if (currentIndex > 0) {
        dispatch(setCurrentTrack(playlist.tracks[currentIndex - 1]));
      } else {
        // Chuyển đến bài cuối cùng nếu đang ở bài đầu tiên
        dispatch(setCurrentTrack(playlist.tracks[playlist.tracks.length - 1]));
      }
    }
  };
  
  const handleSliderChange = async (value) => {
    if (sound) {
      await sound.setPositionAsync(value);
      setPosition(value);
      
      analyticsService.logEvent('seek_track', {
        track_id: currentTrack.id,
        seek_to_seconds: Math.floor(value / 1000)
      });
    }
  };
  
  const formatTime = (millis) => {
    if (!millis) return '0:00';
    
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  const handleOpenSpotify = () => {
    if (currentTrack && currentTrack.spotify_url) {
      analyticsService.logEvent('open_spotify', {
        track_id: currentTrack.id,
        track_name: currentTrack.name
      });
      
      Linking.openURL(currentTrack.spotify_url);
    }
  };

  // Component cho album art thay vì image
  const AlbumArt = ({ track, size = width * 0.7 }) => {
    // Sử dụng gradient cho album art dựa trên thể loại nhạc
    const getGradient = () => {
      if (!track) return [COLORS.primary, COLORS.secondary];
      
      // Xác định màu dựa trên thể loại nhạc hoặc tên bài hát
      if (track.name.toLowerCase().includes('energy') || track.artist?.toLowerCase().includes('rock')) {
        return ['#FF6B6B', '#FF9B9B']; // Đỏ - cao năng lượng
      } else if (track.name.toLowerCase().includes('calm') || track.artist?.toLowerCase().includes('ambient')) {
        return ['#4CD964', '#A0E9A0']; // Xanh lá - yên tĩnh
      } else if (track.name.toLowerCase().includes('focus') || track.artist?.toLowerCase().includes('classic')) {
        return [COLORS.tertiary, COLORS.quaternary]; // Tím hồng - tập trung
      }
      
      return [COLORS.primary, COLORS.secondary]; // Mặc định
    };
    
    return (
      <LinearGradient
        colors={getGradient()}
        style={[styles.albumArt, { width: size, height: size }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name="musical-notes" size={size * 0.3} color={COLORS.white} />
      </LinearGradient>
    );
  };
  
  if (!currentTrack) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.playerContainer}>
        <View style={styles.albumArtContainer}>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={styles.albumArt} />
          ) : (
            <AlbumArt track={currentTrack} />
          )}
        </View>
        
        <View style={styles.trackInfoContainer}>
          <Text style={styles.trackName}>{currentTrack.name}</Text>
          <Text style={styles.artistName}>{currentTrack.artist}</Text>
          
          {currentTrack.spotify_url && (
            <TouchableOpacity 
              style={styles.spotifyButton}
              onPress={handleOpenSpotify}
            >
              <Ionicons name="logo-spotify" size={16} color="#1DB954" />
              <Text style={styles.spotifyButtonText}>Mở trong Spotify</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.controlsContainer}>
          <View style={styles.progressContainer}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Slider
              style={styles.progressBar}
              minimumValue={0}
              maximumValue={duration}
              value={position}
              onSlidingComplete={handleSliderChange}
              minimumTrackTintColor={COLORS.primary}
              maximumTrackTintColor={COLORS.lightGray}
              thumbTintColor={COLORS.primary}
            />
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
          
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.controlButton} onPress={handlePrevious}>
              <Ionicons name="play-skip-back" size={28} color={COLORS.black} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.playPauseButton} onPress={handlePlayPause}>
              <Ionicons 
                name={playing ? "pause" : "play"} 
                size={32} 
                color={COLORS.white} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.controlButton} onPress={handleNext}>
              <Ionicons name="play-skip-forward" size={28} color={COLORS.black} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.playlistInfoContainer}>
          <Text style={styles.playlistTitle}>Playlist: {playlist.name}</Text>
          <Text style={styles.playlistMetaText}>
            {playlist.tracks ? playlist.tracks.findIndex(t => t.id === currentTrack.id) + 1 : 1}/
            {playlist.tracks ? playlist.tracks.length : 1}
          </Text>
        </View>
        
        <View style={styles.workoutTypeContainer}>
          {playlist.workout_type && playlist.workout_type.map((type, index) => (
            <View key={index} style={styles.workoutTypeBadge}>
              <Text style={styles.workoutTypeText}>{type}</Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
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
  playerContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  albumArtContainer: {
    width: width * 0.7,
    height: width * 0.7,
    marginTop: 32,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  albumArt: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  trackInfoContainer: {
    alignItems: 'center',
    marginTop: 24,
    width: '100%',
  },
  trackName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.black,
    textAlign: 'center',
  },
  artistName: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginTop: 4,
    textAlign: 'center',
  },
  spotifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.border}`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
  },
  spotifyButtonText: {
    fontSize: 12,
    color: '#1DB954',
    marginLeft: 4,
  },
  controlsContainer: {
    width: '100%',
    marginTop: 32,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    marginHorizontal: 8,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  controlButton: {
    padding: 16,
  },
  playPauseButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 24,
    elevation: 5,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  playlistInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 40,
  },
  playlistTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
  },
  playlistMetaText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  workoutTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 16,
  },
  workoutTypeBadge: {
    backgroundColor: `${COLORS.primary}20`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
  },
  workoutTypeText: {
    fontSize: 12,
    color: COLORS.primary,
  },
});

export default MusicPlayerScreen;