import { AppLayout } from './components/layout/AppLayout';
import { Sidebar } from './components/layout/Sidebar';
import { BottomBar } from './components/layout/BottomBar';
import { NowPlaying } from './components/player/NowPlaying';
import { useSongScanner } from './hooks/useSongScanner';
import { useAudioPlayer } from './hooks/useAudioPlayer';

function App() {
  // 初始化歌曲扫描
  const { isLoading, error } = useSongScanner();

  // 初始化音频播放器（全局单例，不随组件卸载销毁）
  const audioPlayerRef = useAudioPlayer();

  return (
    <AppLayout>
      {/* 主内容区：侧边栏 + 播放视图 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 侧边栏 */}
        <Sidebar />

        {/* 主内容区 */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {isLoading ? (
            <div
              className="flex-1 flex items-center justify-center"
              style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #000000 100%)' }}
            >
              <div className="text-[#8E8E93] text-lg">加载中...</div>
            </div>
          ) : error ? (
            <div
              className="flex-1 flex items-center justify-center"
              style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #000000 100%)' }}
            >
              <div className="text-red-500 text-lg">{error}</div>
            </div>
          ) : (
            <NowPlaying audioPlayerRef={audioPlayerRef} />
          )}
        </main>
      </div>

      {/* 底部播放控制栏 */}
      <BottomBar />
    </AppLayout>
  );
}

export default App;
