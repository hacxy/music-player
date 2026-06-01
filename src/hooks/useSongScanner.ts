import { useEffect } from 'react';
import { usePlayerStore } from '../stores/playerStore';
import { scanAll } from '../lib/songScanner';

/**
 * useSongScanner - 歌曲扫描 Hook
 *
 * 职责：
 * 1. 应用启动时加载歌曲列表
 * 2. 处理加载状态和错误
 */
export function useSongScanner() {
  const songs = usePlayerStore((state) => state.songs);
  const isLoading = usePlayerStore((state) => state.isLoading);
  const error = usePlayerStore((state) => state.error);

  useEffect(() => {
    const loadSongs = async () => {
      usePlayerStore.setState({ isLoading: true, error: null });
      try {
        const loadedSongs = await scanAll();
        usePlayerStore.setState({ songs: loadedSongs, isLoading: false });
      } catch (err) {
        usePlayerStore.setState({
          error: (err as Error).message,
          isLoading: false,
        });
      }
    };

    loadSongs();
  }, []);

  return { songs, isLoading, error };
}
