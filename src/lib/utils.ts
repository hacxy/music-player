/**
 * 工具函数集合
 */

/**
 * 格式化时间为 mm:ss 格式
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) return '0:00';

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 检测浏览器是否支持指定音频格式
 */
export function isFormatSupported(filename: string): boolean {
  const SUPPORTED_FORMATS: Record<string, string> = {
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    flac: 'audio/flac',
    aac: 'audio/aac',
    m4a: 'audio/mp4',
  };

  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  const mimeType = SUPPORTED_FORMATS[ext];

  if (!mimeType) return false;

  const audio = new Audio();
  return audio.canPlayType(mimeType) !== '';
}

/**
 * 检测浏览器是否支持 backdrop-filter
 */
export function supportsBackdropFilter(): boolean {
  return (
    CSS.supports('backdrop-filter', 'blur(1px)') ||
    CSS.supports('-webkit-backdrop-filter', 'blur(1px)')
  );
}

/**
 * 获取毛玻璃效果样式
 */
export function getGlassEffectStyle(): React.CSSProperties {
  if (supportsBackdropFilter()) {
    return {
      background: 'rgba(28, 28, 30, 0.7)',
      backdropFilter: 'blur(40px) saturate(180%)',
      WebkitBackdropFilter: 'blur(40px) saturate(180%)',
    };
  }

  // 降级：纯半透明背景
  return {
    background: 'rgba(28, 28, 30, 0.95)',
  };
}

/**
 * 解析 LRC 格式歌词
 */
export function parseLrcToLines(lrcText: string): Array<{
  index: number;
  startTime: number;
  text: string;
}> {
  const lines: Array<{ index: number; startTime: number; text: string }> = [];
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
        text,
      });
    }
  }

  return lines.sort((a, b) => a.startTime - b.startTime);
}
