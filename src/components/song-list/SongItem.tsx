import type { Song } from '../../types';
import { formatTime } from '../../lib/utils';

interface SongItemProps {
  song: Song;
  isActive: boolean;
  onClick: () => void;
}

/**
 * SongItem - 单首歌曲项
 *
 * 匹配设计原型：
 * - 封面 44x44, 圆角 6px
 * - 标题 14px, 艺术家 12px #8E8E93
 * - 时长 12px #8E8E93
 * - 激活状态：rgba(250,45,72,0.15) 背景，标题变红色
 * - hover 状态：rgba(255,255,255,0.06) 背景
 */
export function SongItem({ song, isActive, onClick }: SongItemProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors cursor-pointer
        ${isActive
          ? 'bg-[rgba(250,45,72,0.15)]'
          : 'hover:bg-[rgba(255,255,255,0.06)]'
        }
      `}
    >
      {/* 封面 */}
      <div className="w-11 h-11 rounded-md flex-shrink-0 overflow-hidden bg-gradient-to-br from-[#667eea] to-[#764ba2]">
        <img
          src={song.coverSrc}
          alt={song.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>

      {/* 歌曲信息 */}
      <div className="flex-1 min-w-0">
        <div
          className={`text-sm font-medium truncate ${
            isActive ? 'text-[#FA2D48]' : 'text-white'
          }`}
        >
          {song.title}
        </div>
        <div className="text-xs text-[#8E8E93] truncate">{song.artist}</div>
      </div>

      {/* 时长 */}
      <div className="text-xs text-[#8E8E93] flex-shrink-0">
        {formatTime(song.duration)}
      </div>
    </button>
  );
}
