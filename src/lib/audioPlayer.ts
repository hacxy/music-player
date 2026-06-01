/**
 * AudioPlayer - 封装 HTMLAudioElement，提供播放控制接口
 *
 * 设计要点：
 * 1. 单例模式：全局只有一个 AudioPlayer 实例
 * 2. 事件驱动：通过回调函数通知状态变化
 * 3. 状态同步：内部维护播放状态，与 Zustand Store 同步
 */

interface AudioPlayerOptions {
  onTimeUpdate: (currentTime: number) => void;
  onDurationChange: (duration: number) => void;
  onEnded: () => void;
  onPlay: () => void;
  onPause: () => void;
  onError: (error: Error) => void;
}

export class AudioPlayer {
  private audio: HTMLAudioElement;
  private options: AudioPlayerOptions;
  private lastVolume: number = 1;
  private currentSrc: string | null = null;
  private boundHandlers: Record<string, EventListener> = {};

  constructor(options: AudioPlayerOptions) {
    this.audio = new Audio();
    this.options = options;

    // 存储绑定的 handler 引用，便于 destroy 时移除
    this.boundHandlers = {
      timeupdate: () => this.options.onTimeUpdate(this.audio.currentTime),
      durationchange: () => this.options.onDurationChange(this.audio.duration),
      ended: () => this.options.onEnded(),
      play: () => this.options.onPlay(),
      pause: () => this.options.onPause(),
      error: () => {
        const error = this.audio.error;
        this.options.onError(
          new Error(`Audio error: ${error?.message ?? 'Unknown error'}`)
        );
      },
    };

    // 绑定事件
    Object.entries(this.boundHandlers).forEach(([event, handler]) => {
      this.audio.addEventListener(event, handler);
    });
  }

  /**
   * 播放音频
   * @param src 音频源地址，如果不传则继续播放当前音频
   */
  async play(src?: string): Promise<void> {
    if (src && this.currentSrc !== src) {
      this.audio.src = src;
      this.currentSrc = src;
    }
    try {
      await this.audio.play();
    } catch (error) {
      this.options.onError(error as Error);
    }
  }

  /**
   * 暂停播放
   */
  pause(): void {
    this.audio.pause();
  }

  /**
   * 停止播放并重置
   */
  stop(): void {
    this.audio.pause();
    this.audio.currentTime = 0;
  }

  /**
   * 跳转到指定时间
   */
  seek(time: number): void {
    this.audio.currentTime = Math.max(0, Math.min(time, this.audio.duration));
  }

  /**
   * 设置音量
   * @param volume 音量值 (0-1)
   */
  setVolume(volume: number): void {
    this.audio.volume = Math.max(0, Math.min(1, volume));
    this.lastVolume = this.audio.volume;
  }

  /**
   * 静音
   */
  mute(): void {
    this.lastVolume = this.audio.volume;
    this.audio.muted = true;
  }

  /**
   * 取消静音
   */
  unmute(): void {
    this.audio.muted = false;
    this.audio.volume = this.lastVolume;
  }

  /**
   * 获取当前播放时间
   */
  getCurrentTime(): number {
    return this.audio.currentTime;
  }

  /**
   * 获取音频总时长
   */
  getDuration(): number {
    return this.audio.duration;
  }

  /**
   * 获取当前音量
   */
  getVolume(): number {
    return this.audio.volume;
  }

  /**
   * 是否正在播放
   */
  isPlaying(): boolean {
    return !this.audio.paused;
  }

  /**
   * 是否静音
   */
  isMuted(): boolean {
    return this.audio.muted;
  }

  /**
   * 销毁播放器，释放资源
   */
  destroy(): void {
    this.audio.pause();
    // 移除所有事件监听器，防止内存泄漏
    Object.entries(this.boundHandlers).forEach(([event, handler]) => {
      this.audio.removeEventListener(event, handler);
    });
    this.boundHandlers = {};
    this.currentSrc = null;
    this.audio.src = '';
    this.audio.load();
  }
}

// 单例实例
let instance: AudioPlayer | null = null;

/**
 * 获取 AudioPlayer 单例
 */
export function getAudioPlayer(options?: AudioPlayerOptions): AudioPlayer {
  if (!instance && options) {
    instance = new AudioPlayer(options);
  }
  return instance!;
}
