import type { LyricsLine, LyricsState, LyricsToken } from '../types';

/**
 * LyricsEngine - 解析歌词时间戳，计算当前高亮状态
 *
 * 核心算法：
 * 1. 二分查找定位当前行
 * 2. 线性扫描定位当前字
 * 3. 计算进度值 (0-1)
 */

export class LyricsEngine {
  private lines: LyricsLine[];
  private state: LyricsState;

  constructor(lines: LyricsLine[]) {
    this.lines = lines;
    this.state = {
      currentLineIndex: -1,
      currentTokenIndex: -1,
      lineProgress: 0,
      tokenProgress: 0,
    };
  }

  /**
   * 根据当前时间更新歌词状态
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

  /**
   * 二分查找最后一个 startTime <= currentTime 的行
   */
  private findLineIndex(currentTime: number): number {
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

  /**
   * 线性扫描当前字（token 数量通常较少）
   */
  private findTokenIndex(tokens: LyricsToken[], currentTime: number): number {
    for (let i = tokens.length - 1; i >= 0; i--) {
      if (tokens[i].start <= currentTime) {
        return i;
      }
    }
    return -1;
  }

  /**
   * 计算进度值 (0-1)
   */
  private calculateProgress(current: number, start: number, end: number): number {
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

  /**
   * 获取当前状态
   */
  getState(): LyricsState {
    return { ...this.state };
  }
}
