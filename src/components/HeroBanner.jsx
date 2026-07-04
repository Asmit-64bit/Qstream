import { useState } from 'react';
import { Play, Info, Volume2, VolumeX } from 'lucide-react';

function HeroBanner({ onPlayClick }) {
  const [isMuted, setIsMuted] = useState(true);

  return (
    <section className="hero-banner">
      {/* Live Auto-looping YouTube Video Trailer Background */}
      <div className="hero-video-bg">
        <iframe
          src={`https://www.youtube.com/embed/b9EkMc79ZSU?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=b9EkMc79ZSU&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&enablejsapi=1`}
          title="Stranger Things Trailer Video Background"
          allow="autoplay; encrypted-media"
        />
      </div>

      {/* Linear Cinematic Gradients Overlays */}
      <div className="hero-banner-overlay" />

      <div className="hero-content">
        <div className="hero-badge">
          <span>An</span>
          <span style={{ fontSize: '24px', fontWeight: '900', fontStyle: 'italic', letterSpacing: '-1px' }}>NETFLIX</span>
          <span>Original Series</span>
        </div>
        <h1 className="hero-title">STRANGER<br />THINGS</h1>
        <p className="hero-description">
          When a young boy vanishes, a small town uncovers a mystery involving secret experiments,
          terrifying supernatural forces and one strange little girl with telekinetic powers.
        </p>
        <div className="hero-buttons">
          <button className="btn-netflix hero-btn play" onClick={() => onPlayClick('Stranger Things')}>
            <Play size={20} fill="currentColor" />
            <span>Play</span>
          </button>
          <button className="btn-secondary hero-btn info" onClick={() => onPlayClick({ tmdbId: '66732', type: 'tv', title: 'Stranger Things' })}>
            <Info size={20} />
            <span>More Info</span>
          </button>
        </div>
      </div>

      {/* Ambient controls */}
      <div className="hero-ambient-controls">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="control-btn"
          style={{ width: '42px', height: '42px', border: '1px solid rgba(255,255,255,0.4)', background: 'rgba(0,0,0,0.4)' }}
          title={isMuted ? "Unmute Ambient Intro" : "Mute Ambient Intro"}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <span className="hero-rating-badge">
          16+
        </span>
      </div>
    </section>
  );
}

export default HeroBanner;
