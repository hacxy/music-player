import { usePlayerStore } from '../../stores/playerStore';
import { formatTime } from '../../lib/utils';

/**
 * ProgressBar - 进度条
 *
 * 匹配设计原型：
 * - 时间标签 11px, #8E8E93
 * - 进度条 4px 高, 白色填充
 * - hover 时显示圆形拖拽手柄
 */
export function ProgressBar() {
  const currentTime = usePlayerStore((state) => state.currentTime);
  const duration = usePlayerStore((state) => state.duration);
  const seekTo = usePlayerStore((state) => state.seekTo);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-2 w-full">
      <span className="text-[11px] text-[#8E8E93] w-10 text-center">
        {formatTime(currentTime)}
      </span>
      <input
        type="range"
        min="0"
        max={duration || 0}
        step="0.1"
        value={currentTime}
        onChange={(e) => seekTo(parseFloat(e.target.value))}
        className="progress-slider flex-1"
        style={
          {
            '--slider-progress': `${progress}%`,
          } as React.CSSProperties
        }
        aria-label="播放进度"
      />
      <span className="text-[11px] text-[#8E8E93] w-10 text-center">
        {formatTime(duration)}
      </span>
    </div>
  );
}
