import type { Song, RawLyricsData, LyricsData, Manifest } from '../types';

/**
 * SongScanner - 扫描静态资源目录，解析歌词文件
 *
 * 职责：
 * 1. 读取 manifest.json 获取歌曲目录列表
 * 2. 并行加载歌曲元数据（lyrics.json）
 * 3. 格式转换：扁平 token_timestamps -> 按行分组
 * 4. 构建 Song 对象
 */

const SONGS_BASE_PATH = '/songs';

/**
 * 从 manifest.json 获取所有歌曲目录
 */
async function fetchManifest(): Promise<Manifest> {
  const response = await fetch(`${SONGS_BASE_PATH}/manifest.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch manifest: ${response.statusText}`);
  }
  return response.json();
}

/**
 * 从目录名生成可读标题
 */
function formatDirectoryName(directory: string): string {
  return directory
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * 查找封面文件（约定俗成的文件名）
 */
function findCoverFile(basePath: string): string {
  // 优先级：cover.jpg > cover.png > cover.webp > folder.jpg
  // 实际使用时通过 onError 回退机制处理
  return `${basePath}/cover.jpg`;
}

/**
 * 将原始歌词数据转换为应用内部格式
 */
function convertToInternalFormat(raw: RawLyricsData): LyricsData {
  const lines = raw.token_timestamps.map((lineData) => {
    const tokens = lineData.tokens;
    return {
      index: lineData.line_index,
      startTime: tokens[0]?.start ?? 0,
      endTime: tokens[tokens.length - 1]?.end ?? 0,
      text: tokens.map((t) => t.text).join(''),
      tokens: tokens,
    };
  });

  // 按 startTime 排序
  lines.sort((a, b) => a.startTime - b.startTime);

  // 重新索引
  lines.forEach((line, i) => (line.index = i));

  return {
    lines,
    rawLrc: raw.lrc_text,
  };
}

/**
 * 从歌词数据构建 Song 对象
 */
function buildSongFromLyrics(directory: string, rawLyrics: RawLyricsData): Song {
  const basePath = `${SONGS_BASE_PATH}/${directory}`;
  return {
    id: directory,
    directoryName: directory,
    title: rawLyrics.metadata?.title ?? formatDirectoryName(directory),
    artist: rawLyrics.metadata?.artist ?? 'Unknown Artist',
    album: rawLyrics.metadata?.album ?? 'Unknown Album',
    duration: rawLyrics.duration_seconds,
    audioSrc: `${basePath}/${rawLyrics.audio_file}`,
    coverSrc: findCoverFile(basePath),
    lyrics: convertToInternalFormat(rawLyrics),
  };
}

/**
 * 加载单首歌曲的歌词数据
 */
async function loadSongLyrics(directory: string): Promise<Song | null> {
  try {
    const response = await fetch(`${SONGS_BASE_PATH}/${directory}/lyrics.json`);
    if (!response.ok) {
      console.warn(`Failed to load lyrics for ${directory}`);
      return null;
    }
    const rawLyrics: RawLyricsData = await response.json();
    return buildSongFromLyrics(directory, rawLyrics);
  } catch (error) {
    console.error(`Error loading song ${directory}:`, error);
    return null;
  }
}

/**
 * 扫描所有歌曲
 */
export async function scanAll(): Promise<Song[]> {
  const manifest = await fetchManifest();

  // 并行加载所有歌曲
  const songPromises = manifest.songs.map((entry) => loadSongLyrics(entry.directory));
  const results = await Promise.all(songPromises);

  // 过滤掉加载失败的歌曲
  return results.filter((song): song is Song => song !== null);
}
