import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../stores/playerStore';
import { AudioPlayer } from '../lib/audioPlayer';

/**
 * useAudioPlayer - 音频播放控制 Hook
 *
 * 职责：
 * 1. 创建和管理 AudioPlayer 实例
 * 2. 同步 AudioPlayer 状态到 Zustand Store
 * 3. 响应 Store 中的用户操作，调用 AudioPlayer 方法
 */
export function useAudioPlayer() {
  const playerRef = useRef<AudioPlayer | null>(null);

  // 订阅 Store actions
  const setCurrentTime = usePlayerStore((state) => state.setCurrentTime);
  const setDuration = usePlayerStore((state) => state.setDuration);
  const setIsPlaying = usePlayerStore((state) => state.setIsPlaying);
  const playNext = usePlayerStore((state) => state.playNext);

  // 创建 AudioPlayer 实例
  useEffect(() => {
    const player = new AudioPlayer({
      onTimeUpdate: (currentTime) => {
        setCurrentTime(currentTime);
      },
      onDurationChange: (duration) => {
        setDuration(duration);
      },
      onEnded: () => {
        playNext();
      },
      onPlay: () => {
        setIsPlaying(true);
      },
      onPause: () => {
        setIsPlaying(false);
      },
      onError: (error) => {
        console.error('Audio playback error:', error);
      },
    });

    playerRef.current = player;

    return () => {
      player.destroy();
      playerRef.current = null;
    };
  }, [setCurrentTime, setDuration, setIsPlaying, playNext]);

  // 订阅 actionId 变化，执行对应的 AudioPlayer 方法
  const actionId = usePlayerStore((state) => state.actionId);
  const actionPayload = usePlayerStore((state) => state.actionPayload);
  const currentSong = usePlayerStore((state) => state.currentSong);
  const isPlaying = usePlayerStore((state) => state.isPlaying);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || actionId === 0) return;

    // 处理 seek 操作
    if (actionPayload?.seekTime !== undefined) {
      player.seek(actionPayload.seekTime);
      return;
    }

    // 处理播放/暂停操作
    if (!currentSong) return;

    if (isPlaying) {
      player.play(currentSong.audioSrc);
    } else {
      player.pause();
    }
  }, [actionId, actionPayload, currentSong, isPlaying]);

  // 同步音量设置
  const volume = usePlayerStore((state) => state.volume);
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    player.setVolume(volume);
  }, [volume]);

  // 同步静音设置
  const isMuted = usePlayerStore((state) => state.isMuted);
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    if (isMuted) {
      player.mute();
    } else {
      player.unmute();
    }
  }, [isMuted]);

  return playerRef;
}
