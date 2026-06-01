import { create } from 'zustand';
import type { Song, LyricsState } from '../types';
import { scanAll } from '../lib/songScanner';

interface PlayerState {
  // 歌曲列表
  songs: Song[];
  isLoading: boolean;
  error: string | null;

  // 当前播放状态
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;

  // 歌词状态
  lyricsState: LyricsState | null;

  // 动作追踪 - 用于 hooks 响应用户操作
  actionId: number;
  actionPayload: { seekTime?: number } | null;
}

interface PlayerActions {
  // 歌曲列表
  loadSongs: () => Promise<void>;

  // 播放控制
  playSong: (song: Song) => void;
  playNext: () => void;
  playPrevious: () => void;
  togglePlay: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;

  // 内部状态更新（由 hooks 调用）
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setLyricsState: (state: LyricsState | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
}

export const usePlayerStore = create<PlayerState & PlayerActions>((set, get) => ({
  // 初始状态
  songs: [],
  isLoading: false,
  error: null,
  currentSong: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isMuted: false,
  lyricsState: null,
  actionId: 0,
  actionPayload: null,

  // 加载歌曲列表
  loadSongs: async () => {
    set({ isLoading: true, error: null });
    try {
      const songs = await scanAll();
      set({ songs, isLoading: false });
    } catch (error) {
      set({
        error: (error as Error).message,
        isLoading: false,
      });
    }
  },

  // 播放指定歌曲
  playSong: (song: Song) => {
    set((state) => ({
      currentSong: song,
      currentTime: 0,
      isPlaying: true,
      actionId: state.actionId + 1,
      actionPayload: null,
    }));
  },

  // 播放下一首
  playNext: () => {
    const { songs, currentSong } = get();
    if (!currentSong || songs.length === 0) return;

    const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    get().playSong(songs[nextIndex]);
  },

  // 播放上一首
  playPrevious: () => {
    const { songs, currentSong, currentTime } = get();
    if (!currentSong || songs.length === 0) return;

    // 如果播放超过 3 秒，重新开始当前歌曲
    if (currentTime > 3) {
      get().seekTo(0);
      return;
    }

    const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    get().playSong(songs[prevIndex]);
  },

  // 切换播放/暂停
  togglePlay: () => {
    set((state) => ({
      isPlaying: !state.isPlaying,
      actionId: state.actionId + 1,
      actionPayload: null,
    }));
  },

  // 跳转到指定时间
  seekTo: (time: number) => {
    set((state) => ({
      currentTime: time,
      actionId: state.actionId + 1,
      actionPayload: { seekTime: time },
    }));
  },

  // 设置音量
  setVolume: (volume: number) => {
    set({ volume, isMuted: false });
  },

  // 切换静音
  toggleMute: () => {
    set((state) => ({ isMuted: !state.isMuted }));
  },

  // 内部状态更新
  setCurrentTime: (time: number) => set({ currentTime: time }),
  setDuration: (duration: number) => set({ duration }),
  setLyricsState: (state: LyricsState | null) => set({ lyricsState: state }),
  setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),
}));
