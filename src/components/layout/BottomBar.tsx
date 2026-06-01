import { usePlayerStore } from '../../stores/playerStore';
import { PlaybackControls } from '../player/PlaybackControls';
import { ProgressBar } from '../player/ProgressBar';
import { VolumeControl } from '../player/VolumeControl';

/**
 * BottomBar - 底部播放控制栏
 *
 * 匹配设计原型：
 * - 高度 80px
 * - 毛玻璃背景 rgba(28,28,30,0.8) + blur(40px)
 * - 顶部边框 rgba(255,255,255,0.08)
 * - 三段式布局：歌曲信息 | 播放控制+进度条 | 音量控制
 */
export function BottomBar() {
  const currentSong = usePlayerStore((state) => state.currentSong);

  return (
    <div className="h-20 glass-effect border-t border-white/[0.08] flex items-center px-5 gap-5 flex-shrink-0">
      {/* 左侧：当前播放信息 */}
      <div className="flex items-center gap-3 w-[250px] flex-shrink-0">
        {currentSong ? (
          <>
            <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#FA2D48] via-[#FF6B6B] to-[#4ECDC4]">
              <img
                src={currentSong.coverSrc}
                alt={currentSong.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-medium truncate">{currentSong.title}</div>
              <div className="text-[11px] text-[#8E8E93] truncate">{currentSong.artist}</div>
            </div>
          </>
        ) : (
          <div className="text-[13px] text-[#8E8E93]">未在播放</div>
        )}
      </div>

      {/* 中间：播放控制 */}
      <div className="flex-1 flex flex-col items-center gap-1.5 max-w-[500px]">
        <PlaybackControls />
        <ProgressBar />
      </div>

      {/* 右侧：音量控制 */}
      <div className="w-[150px] flex-shrink-0 flex justify-end">
        <VolumeControl />
      </div>
    </div>
  );
}
