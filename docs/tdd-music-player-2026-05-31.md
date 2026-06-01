# TDD: Apple Music 风格音乐播放器

**Status**: Proposed
**Author**: Tech Architect Agent
**Last Updated**: 2026-05-31
**Version**: 1.0
**PRD Reference**: prd-music-player-2026-05-31.md

---

## 1. 技术架构概述

### 1.1 整体架构

本项目是纯前端应用，无后端依赖。采用组件化架构，通过 Zustand 管理全局状态，使用 HTMLAudioElement 进行音频播放。

```
┌─────────────────────────────────────────────────────────────────┐
│                         React App                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Components  │  │   Hooks     │  │   Pages     │             │
│  └──────┬───────┘  └──────┬──────┘  └──────┬──────┘             │
│         │                 │                 │                    │
│         └─────────────────┼─────────────────┘                    │
│                           │                                      │
│                    ┌──────▼──────┐                               │
│                    │   Zustand   │                               │
│                    │   Store     │                               │
│                    └──────┬──────┘                               │
│                           │                                      │
│         ┌─────────────────┼─────────────────┐                    │
│         │                 │                 │                    │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐             │
│  │ SongScanner │  │ AudioPlayer │  │ LyricsEngine│             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                           │                                      │
│                    ┌──────▼──────┐                               │
│                    │ HTMLAudio   │                               │
│                    │  Element    │                               │
│                    └─────────────┘                               │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    public/songs/                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │ song-001 │  │ song-002 │  │ song-003 │  ...                 │
│  └──────────┘  └──────────┘  └──────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 核心模块职责

| 模块 | 职责 | 依赖 |
|------|------|------|
| SongScanner | 扫描 public/songs/ 目录，解析歌词文件，转换数据格式 | fetch API |
| AudioPlayer | 封装 HTMLAudioElement，提供播放控制接口 | HTMLAudioElement |
| LyricsEngine | 解析歌词时间戳，计算当前高亮状态 | requestAnimationFrame |
| PlayerStore | 管理播放器全局状态 | Zustand |

### 1.3 静态资源加载方案

采用 **运行时 fetch 扫描** 方案：

1. **目录清单**：在 `public/songs/` 下维护一个 `manifest.json` 文件，列出所有歌曲目录
2. **按需加载**：应用启动时 fetch manifest.json，获取歌曲列表
3. **歌词解析**：点击播放时 fetch 对应的 `lyrics.json` 文件

**备选方案对比**：

| 方案 | 优点 | 缺点 |
|------|------|------|
| Vite import.meta.glob | 构建时静态分析，类型安全 | 需要重新构建才能识别新歌曲 |
| fetch + manifest.json | 运行时动态加载，无需重新构建 | 需要手动维护 manifest.json |
| fetch + 目录扫描 | 完全自动，无需维护 | 浏览器安全限制，无法直接列出目录 |

**决策**：选择 fetch + manifest.json 方案，在自动化和灵活性之间取得平衡。

---

## 2. 目录结构设计

### 2.1 项目目录结构

```
music-player/
├── public/
│   └── songs/                          # 静态音乐资源
│       ├── manifest.json               # 歌曲目录清单
│       ├── song-001/
│       │   ├── audio.mp3
│       │   ├── cover.jpg
│       │   └── lyrics.json
│       └── song-002/
│           ├── audio.mp3
│           ├── cover.png
│           └── lyrics.json
│
├── src/
│   ├── components/                     # React 组件
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx           # 主布局容器
│   │   │   ├── Sidebar.tsx             # 侧边栏（歌曲列表）
│   │   │   └── BottomBar.tsx           # 底部播放控制栏
│   │   │
│   │   ├── player/
│   │   │   ├── NowPlaying.tsx          # 当前播放视图（封面+歌词）
│   │   │   ├── CoverArt.tsx            # 封面图片组件
│   │   │   ├── LyricsView.tsx          # 歌词滚动视图
│   │   │   ├── LyricsLine.tsx          # 单行歌词组件
│   │   │   ├── ProgressBar.tsx         # 进度条
│   │   │   ├── VolumeControl.tsx       # 音量控制
│   │   │   └── PlaybackControls.tsx    # 播放/暂停/上下首
│   │   │
│   │   └── song-list/
│   │       ├── SongList.tsx            # 歌曲列表容器
│   │       ├── SongItem.tsx            # 单首歌曲项
│   │       └── EmptyState.tsx          # 空状态引导
│   │
│   ├── hooks/                          # 自定义 Hooks
│   │   ├── useAudioPlayer.ts           # 音频播放控制
│   │   ├── useLyrics.ts                # 歌词同步逻辑
│   │   └── useSongScanner.ts           # 歌曲扫描
│   │
│   ├── stores/                         # Zustand Store
│   │   └── playerStore.ts              # 播放器状态管理
│   │
│   ├── lib/                            # 核心库
│   │   ├── songScanner.ts              # 歌曲扫描器
│   │   ├── audioPlayer.ts              # 音频播放器封装
│   │   ├── lyricsEngine.ts             # 歌词解析引擎
│   │   └── utils.ts                    # 工具函数
│   │
│   ├── types/                          # TypeScript 类型定义
│   │   └── index.ts
│   │
│   ├── styles/                         # 全局样式
│   │   └── globals.css
│   │
│   ├── App.tsx                         # 根组件
│   └── main.tsx                        # 入口文件
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

### 2.2 静态资源目录结构

```
public/songs/
├── manifest.json                       # 歌曲目录清单
│
├── love-story/
│   ├── audio.mp3                       # 音频文件
│   ├── cover.jpg                       # 封面图片
│   └── lyrics.json                     # 歌词文件
│
├── bohemian-rhapsody/
│   ├── audio.mp3
│   ├── cover.png
│   └── lyrics.json
│
└── yesterday/
    ├── audio.wav
    ├── cover.webp
    └── lyrics.json
```

**manifest.json 格式**：

```json
{
  "songs": [
    { "directory": "love-story" },
    { "directory": "bohemian-rhapsody" },
    { "directory": "yesterday" }
  ]
}
```

---

## 3. 核心模块设计

### 3.1 SongScanner

**职责**：扫描静态资源目录，解析歌词文件，将原始格式转换为应用内部格式。

**关键逻辑**：

1. **读取 manifest.json**：获取所有歌曲目录列表
2. **并行加载歌曲元数据**：为每个目录 fetch lyrics.json
3. **格式转换**：将扁平的 token_timestamps 数组转换为按行分组格式
4. **构建 Song 对象**：组装完整的歌曲数据结构

**扁平数组转按行分组的核心逻辑**：

```typescript
// 原始格式（用户提供的 timestamps.json）
interface RawLyricsData {
  audio_file: string;
  duration_seconds: number;
  metadata: { title?: string; artist?: string; album?: string };
  lrc_text: string;
  token_timestamps: Array<{
    line_index: number;
    tokens: Array<{ text: string; start: number; end: number }>;
  }>;
}

// 应用内部格式
interface LyricsData {
  lines: LyricsLine[];
  rawLrc: string;
}

function convertToInternalFormat(raw: RawLyricsData): LyricsData {
  // 按 line_index 分组，保持顺序
  const lines: LyricsLine[] = raw.token_timestamps.map((lineData, index) => {
    const tokens = lineData.tokens;
    return {
      index: lineData.line_index,
      startTime: tokens[0]?.start ?? 0,
      endTime: tokens[tokens.length - 1]?.end ?? 0,
      text: tokens.map(t => t.text).join(''),
      tokens: tokens
    };
  });

  // 按 startTime 排序
  lines.sort((a, b) => a.startTime - b.startTime);

  // 重新索引
  lines.forEach((line, i) => line.index = i);

  return {
    lines,
    rawLrc: raw.lrc_text
  };
}
```

**文件路径解析**：

```typescript
function buildSongFromLyrics(
  directory: string,
  rawLyrics: RawLyricsData
): Song {
  const basePath = `/songs/${directory}`;
  return {
    id: directory,
    directoryName: directory,
    title: rawLyrics.metadata?.title ?? formatDirectoryName(directory),
    artist: rawLyrics.metadata?.artist ?? 'Unknown Artist',
    album: rawLyrics.metadata?.album ?? 'Unknown Album',
    duration: rawLyrics.duration_seconds,
    audioSrc: `${basePath}/${rawLyrics.audio_file}`,
    coverSrc: findCoverFile(basePath, directory), // 需要约定封面文件名
    lyrics: convertToInternalFormat(rawLyrics)
  };
}
```

### 3.2 AudioPlayer

**职责**：封装 HTMLAudioElement，提供简洁的播放控制接口。

**设计要点**：

1. **单例模式**：全局只有一个 AudioPlayer 实例
2. **事件驱动**：通过回调函数通知状态变化
3. **状态同步**：内部维护播放状态，与 Zustand Store 同步

**接口定义**：

```typescript
interface AudioPlayerOptions {
  onTimeUpdate: (currentTime: number) => void;
  onEnded: () => void;
  onPlay: () => void;
  onPause: () => void;
  onError: (error: Error) => void;
}

class AudioPlayer {
  private audio: HTMLAudioElement;
  private options: AudioPlayerOptions;

  constructor(options: AudioPlayerOptions);

  // 播放控制
  play(src?: string): Promise<void>;
  pause(): void;
  stop(): void;

  // 进度控制
  seek(time: number): void;
  setVolume(volume: number): void;
  mute(): void;
  unmute(): void;

  // 状态获取
  getCurrentTime(): number;
  getDuration(): number;
  getVolume(): number;
  isPlaying(): boolean;
  isMuted(): boolean;

  // 生命周期
  destroy(): void;
}
```

**关键实现细节**：

```typescript
class AudioPlayer {
  private audio: HTMLAudioElement;
  private lastVolume: number = 1;

  constructor(options: AudioPlayerOptions) {
    this.audio = new Audio();
    this.options = options;

    // 绑定事件
    this.audio.addEventListener('timeupdate', () => {
      this.options.onTimeUpdate(this.audio.currentTime);
    });

    this.audio.addEventListener('ended', () => {
      this.options.onEnded();
    });

    this.audio.addEventListener('play', () => {
      this.options.onPlay();
    });

    this.audio.addEventListener('pause', () => {
      this.options.onPause();
    });

    this.audio.addEventListener('error', (e) => {
      const error = this.audio.error;
      this.options.onError(
        new Error(`Audio error: ${error?.message ?? 'Unknown error'}`)
      );
    });
  }

  async play(src?: string): Promise<void> {
    if (src && this.audio.src !== src) {
      this.audio.src = src;
    }
    try {
      await this.audio.play();
    } catch (error) {
      this.options.onError(error as Error);
    }
  }

  setVolume(volume: number): void {
    this.audio.volume = Math.max(0, Math.min(1, volume));
    this.lastVolume = this.audio.volume;
  }

  mute(): void {
    this.lastVolume = this.audio.volume;
    this.audio.muted = true;
  }

  unmute(): void {
    this.audio.muted = false;
    this.audio.volume = this.lastVolume;
  }
}
```

### 3.3 LyricsEngine

**职责**：解析歌词时间戳，根据当前播放时间计算高亮状态。

**核心算法**：

```typescript
interface LyricsState {
  currentLineIndex: number;      // 当前播放行索引
  currentTokenIndex: number;     // 当前播放字索引
  lineProgress: number;          // 当前行进度 (0-1)
  tokenProgress: number;         // 当前字进度 (0-1)
}

class LyricsEngine {
  private lines: LyricsLine[];
  private state: LyricsState;

  constructor(lines: LyricsLine[]) {
    this.lines = lines;
    this.state = {
      currentLineIndex: -1,
      currentTokenIndex: -1,
      lineProgress: 0,
      tokenProgress: 0
    };
  }

  /**
   * 根据当前时间更新歌词状态
   * 使用二分查找定位当前行，然后线性扫描定位当前字
   */
  update(currentTime: number): LyricsState {
    // 1. 二分查找当前行
    const lineIndex = this.findLineIndex(currentTime);

    if (lineIndex !== this.state.currentLineIndex) {
      this.state.currentLineIndex = lineIndex;
      this.state.currentTokenIndex = -1;
    }

    // 2. 计算当前行进度
    if (lineIndex >= 0 && lineIndex < this.lines.length) {
      const line = this.lines[lineIndex];
      this.state.lineProgress = this.calculateProgress(
        currentTime,
        line.startTime,
        line.endTime
      );

      // 3. 线性扫描当前字
      this.state.currentTokenIndex = this.findTokenIndex(
        line.tokens,
        currentTime
      );

      // 4. 计算当前字进度
      if (this.state.currentTokenIndex >= 0) {
        const token = line.tokens[this.state.currentTokenIndex];
        this.state.tokenProgress = this.calculateProgress(
          currentTime,
          token.start,
          token.end
        );
      }
    } else {
      this.state.lineProgress = 0;
      this.state.tokenProgress = 0;
    }

    return { ...this.state };
  }

  private findLineIndex(currentTime: number): number {
    // 二分查找最后一个 startTime <= currentTime 的行
    let left = 0;
    let right = this.lines.length - 1;
    let result = -1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (this.lines[mid].startTime <= currentTime) {
        result = mid;
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    return result;
  }

  private findTokenIndex(
    tokens: LyricsToken[],
    currentTime: number
  ): number {
    // 线性扫描（token 数量通常较少，< 100）
    for (let i = tokens.length - 1; i >= 0; i--) {
      if (tokens[i].start <= currentTime) {
        return i;
      }
    }
    return -1;
  }

  private calculateProgress(
    current: number,
    start: number,
    end: number
  ): number {
    if (current <= start) return 0;
    if (current >= end) return 1;
    return (current - start) / (end - start);
  }

  /**
   * 跳转到指定时间，重置状态
   */
  seekTo(time: number): void {
    this.state.currentLineIndex = -1;
    this.state.currentTokenIndex = -1;
    this.update(time);
  }
}
```

### 3.4 PlayerStore

**职责**：管理播放器全局状态，协调各模块交互。

**状态结构**：

```typescript
interface PlayerState {
  // 歌曲列表
  songs: Song[];
  isLoading: boolean;
  error: string | null;

  // 当前播放状态
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;

  // 歌词状态
  lyricsState: LyricsState | null;
}

interface PlayerActions {
  // 歌曲列表
  loadSongs: () => Promise<void>;

  // 播放控制
  playSong: (song: Song) => void;
  playNext: () => void;
  playPrevious: () => void;
  togglePlay: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;

  // 内部状态更新（由 hooks 调用）
  setCurrentTime: (time: number) => void;
  setLyricsState: (state: LyricsState) => void;
  setIsPlaying: (isPlaying: boolean) => void;
}
```

**Store 实现**：

```typescript
import { create } from 'zustand';

const usePlayerStore = create<PlayerState & PlayerActions>((set, get) => ({
  // 初始状态
  songs: [],
  isLoading: false,
  error: null,
  currentSong: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isMuted: false,
  lyricsState: null,

  // 加载歌曲列表
  loadSongs: async () => {
    set({ isLoading: true, error: null });
    try {
      const songs = await songScanner.scanAll();
      set({ songs, isLoading: false });
    } catch (error) {
      set({
        error: (error as Error).message,
        isLoading: false
      });
    }
  },

  // 播放指定歌曲
  playSong: (song: Song) => {
    set({ currentSong: song, currentTime: 0 });
    // audioPlayer.play(song.audioSrc) 由 useAudioPlayer hook 处理
  },

  // 播放下一首
  playNext: () => {
    const { songs, currentSong } = get();
    if (!currentSong) return;

    const currentIndex = songs.findIndex(s => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    get().playSong(songs[nextIndex]);
  },

  // 播放上一首
  playPrevious: () => {
    const { songs, currentSong, currentTime } = get();
    if (!currentSong) return;

    // 如果播放超过 3 秒，重新开始当前歌曲
    if (currentTime > 3) {
      get().seekTo(0);
      return;
    }

    const currentIndex = songs.findIndex(s => s.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    get().playSong(songs[prevIndex]);
  },

  // 切换播放/暂停
  togglePlay: () => {
    const { isPlaying } = get();
    if (isPlaying) {
      // audioPlayer.pause() 由 useAudioPlayer hook 处理
    } else {
      // audioPlayer.play() 由 useAudioPlayer hook 处理
    }
  },

  // 跳转到指定时间
  seekTo: (time: number) => {
    set({ currentTime: time });
    // audioPlayer.seek(time) 由 useAudioPlayer hook 处理
  },

  // 设置音量
  setVolume: (volume: number) => {
    set({ volume, isMuted: false });
    // audioPlayer.setVolume(volume) 由 useAudioPlayer hook 处理
  },

  // 切换静音
  toggleMute: () => {
    const { isMuted } = get();
    set({ isMuted: !isMuted });
    // audioPlayer.mute/unmute() 由 useAudioPlayer hook 处理
  },

  // 内部状态更新
  setCurrentTime: (time: number) => set({ currentTime: time }),
  setLyricsState: (state: LyricsState) => set({ lyricsState: state }),
  setIsPlaying: (isPlaying: boolean) => set({ isPlaying })
}));
```

---

## 4. 歌词同步方案

### 4.1 timestamps.json 格式处理

**问题**：用户提供的 timestamps.json 是扁平的 token_timestamps 数组，PRD 中设计的是按行分组格式。

**原始格式（扁平数组）**：

```json
{
  "token_timestamps": [
    { "text": "第", "start": 5.20, "end": 5.35 },
    { "text": "一", "start": 5.35, "end": 5.50 },
    { "text": "句", "start": 5.50, "end": 5.65 },
    { "text": "歌", "start": 5.65, "end": 5.80 },
    { "text": "词", "start": 5.80, "end": 5.95 },
    { "text": "第", "start": 10.40, "end": 10.55 },
    { "text": "二", "start": 10.55, "end": 10.70 },
    { "text": "句", "start": 10.70, "end": 10.85 },
    { "text": "歌", "start": 10.85, "end": 11.00 },
    { "text": "词", "start": 11.00, "end": 11.15 }
  ]
}
```

**PRD 定义格式（按行分组）**：

```json
{
  "token_timestamps": [
    {
      "line_index": 0,
      "tokens": [
        { "text": "第", "start": 5.20, "end": 5.35 },
        { "text": "一", "start": 5.35, "end": 5.50 }
      ]
    },
    {
      "line_index": 1,
      "tokens": [
        { "text": "第", "start": 10.40, "end": 10.55 },
        { "text": "二", "start": 10.55, "end": 10.70 }
      ]
    }
  ]
}
```

**转换策略**：

在 SongScanner 中实现格式检测和转换逻辑，同时支持两种格式：

```typescript
function normalizeTokenTimestamps(
  raw: RawTokenTimestamps
): GroupedTokenTimestamps {
  // 检测是否已经是分组格式
  if (Array.isArray(raw) && raw.length > 0 && 'line_index' in raw[0]) {
    return raw as GroupedTokenTimestamps;
  }

  // 扁平数组格式：根据 lrc_text 的时间戳进行分组
  // 需要结合 lrc_text 中的时间点来判断行边界
  return groupFlatTokensByLrc(raw as FlatToken[], lrcText);
}

function groupFlatTokensByLrc(
  tokens: FlatToken[],
  lrcText: string
): GroupedTokenTimestamps {
  // 1. 解析 lrc_text 获取每行的开始时间
  const lineStartTimes = parseLrcTimestamps(lrcText);

  // 2. 根据 token 的 start 时间分配到对应的行
  const groups: Map<number, FlatToken[]> = new Map();

  for (const token of tokens) {
    // 找到 token 属于哪一行
    let lineIndex = 0;
    for (let i = lineStartTimes.length - 1; i >= 0; i--) {
      if (token.start >= lineStartTimes[i]) {
        lineIndex = i;
        break;
      }
    }

    if (!groups.has(lineIndex)) {
      groups.set(lineIndex, []);
    }
    groups.get(lineIndex)!.push(token);
  }

  // 3. 转换为目标格式
  return Array.from(groups.entries()).map(([lineIndex, tokens]) => ({
    line_index: lineIndex,
    tokens: tokens
  }));
}

function parseLrcTimestamps(lrcText: string): number[] {
  // 解析 [mm:ss.xx] 格式的时间戳
  const regex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;
  const timestamps: number[] = [];

  let match;
  while ((match = regex.exec(lrcText)) !== null) {
    const minutes = parseInt(match[1]);
    const seconds = parseInt(match[2]);
    const milliseconds = parseInt(match[3].padEnd(3, '0'));
    timestamps.push(minutes * 60 + seconds + milliseconds / 1000);
  }

  return timestamps.sort((a, b) => a - b);
}
```

### 4.2 requestAnimationFrame 高频检测方案

**为什么使用 requestAnimationFrame**：

| 方案 | 优点 | 缺点 |
|------|------|------|
| setInterval | 简单，可控间隔 | 不准确，受主线程阻塞影响 |
| setTimeout | 简单 | 同 setInterval |
| requestAnimationFrame | 与浏览器刷新率同步，60fps | 只在页面可见时运行 |

**实现方式**：

```typescript
function useLyrics(
  audioPlayer: AudioPlayer,
  lyrics: LyricsData | null
) {
  const [state, setState] = useState<LyricsState | null>(null);
  const engineRef = useRef<LyricsEngine | null>(null);
  const rafIdRef = useRef<number>(0);

  useEffect(() => {
    if (!lyrics) {
      engineRef.current = null;
      setState(null);
      return;
    }

    engineRef.current = new LyricsEngine(lyrics.lines);

    const update = () => {
      if (!engineRef.current) return;

      const currentTime = audioPlayer.getCurrentTime();
      const newState = engineRef.current.update(currentTime);
      setState(newState);

      rafIdRef.current = requestAnimationFrame(update);
    };

    rafIdRef.current = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(rafIdRef.current);
    };
  }, [lyrics, audioPlayer]);

  return state;
}
```

**性能优化**：

1. **节流更新**：每 16ms（一帧）最多更新一次状态
2. **批量更新**：使用 React 的批量更新机制，避免多次渲染
3. **条件更新**：只在状态实际变化时更新组件

```typescript
const update = () => {
  if (!engineRef.current) return;

  const currentTime = audioPlayer.getCurrentTime();
  const newState = engineRef.current.update(currentTime);

  // 只在状态变化时更新
  if (hasStateChanged(state, newState)) {
    setState(newState);
  }

  rafIdRef.current = requestAnimationFrame(update);
};
```

### 4.3 逐字高亮的计算逻辑

**核心思想**：根据当前播放时间，计算每个字的"已播放"比例，通过 CSS 渐变实现逐字高亮效果。

**计算流程**：

```
当前时间 (currentTime)
        │
        ▼
┌───────────────────┐
│  二分查找当前行    │
│  (lineIndex)      │
└───────┬───────────┘
        │
        ▼
┌───────────────────┐
│  线性扫描当前字    │
│  (tokenIndex)     │
└───────┬───────────┘
        │
        ▼
┌───────────────────┐
│  计算字进度        │
│  (0-1)            │
└───────┬───────────┘
        │
        ▼
┌───────────────────┐
│  应用 CSS 渐变    │
│  高亮效果         │
└───────────────────┘
```

**CSS 实现方案**：

方案 A：使用 CSS `background-clip: text` 实现渐变文字

```css
.lyrics-token {
  background: linear-gradient(
    to right,
    #FFFFFF var(--progress),
    rgba(255, 255, 255, 0.3) var(--progress)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

方案 B：使用两层文字叠加实现（兼容性更好）

```tsx
function LyricsToken({ text, progress }: LyricsTokenProps) {
  return (
    <span className="lyrics-token">
      {/* 底层：未播放颜色 */}
      <span className="text-white/30">{text}</span>

      {/* 顶层：已播放颜色，使用 clip-path 裁剪 */}
      <span
        className="absolute inset-0 text-white"
        style={{ clipPath: `inset(0 ${100 - progress}% 0 0)` }}
      >
        {text}
      </span>
    </span>
  );
}
```

**决策**：选择方案 A（background-clip: text），因为：
1. 性能更好，只需要一个 DOM 元素
2. 代码更简洁
3. 现代浏览器支持度足够（Chrome 90+, Firefox 90+, Safari 15+）

---

## 5. 组件设计

### 5.1 主要组件列表

| 组件 | 职责 | Props | 状态来源 |
|------|------|-------|----------|
| AppLayout | 主布局容器，协调侧边栏和主内容区 | children | - |
| Sidebar | 侧边栏，包含歌曲列表 | - | PlayerStore |
| SongList | 歌曲列表容器 | songs | PlayerStore |
| SongItem | 单首歌曲项 | song, isActive | PlayerStore |
| NowPlaying | 当前播放视图 | - | PlayerStore |
| CoverArt | 封面图片 | src, alt | - |
| LyricsView | 歌词滚动视图 | lyrics, state | PlayerStore |
| LyricsLine | 单行歌词 | line, isActive, progress | - |
| BottomBar | 底部播放控制栏 | - | PlayerStore |
| ProgressBar | 进度条 | currentTime, duration | PlayerStore |
| VolumeControl | 音量控制 | volume, isMuted | PlayerStore |
| PlaybackControls | 播放控制按钮 | isPlaying | PlayerStore |
| EmptyState | 空状态引导 | - | - |

### 5.2 组件层级结构

```
App
└── AppLayout
    ├── Sidebar
    │   └── SongList
    │       ├── SongItem
    │       ├── SongItem
    │       └── ...
    │
    ├── NowPlaying
    │   ├── CoverArt
    │   └── LyricsView
    │       ├── LyricsLine
    │       ├── LyricsLine
    │       └── ...
    │
    └── BottomBar
        ├── CoverArt (缩略图)
        ├── SongInfo
        ├── ProgressBar
        ├── PlaybackControls
        └── VolumeControl
```

### 5.3 组件间数据流

```
┌─────────────────────────────────────────────────────────────┐
│                      PlayerStore (Zustand)                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  songs: Song[]                                       │   │
│  │  currentSong: Song | null                            │   │
│  │  isPlaying: boolean                                  │   │
│  │  currentTime: number                                 │   │
│  │  lyricsState: LyricsState | null                     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│   SongList     │  │   NowPlaying   │  │   BottomBar    │
│   (读取 songs) │  │ (读取 lyrics)  │  │ (读取播放状态) │
└────────────────┘  └────────────────┘  └────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│   playSong()   │  │   seekTo()     │  │ togglePlay()   │
│   (写入 store) │  │   (写入 store) │  │ (写入 store)   │
└────────────────┘  └────────────────┘  └────────────────┘
```

**数据流原则**：

1. **单向数据流**：所有状态变更通过 Zustand Store
2. **读写分离**：组件通过 `usePlayerStore` 读取状态，通过 actions 修改状态
3. **最小化 props**：组件只接收必要的 props，复杂状态从 Store 读取

### 5.4 关键组件实现示例

**LyricsView 组件**：

```tsx
function LyricsView() {
  const lyrics = usePlayerStore(state => state.currentSong?.lyrics);
  const lyricsState = usePlayerStore(state => state.lyricsState);
  const seekTo = usePlayerStore(state => state.seekTo);
  const containerRef = useRef<HTMLDivElement>(null);

  // 自动滚动到当前行
  useEffect(() => {
    if (!lyricsState || !containerRef.current) return;

    const currentLine = containerRef.current.children[
      lyricsState.currentLineIndex
    ] as HTMLElement;

    if (currentLine) {
      currentLine.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [lyricsState?.currentLineIndex]);

  if (!lyrics) {
    return <div className="text-white/30">暂无歌词</div>;
  }

  return (
    <div
      ref={containerRef}
      className="lyrics-container overflow-y-auto h-full px-8 py-12"
    >
      {lyrics.lines.map((line, index) => (
        <LyricsLine
          key={index}
          line={line}
          isActive={index === lyricsState?.currentLineIndex}
          isPast={index < (lyricsState?.currentLineIndex ?? -1)}
          tokenProgress={
            index === lyricsState?.currentLineIndex
              ? lyricsState?.tokenProgress ?? 0
              : 0
          }
          onClick={() => seekTo(line.startTime)}
        />
      ))}
    </div>
  );
}
```

**LyricsLine 组件**：

```tsx
interface LyricsLineProps {
  line: LyricsLine;
  isActive: boolean;
  isPast: boolean;
  tokenProgress: number;
  onClick: () => void;
}

function LyricsLine({
  line,
  isActive,
  isPast,
  tokenProgress,
  onClick
}: LyricsLineProps) {
  // 计算每个 token 的高亮状态
  const tokensWithProgress = useMemo(() => {
    if (!isActive) {
      return line.tokens.map(token => ({
        ...token,
        progress: isPast ? 1 : 0
      }));
    }

    // 计算当前行内每个字的进度
    return line.tokens.map((token, index) => {
      const lineDuration = line.endTime - line.startTime;
      const tokenStartProgress =
        (token.start - line.startTime) / lineDuration;
      const tokenEndProgress =
        (token.end - line.startTime) / lineDuration;

      let progress = 0;
      if (tokenProgress >= tokenEndProgress) {
        progress = 1; // 已播放
      } else if (tokenProgress > tokenStartProgress) {
        progress =
          (tokenProgress - tokenStartProgress) /
          (tokenEndProgress - tokenStartProgress);
      }

      return { ...token, progress };
    });
  }, [line, isActive, isPast, tokenProgress]);

  return (
    <div
      className={`
        lyrics-line cursor-pointer transition-all duration-300
        ${isActive ? 'text-2xl font-semibold text-white scale-102' : ''}
        ${isPast ? 'text-lg text-white/50' : 'text-lg text-white/30'}
      `}
      onClick={onClick}
    >
      {tokensWithProgress.map((token, index) => (
        <span
          key={index}
          className="lyrics-token"
          style={{
            '--progress': `${token.progress * 100}%`
          } as React.CSSProperties}
        >
          {token.text}
        </span>
      ))}
    </div>
  );
}
```

---

## 6. 关键技术决策

### 6.1 静态资源扫描方案

**决策**：使用 fetch + manifest.json 方案

**理由**：

1. **浏览器安全限制**：浏览器无法直接列出服务器目录，必须有一个明确的文件清单
2. **构建时 vs 运行时**：
   - Vite import.meta.glob：构建时静态分析，添加新歌曲需要重新构建
   - fetch + manifest.json：运行时加载，添加新歌曲只需更新 manifest.json
3. **灵活性**：manifest.json 可以手动维护，也可以通过脚本自动生成

**权衡**：

| 获得 | 付出 |
|------|------|
| 运行时动态加载能力 | 需要维护 manifest.json |
| 无需重新构建即可添加歌曲 | 首次加载需要额外请求 |
| 代码逻辑简单 | 需要约定目录命名规范 |

**降级方案**：如果 manifest.json 不存在，尝试 fetch 一个固定的歌曲列表文件，或者显示空状态引导用户。

### 6.2 音频格式兼容性处理

**决策**：MVP 优先保证 MP3 支持，其他格式通过检测提供警告

**实现**：

```typescript
const SUPPORTED_FORMATS = {
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  flac: 'audio/flac',
  aac: 'audio/aac',
  m4a: 'audio/mp4'
};

function isFormatSupported(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  const mimeType = SUPPORTED_FORMATS[ext as keyof typeof SUPPORTED_FORMATS];

  if (!mimeType) return false;

  const audio = new Audio();
  return audio.canPlayType(mimeType) !== '';
}
```

**UI 处理**：

1. 在 SongItem 中显示格式支持状态
2. 不支持的格式显示警告图标
3. 点击播放时显示友好提示

### 6.3 歌词文件缺失时的回退方案

**决策**：支持三种回退级别

| 级别 | 条件 | 显示内容 |
|------|------|----------|
| 1 | 有 token_timestamps | 逐字高亮歌词 |
| 2 | 有 lrc_text，无 token_timestamps | 逐行高亮歌词 |
| 3 | 无 lyrics.json | 显示"暂无歌词"提示 |

**实现**：

```typescript
function useLyricsDisplay(song: Song | null) {
  if (!song?.lyrics) {
    return { type: 'none' as const };
  }

  const { lines, rawLrc } = song.lyrics;

  // 检查是否有逐字数据
  const hasTokenData = lines.some(line => line.tokens.length > 0);

  if (hasTokenData) {
    return {
      type: 'word' as const,
      lines
    };
  }

  // 回退到 LRC 逐行显示
  if (rawLrc) {
    return {
      type: 'line' as const,
      lines: parseLrcToLines(rawLrc)
    };
  }

  return { type: 'none' as const };
}
```

**LRC 解析回退**：

```typescript
interface ParsedLrcLine {
  index: number;
  startTime: number;
  text: string;
}

function parseLrcToLines(lrcText: string): ParsedLrcLine[] {
  const lines: ParsedLrcLine[] = [];
  const regex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/g;

  let match;
  while ((match = regex.exec(lrcText)) !== null) {
    const minutes = parseInt(match[1]);
    const seconds = parseInt(match[2]);
    const milliseconds = parseInt(match[3].padEnd(3, '0'));
    const text = match[4].trim();

    if (text) {
      lines.push({
        index: lines.length,
        startTime: minutes * 60 + seconds + milliseconds / 1000,
        text
      });
    }
  }

  return lines.sort((a, b) => a.startTime - b.startTime);
}
```

### 6.4 封面图片缺失处理

**决策**：显示默认占位图

**实现**：

1. 在 `public/` 目录放置默认封面图 `default-cover.svg`
2. CoverArt 组件监听 `onError` 事件，加载失败时切换到默认图
3. 支持多种封面文件名约定：`cover.jpg`, `cover.png`, `cover.webp`, `folder.jpg`

```tsx
function CoverArt({ src, alt, className }: CoverArtProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  return (
    <div className={`relative ${className}`}>
      {hasError ? (
        <DefaultCover />
      ) : (
        <img
          src={imgSrc}
          alt={alt}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
}
```

---

## 7. 附录

### 7.1 环境变量

本项目是纯前端项目，不需要环境变量。所有配置硬编码在代码中。

### 7.2 性能优化策略

1. **虚拟滚动**：歌曲列表超过 100 首时使用虚拟滚动
2. **图片懒加载**：封面图片使用 IntersectionObserver 懒加载
3. **歌词防抖**：歌词状态更新使用 requestAnimationFrame 节流
4. **音频预加载**：播放当前歌曲时预加载下一首的音频元数据

### 7.3 浏览器兼容性处理

```typescript
// 检测 backdrop-filter 支持
function supportsBackdropFilter(): boolean {
  return (
    CSS.supports('backdrop-filter', 'blur(1px)') ||
    CSS.supports('-webkit-backdrop-filter', 'blur(1px)')
  );
}

// 毛玻璃效果降级
function getGlassEffectStyle(): React.CSSProperties {
  if (supportsBackdropFilter()) {
    return {
      background: 'rgba(28, 28, 30, 0.7)',
      backdropFilter: 'blur(40px) saturate(180%)',
      WebkitBackdropFilter: 'blur(40px) saturate(180%)'
    };
  }

  // 降级：纯半透明背景
  return {
    background: 'rgba(28, 28, 30, 0.95)'
  };
}
```

### 7.4 测试策略

| 测试类型 | 覆盖范围 | 工具 |
|----------|----------|------|
| 单元测试 | lib 模块（songScanner, lyricsEngine） | Vitest |
| 组件测试 | 关键组件渲染和交互 | Vitest + Testing Library |
| E2E 测试 | 完整播放流程 | Playwright |

### 7.5 后续迭代预留

1. **播放队列**：PlayerStore 中预留 queue 字段
2. **播放模式**：预留 repeatMode 和 shuffleMode 字段
3. **歌曲搜索**：SongList 组件预留 filter 逻辑
4. **键盘快捷键**：使用 useHotkeys hook 预留扩展点

---

**文档版本历史**

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| 1.0 | 2026-05-31 | 初始版本 | Tech Architect Agent |
