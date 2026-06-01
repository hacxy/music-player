/**
 * EmptyState - 空状态引导
 */
export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <svg
        className="w-16 h-16 text-[var(--color-text-secondary)] mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
        />
      </svg>
      <h3 className="text-lg font-semibold mb-2">暂无歌曲</h3>
      <p className="text-sm text-[var(--color-text-secondary)]">
        请在 public/songs 目录中添加音乐文件
      </p>
    </div>
  );
}
