import api from './api';

export const searchSpotifyTracks = async (query) => {
  try {
    const response = await api.get(`/music/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching Spotify tracks:', error);
    throw error;
  }
};

export const createPlaylistFromSpotify = async (playlistData) => {
  try {
    const response = await api.post('/music/playlists', playlistData);
    return response.data;
  } catch (error) {
    console.error('Error creating playlist from Spotify:', error);
    throw error;
  }
};