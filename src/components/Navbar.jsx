import { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, LogOut, User, Settings, HelpCircle } from 'lucide-react';
import netflixLogo from '../assets/netflix-logo.svg';

function Navbar({ onLogout, activeTab, setActiveTab, searchQuery, setSearchQuery }) {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const searchInputRef = useRef(null);

  // Focus search input programmatically when search becomes active
  useEffect(() => {
    if (isSearchActive && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchActive]);

  // Load current profile credentials and switchers from local storage
  const [currentProfileName] = useState(() => {
    return localStorage.getItem('netflix_selected_profile') || 'Guest';
  });
  const [currentProfileAvatar] = useState(() => {
    return localStorage.getItem('netflix_selected_avatar') || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80';
  });

  const otherProfiles = useMemo(() => {
    const saved = localStorage.getItem('netflix_profiles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.filter(p => p.name !== currentProfileName);
      } catch (error) {
        console.error(error);
      }
    }
    return [];
  }, [currentProfileName]);

  const handleSwitchProfile = (profile) => {
    // Play quick chime during swap
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(120, audioCtx.currentTime);
        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.4, audioCtx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.55);
      }
    } catch {
      // Browsers can block AudioContext until the user has interacted.
    }

    localStorage.setItem('netflix_selected_profile', profile.name);
    localStorage.setItem('netflix_selected_avatar', profile.avatar);
    localStorage.setItem('netflix_selected_profile_id', profile.id);
    window.location.reload();
  };

  // Handle transparent to dark background transition on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchToggle = () => {
    setIsSearchActive(!isSearchActive);
  };

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    setSearchQuery('');
    setIsSearchActive(false);
  };

  const handleLogoClick = () => {
    setActiveTab('Home');
    setSearchQuery('');
    setIsSearchActive(false);
    navigate('/browse');
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-left">
        <img className="nav-logo" src={netflixLogo} alt="Netflix" onClick={handleLogoClick} />
        <ul className="nav-links">
          <li className={`nav-item ${activeTab === 'Home' ? 'active' : ''}`} onClick={() => handleTabClick('Home')}>Home</li>
          <li className={`nav-item ${activeTab === 'TV Shows' ? 'active' : ''}`} onClick={() => handleTabClick('TV Shows')}>TV Shows</li>
          <li className={`nav-item ${activeTab === 'Movies' ? 'active' : ''}`} onClick={() => handleTabClick('Movies')}>Movies</li>
          <li className={`nav-item ${activeTab === 'New & Popular' ? 'active' : ''}`} onClick={() => handleTabClick('New & Popular')}>New & Popular</li>
          <li className={`nav-item ${activeTab === 'My List' ? 'active' : ''}`} onClick={() => handleTabClick('My List')}>My List</li>
        </ul>
      </div>

      <div className="navbar-right">
        {/* Animated Search Bar */}
        <div className={`search-container ${isSearchActive ? 'active' : ''}`}>
          <button className="search-icon-btn" onClick={handleSearchToggle}>
            <Search size={20} />
          </button>
          <input 
            ref={searchInputRef}
            type="text" 
            placeholder="Titles, people, genres..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <span className="nav-item" style={{ cursor: 'default' }}>{currentProfileName}</span>

        {/* Bell notifications */}
        <button className="nav-icon">
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </button>

        {/* Dynamic User Profile Dropdown */}
        <div className="profile-dropdown">
          <button className="profile-trigger">
            <img 
              src={currentProfileAvatar} 
              alt={`${currentProfileName} avatar`} 
              className="avatar-img"
              style={{ borderRadius: '50%' }} /* Circled active profile avatar in navbar header! */
            />
            <ChevronDown size={16} />
          </button>
          <div className="profile-dropdown-menu">
            {/* List other profiles to switch */}
            {otherProfiles.map((prof) => (
              <div 
                key={prof.name}
                className="dropdown-item profile-switch-item" 
                onClick={() => handleSwitchProfile(prof)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}
              >
                <img 
                  src={prof.avatar} 
                  alt={prof.name} 
                  style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }} 
                />
                <span>{prof.name}</span>
              </div>
            ))}

            {otherProfiles.length > 0 && <div className="dropdown-divider"></div>}

            <div className="dropdown-item" onClick={() => {
              // Trigger profile selection screen
              localStorage.removeItem('netflix_selected_profile');
              localStorage.removeItem('netflix_selected_avatar');
              localStorage.removeItem('netflix_selected_profile_id');
              window.location.reload();
            }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={16} />
              <span>Switch Profiles</span>
            </div>
            <div 
              className="dropdown-item" 
              onClick={() => navigate('/account')} 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            >
              <Settings size={16} />
              <span>Account</span>
            </div>
            <div className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle size={16} />
              <span>Help Center</span>
            </div>
            <div className="dropdown-divider"></div>
            <div 
              className="dropdown-item" 
              onClick={onLogout} 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff4d4d' }}
            >
              <LogOut size={16} />
              <span>Sign out of QStream</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
