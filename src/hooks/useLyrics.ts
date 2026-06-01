import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../stores/playerStore';
import { LyricsEngine } from '../lib/lyricsEngine';
import type { AudioPlayer } from '../lib/audioPlayer';
import type { LyricsData } from '../types';

/**
 * useLyrics - 歌词同步 Hook
 *
 * 职责：
 * 1. 创建和管理 LyricsEngine 实例
 * 2. 使用 requestAnimationFrame 高频更新歌词状态
 * 3. 直接从 AudioPlayer 读取 currentTime（比 store 更准确）
 * 4. 仅在播放时运行 RAF 循环，暂停时保留最后状态
 */
export function useLyrics(
  lyrics: LyricsData | null,
  audioPlayerRef: React.RefObject<AudioPlayer | null>
) {
  const engineRef = useRef<LyricsEngine | null>(null);
  const rafIdRef = useRef<number>(0);

  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const setLyricsState = usePlayerStore((state) => state.setLyricsState);

  // 当歌词数据变化时，重新创建引擎
  useEffect(() => {
    if (!lyrics) {
      engineRef.current = null;
      setLyricsState(null);
      return;
    }

    engineRef.current = new LyricsEngine(lyrics.lines);
    setLyricsState(null);
  }, [lyrics, setLyricsState]);

  // RAF 循环：仅在播放时运行，直接从 AudioPlayer 读取时间
  useEffect(() => {
    if (!engineRef.current || !isPlaying) {
      cancelAnimationFrame(rafIdRef.current);
      return;
    }

    const update = () => {
      const player = audioPlayerRef.current;
      if (!engineRef.current || !player) {
        rafIdRef.current = requestAnimationFrame(update);
        return;
      }

      const currentTime = player.getCurrentTime();
      const newState = engineRef.current.update(currentTime);
      setLyricsState(newState);

      rafIdRef.current = requestAnimationFrame(update);
    };

    rafIdRef.current = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(rafIdRef.current);
    };
  }, [isPlaying, audioPlayerRef, setLyricsState]);

  return engineRef;
}
