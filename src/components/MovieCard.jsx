import { useState } from 'react';
import { Play, Plus, Check, ThumbsUp, Info } from 'lucide-react';

function MovieCard({ movie, onPlayClick, onToggleMyList }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="movie-card-wrapper">
      {imageFailed ? (
        <div className="movie-card-fallback" aria-label={movie.title}>
          <span>{movie.title}</span>
        </div>
      ) : (
        <img
          src={movie.image}
          alt={movie.title}
          className="movie-card-img"
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      )}
      
      {/* Detailed Zoom-Hover Card */}
      <div className="movie-hover-details">
        <div className="hover-controls">
          <div className="controls-left">
            <button 
              className="control-btn play" 
              onClick={() => onPlayClick(movie)}
              title="Play Video"
            >
              <Play size={16} fill="currentColor" />
            </button>
            <button 
              className="control-btn" 
              onClick={() => onToggleMyList(movie.id)}
              title={movie.isAdded ? "Remove from My List" : "Add to My List"}
            >
              {movie.isAdded ? <Check size={16} /> : <Plus size={16} />}
            </button>
            <button className="control-btn" title="I Like This">
              <ThumbsUp size={16} />
            </button>
          </div>
          <button 
            className="control-btn" 
            onClick={() => onPlayClick(movie)}
            title="More Info"
          >
            <Info size={16} />
          </button>
        </div>

        {/* Title to avoid card confusion */}
        <div className="hover-movie-title" style={{ 
          fontWeight: '700', 
          fontSize: '15px', 
          color: '#fff', 
          textAlign: 'left',
          marginTop: '4px'
        }}>
          {movie.title}
        </div>

        <div className="hover-meta">
          <span className="match-score">{movie.match} Match</span>
          <span className="maturity-rating">{movie.rating}</span>
          <span className="duration-tag">{movie.duration}</span>
          <span className="hd-badge">HD</span>
        </div>

        <div className="hover-genres">
          {movie.genres.map((g, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: '#fff' }}>{g}</span>
              {i < movie.genres.length - 1 && (
                <span className="genre-dot" aria-hidden="true">&middot;</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MovieCard;
