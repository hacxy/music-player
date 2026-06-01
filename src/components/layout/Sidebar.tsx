import { SongList } from '../song-list/SongList';

/**
 * Sidebar - 侧边栏（歌曲列表）
 *
 * 匹配设计原型：
 * - 宽度 300px
 * - 背景 #1C1C1E
 * - 右边框 rgba(255,255,255,0.08)
 * - 标题 "音乐库"，22px 粗体
 */
export function Sidebar() {
  return (
    <aside className="w-[300px] flex-shrink-0 bg-[#1C1C1E] border-r border-white/[0.08] flex flex-col">
      <div className="px-5 py-5 border-b border-white/[0.08]">
        <h2 className="text-[22px] font-bold">音乐库</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <SongList />
      </div>
    </aside>
  );
}
