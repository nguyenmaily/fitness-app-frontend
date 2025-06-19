import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPlaylists, fetchPlaylistsByWorkoutType, setCurrentPlaylist } from '../../store/reducers/musicSlice';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import COLORS from '../../constants/colors';
import analyticsService from '../../services/analyticsService';

const PlaylistsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { playlists, loading } = useSelector((state) => state.music);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Log screen view
  useEffect(() => {
    analyticsService.logScreenView('Playlists', 'PlaylistsScreen');
  }, []);
  
  useEffect(() => {
    const startTime = Date.now();
    loadPlaylists().then(() => {
      performanceMonitor.trackDataFetch('playlists', startTime);
    });
  }, []);
  
  const loadPlaylists = async () => {
    await dispatch(fetchPlaylists());
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    analyticsService.logEvent('pull_to_refresh', {
      screen: 'Playlists'
    });
    
    const startTime = Date.now();
    await loadPlaylists();
    performanceMonitor.trackDataFetch('playlists_refresh', startTime);
    
    setRefreshing(false);
  };
  
  // Log khi người dùng chọn danh mục
  const handleCategorySelect = async (category) => {
    analyticsService.logEvent('select_music_category', {
      category: category
    });
    
    setSelectedCategory(category);
    
    const startTime = Date.now();
    if (category === 'all') {
      await dispatch(fetchPlaylists());
    } else {
      await dispatch(fetchPlaylistsByWorkoutType(category));
    }
    performanceMonitor.trackDataFetch(`playlists_by_category_${category}`, startTime);
  };
  
  // Log khi người dùng chọn playlist
  const handlePlaylistSelect = (playlist) => {
    analyticsService.logEvent('select_playlist', {
      playlist_id: playlist.id,
      playlist_name: playlist.name,
      track_count: playlist.tracks?.length || 0,
      workout_type: playlist.workout_type?.join(',') || 'unknown'
    });
    
    dispatch(setCurrentPlaylist(playlist));
    navigation.navigate('MusicPlayer', { playlist });
  };
  
  // Log khi người dùng tìm kiếm
  const handleSearch = (query) => {
    if (query !== searchQuery) {
      setSearchQuery(query);
      
      if (query.length > 2) {
        analyticsService.logEvent('search_music', {
          query: query
        });
      }
    }
  };
  
  const getFilteredPlaylists = () => {
    if (!searchQuery) return playlists;
    
    return playlists.filter(playlist => 
      playlist.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Thay thế ảnh album bằng component
  const PlaylistCover = ({ playlist, size = 80 }) => {
    // Màu gradient dựa trên loại workout
    const getWorkoutTypeColors = (types) => {
      if (!types || types.length === 0) return [COLORS.primary, COLORS.secondary];
      
      const type = types[0].toLowerCase();
      if (type.includes('cardio') || type.includes('running')) return [COLORS.primary, COLORS.secondary];
      if (type.includes('strength') || type.includes('weight')) return [COLORS.tertiary, COLORS.quaternary];
      if (type.includes('yoga') || type.includes('flex')) return ['#4CD964', '#A0E9A0'];
      if (type.includes('hiit') || type.includes('intense')) return ['#FF6B6B', '#FF9B9B'];
      
      return [COLORS.primary, COLORS.secondary];
    };

    // Chọn icon dựa trên loại workout
    const getWorkoutTypeIcon = (types) => {
      if (!types || types.length === 0) return 'musical-notes';
      
      const type = types[0].toLowerCase();
      if (type.includes('cardio') || type.includes('running')) return 'heart';
      if (type.includes('strength') || type.includes('weight')) return 'barbell';
      if (type.includes('yoga') || type.includes('flex')) return 'body';
      if (type.includes('hiit') || type.includes('intense')) return 'flash';
      
      return 'musical-notes';
    };
    
    return (
      <LinearGradient
        colors={getWorkoutTypeColors(playlist.workout_type)}
        style={[styles.playlistCover, { width: size, height: size }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons 
          name={getWorkoutTypeIcon(playlist.workout_type)} 
          size={size * 0.4} 
          color={COLORS.white} 
        />
      </LinearGradient>
    );
  };
  
  const renderPlaylistItem = ({ item }) => {
    const tracksCount = item.tracks ? item.tracks.length : 0;
    const durationMins = item.duration ? Math.floor(item.duration / 60) : 0;
    
    return (
      <TouchableOpacity 
        style={styles.playlistCard}
        onPress={() => handlePlaylistSelect(item)}
      >
        <PlaylistCover playlist={item} />
        
        <View style={styles.playlistInfo}>
          <Text style={styles.playlistName}>{item.name}</Text>
          
          <View style={styles.playlistMeta}>
            <Text style={styles.playlistMetaText}>
              {tracksCount} bài hát • {durationMins} phút
            </Text>
          </View>
          
          <View style={styles.tagsContainer}>
            {item.workout_type && item.workout_type.map((type, index) => (
              <View key={index} style={styles.tagBadge}>
                <Text style={styles.tagText}>{type}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.playButton}
          onPress={() => handlePlaylistSelect(item)}
        >
          <Ionicons name="play-circle" size={40} color={COLORS.primary} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={COLORS.darkGray} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm playlist..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.lightGray}
        />
      </View>
      
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity 
            style={[
              styles.categoryButton,
              selectedCategory === 'all' && styles.selectedCategory
            ]}
            onPress={() => handleCategorySelect('all')}
          >
            <Text 
              style={[
                styles.categoryButtonText,
                selectedCategory === 'all' && styles.selectedCategoryText
              ]}
            >
              Tất cả
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.categoryButton,
              selectedCategory === 'cardio' && styles.selectedCategory
            ]}
            onPress={() => handleCategorySelect('cardio')}
          >
            <Text 
              style={[
                styles.categoryButtonText,
                selectedCategory === 'cardio' && styles.selectedCategoryText
              ]}
            >
              Cardio
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.categoryButton,
              selectedCategory === 'strength' && styles.selectedCategory
            ]}
            onPress={() => handleCategorySelect('strength')}
          >
            <Text 
              style={[
                styles.categoryButtonText,
                selectedCategory === 'strength' && styles.selectedCategoryText
              ]}
            >
              Tập sức mạnh
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.categoryButton,
              selectedCategory === 'yoga' && styles.selectedCategory
            ]}
            onPress={() => handleCategorySelect('yoga')}
          >
            <Text 
              style={[
                styles.categoryButtonText,
                selectedCategory === 'yoga' && styles.selectedCategoryText
              ]}
            >
              Yoga
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.categoryButton,
              selectedCategory === 'running' && styles.selectedCategory
            ]}
            onPress={() => handleCategorySelect('running')}
          >
            <Text 
              style={[
                styles.categoryButtonText,
                selectedCategory === 'running' && styles.selectedCategoryText
              ]}
            >
              Chạy bộ
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={getFilteredPlaylists()}
          renderItem={renderPlaylistItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          onEndReached={() => {
            if (getFilteredPlaylists().length > 0) {
              analyticsService.logEvent('list_end_reached', {
                screen: 'Playlists',
                items_count: getFilteredPlaylists().length
              });
            }
          }}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="musical-notes-outline" size={64} color={COLORS.lightGray} />
              <Text style={styles.emptyText}>Không tìm thấy playlist</Text>
              <Text style={styles.emptySubText}>Thử tìm kiếm với từ khóa khác hoặc chọn loại bài tập khác</Text>
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
    backgroundColor:  COLORS.border,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.black,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    marginRight: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  selectedCategory: {
    backgroundColor: COLORS.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    color: COLORS.black,
  },
  selectedCategoryText: {
    color: COLORS.white,
  },
  listContainer: {
    padding: 16,
  },
  playlistCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  playlistCover: {
    width: 80,
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  playlistName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 4,
  },
  playlistMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  playlistMetaText: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagBadge: {
    backgroundColor: `${COLORS.primary}20`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 4,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 10,
    color: COLORS.primary,
  },
  playButton: {
    justifyContent: 'center',
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
    color: COLORS.darkGray,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default PlaylistsScreen;