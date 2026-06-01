import { usePlayerStore } from '../../stores/playerStore';

/**
 * PlaybackControls - 播放/暂停/上下首按钮
 *
 * 匹配设计原型：
 * - 上下一首：20px 白色图标
 * - 播放/暂停：36x36 白色圆形按钮
 */
export function PlaybackControls() {
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const currentSong = usePlayerStore((state) => state.currentSong);
  const togglePlay = usePlayerStore((state) => state.togglePlay);
  const playNext = usePlayerStore((state) => state.playNext);
  const playPrevious = usePlayerStore((state) => state.playPrevious);

  return (
    <div className="flex items-center gap-6">
      {/* 上一首 */}
      <button
        onClick={playPrevious}
        disabled={!currentSong}
        className="text-white hover:text-white/80 transition-colors disabled:opacity-30"
        aria-label="上一首"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
        </svg>
      </button>

      {/* 播放/暂停 */}
      <button
        onClick={togglePlay}
        disabled={!currentSong}
        className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-30"
        aria-label={isPlaying ? '暂停' : '播放'}
      >
        {isPlaying ? (
          <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* 下一首 */}
      <button
        onClick={playNext}
        disabled={!currentSong}
        className="text-white hover:text-white/80 transition-colors disabled:opacity-30"
        aria-label="下一首"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
        </svg>
      </button>
    </div>
  );
}
