import { usePlayerStore } from '../../stores/playerStore';
import { SongItem } from './SongItem';
import { EmptyState } from './EmptyState';

/**
 * SongList - 歌曲列表容器
 */
export function SongList() {
  const songs = usePlayerStore((state) => state.songs);
  const currentSong = usePlayerStore((state) => state.currentSong);
  const playSong = usePlayerStore((state) => state.playSong);

  if (songs.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col gap-0.5">
      {songs.map((song) => (
        <SongItem
          key={song.id}
          song={song}
          isActive={currentSong?.id === song.id}
          onClick={() => playSong(song)}
        />
      ))}
    </div>
  );
}
