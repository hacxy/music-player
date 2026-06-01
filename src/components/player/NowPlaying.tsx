import type { RefObject } from 'react';
import { usePlayerStore } from '../../stores/playerStore';
import { useLyrics } from '../../hooks/useLyrics';
import { CoverArt } from './CoverArt';
import { LyricsView } from './LyricsView';
import type { AudioPlayer } from '../../lib/audioPlayer';

interface NowPlayingProps {
  audioPlayerRef: RefObject<AudioPlayer | null>;
}

/**
 * NowPlaying - 当前播放视图（封面+歌词）
 *
 * 匹配设计原型：
 * - 渐变背景 linear-gradient(180deg, #1a1a2e 0%, #000000 100%)
 * - 封面 280x280，圆角 12px，阴影
 * - 歌词区域居中，最大宽度 500px
 */
export function NowPlaying({ audioPlayerRef }: NowPlayingProps) {
  const currentSong = usePlayerStore((state) => state.currentSong);

  // 连接歌词同步引擎
  useLyrics(currentSong?.lyrics ?? null, audioPlayerRef);

  if (!currentSong) {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #000000 100%)' }}
      >
        <div className="text-[#8E8E93] text-lg">选择一首歌曲开始播放</div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 flex flex-col items-center overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #000000 100%)' }}
    >
      {/* 封面 */}
      <div className="w-[280px] h-[280px] mt-10 mb-10 flex-shrink-0">
        <CoverArt
          src={currentSong.coverSrc}
          alt={currentSong.title}
          className="w-full h-full rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
        />
      </div>

      {/* 歌词区域 */}
      <div className="flex-1 w-full max-w-[500px] overflow-hidden">
        <LyricsView />
      </div>
    </div>
  );
}
