import { useState } from 'react';
import { X, Play } from 'lucide-react';

function StreamingModal({ activeStream, onClose, onEpisodeSelect, onSeasonSelect, TV_EPISODES }) {
  const [selectedSource, setSelectedSource] = useState('vidsrc'); // 'vidlink' | 'vidsrc' | 'vidking'

  if (!activeStream) return null;
  const { tmdbId, type, season, episode } = activeStream;

  // Generate stream iframe URL based on active parameters
  const getStreamUrl = () => {
    if (selectedSource === 'vidlink') {
      if (type === 'movie') {
        return `https://vidlink.pro/movie/${tmdbId}?primaryColor=e50914&autoplay=true&muted=false`;
      } else {
        return `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}?primaryColor=e50914&next=1&autoplay=true&muted=false`;
      }
    } else if (selectedSource === 'vidsrc') {
      if (type === 'movie') {
        return `https://vidsrc.to/embed/movie/${tmdbId}`;
      } else {
        return `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`;
      }
    } else {
      if (type === 'movie') {
        return `https://www.vidking.net/embed/movie/${tmdbId}?autoplay=1&muted=0`;
      } else {
        return `https://www.vidking.net/embed/tv/${tmdbId}/${season}/${episode}?autoplay=1&muted=0&next_episode=1&episode_selector=1`;
      }
    }
  };

  // Helper to fetch dynamic episode details
  const getEpisodesList = () => {
    if (TV_EPISODES && TV_EPISODES[tmdbId]) {
      const showData = TV_EPISODES[tmdbId];
      if (Array.isArray(showData)) {
        return showData;
      }
      const activeSeason = season || 1;
      if (showData[activeSeason]) {
        return showData[activeSeason];
      }
    }
    // Fallback if not custom
    return [1, 2, 3, 4, 5, 6, 7, 8].map((num) => ({
      episodeNum: num,
      title: `Episode ${num}`,
      duration: "45m",
      description: "As the mystery deepens, unexpected alliances form, secrets unravel, and the characters face critical stakes in this high-intensity segment.",
      thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=300&h=170&q=80"
    }));
  };

  // Helper to get list of season numbers
  const getSeasonsList = () => {
    if (TV_EPISODES && TV_EPISODES[tmdbId]) {
      const showData = TV_EPISODES[tmdbId];
      if (!Array.isArray(showData)) {
        return Object.keys(showData).map(Number).sort((a, b) => a - b);
      }
    }
    return [1, 2, 3, 4];
  };

  return (
    <div className="stream-modal-overlay" onClick={onClose}>
      <div className="stream-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="stream-modal-header">
          <div className="stream-title-info">
            <h3>{activeStream.title}</h3>
            <span className="stream-subtitle">
              {activeStream.type === 'movie' 
                ? 'Feature Film' 
                : `TV Series - Season ${activeStream.season} - Episode ${activeStream.episode}`
              }
            </span>
          </div>
          
          <div className="stream-controls-right">
            {/* Source Selection Slider Toggles */}
            <div className="stream-source-toggles">
              <button 
                className={`stream-source-btn ${selectedSource === 'vidlink' ? 'active' : ''}`}
                onClick={() => setSelectedSource('vidlink')}
              >
                Vidlink.pro
              </button>
              <button 
                className={`stream-source-btn ${selectedSource === 'vidsrc' ? 'active' : ''}`}
                onClick={() => setSelectedSource('vidsrc')}
              >
                Vidsrc.to
              </button>
              <button 
                className={`stream-source-btn ${selectedSource === 'vidking' ? 'active' : ''}`}
                onClick={() => setSelectedSource('vidking')}
              >
                Vidking.net
              </button>
            </div>
            
            {/* Close Button */}
            <button className="stream-close-btn" onClick={onClose}>
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Video Frame */}
        <div className="stream-iframe-container">
          <iframe 
            src={getStreamUrl()} 
            title={`${activeStream.title} Streaming Player`}
            allowFullScreen
            scrolling="no"
            allow="autoplay; encrypted-media; picture-in-picture"
          />
        </div>

        {/* Episode selector dashboard for TV Shows */}
        {activeStream.type === 'tv' && (
          <div className="tv-selector-container">
            <div className="tv-selector-header">
              <span className="tv-selector-label">Episodes</span>
              <select 
                className="season-dropdown"
                value={activeStream.season || 1}
                onChange={(e) => onSeasonSelect(Number(e.target.value))}
              >
                {getSeasonsList().map((sNum) => (
                  <option key={sNum} value={sNum}>Season {sNum}</option>
                ))}
              </select>
            </div>
            <div className="episodes-list-column">
              {getEpisodesList().map((ep) => (
                <div 
                  key={ep.episodeNum}
                  className={`episode-list-card ${activeStream.episode === ep.episodeNum ? 'active' : ''}`}
                  onClick={() => onEpisodeSelect(ep.episodeNum)}
                >
                  <span className="episode-index">{ep.episodeNum}</span>
                  <div className="episode-card-thumb">
                    <img src={ep.thumbnail} alt={ep.title} />
                    <div className="episode-play-icon-overlay">
                      <Play size={18} fill="#fff" color="#fff" />
                    </div>
                  </div>
                  <div className="episode-card-meta">
                    <div className="episode-card-title-row">
                      <h4>{ep.title}</h4>
                      <span className="episode-card-duration">{ep.duration}</span>
                    </div>
                    <p className="episode-card-desc">{ep.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default StreamingModal;
