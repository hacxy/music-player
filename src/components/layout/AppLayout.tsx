import type { ReactNode } from 'react';

interface AppLayoutProps {
  children: ReactNode;
}

/**
 * AppLayout - 主布局容器
 *
 * 匹配设计原型的 flex 布局：
 * - 垂直排列：主内容区 + 底部控制栏
 * - 主内容区水平排列：侧边栏 + 播放视图
 */
export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="h-screen flex flex-col bg-black text-white overflow-hidden">
      {children}
    </div>
  );
}
