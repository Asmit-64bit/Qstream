import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard.jsx';

function MovieRow({ row, onPlayClick, onToggleMyList }) {
  const handleScroll = (direction) => {
    const container = document.getElementById(row.id);
    if (container) {
      const scrollAmount = direction === 'left' 
        ? -container.clientWidth * 0.75 
        : container.clientWidth * 0.75;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="movie-row">
      <h2 className="movie-row-title">
        <span>{row.title}</span>
        <ChevronRight size={18} style={{ color: 'var(--netflix-red)', opacity: '0.8' }} />
      </h2>
      
      <div className="movie-row-wrapper">
        <button className="row-arrow left" onClick={() => handleScroll('left')} aria-label="Scroll Left">
          <ChevronLeft size={24} />
        </button>
        
        <div id={row.id} className="movie-cards-container">
          {row.movies.map((movie) => (
            <MovieCard 
              key={movie.id} 
              movie={movie} 
              onPlayClick={onPlayClick} 
              onToggleMyList={onToggleMyList} 
            />
          ))}
        </div>
        
        <button className="row-arrow right" onClick={() => handleScroll('right')} aria-label="Scroll Right">
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}

export default MovieRow;
