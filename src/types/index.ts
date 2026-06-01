// 歌曲数据结构
export interface Song {
  id: string;
  directoryName: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  audioSrc: string;
  coverSrc: string;
  lyrics: LyricsData | null;
}

// 歌词数据
export interface LyricsData {
  lines: LyricsLine[];
  rawLrc: string;
}

// 歌词行
export interface LyricsLine {
  index: number;
  startTime: number;
  endTime: number;
  text: string;
  tokens: LyricsToken[];
}

// 歌词字/词
export interface LyricsToken {
  text: string;
  start: number;
  end: number;
}

// 歌词状态
export interface LyricsState {
  currentLineIndex: number;
  currentTokenIndex: number;
  lineProgress: number;
  tokenProgress: number;
}

// 原始歌词文件格式
export interface RawLyricsData {
  audio_file: string;
  duration_seconds: number;
  metadata?: {
    title?: string;
    artist?: string;
    album?: string;
  };
  lrc_text: string;
  token_timestamps: Array<{
    line_index: number;
    tokens: Array<{ text: string; start: number; end: number }>;
  }>;
}

// manifest.json 格式
export interface Manifest {
  songs: Array<{
    directory: string;
  }>;
}
