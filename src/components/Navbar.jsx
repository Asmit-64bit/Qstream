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

  // Notifications State
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  const [notifications, setNotifications] = useState([
  ]);

  const unreadCount = useMemo(() => notifications.filter(n => n.isUnread).length, [notifications]);

  // Click outside to close notification dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isUnread: false })));
  };

  const handleNotificationItemClick = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isUnread: false } : n));
    setShowNotifications(false);
  };

  // Mobile Browse Menu state
  const [showBrowseMenu, setShowBrowseMenu] = useState(false);
  const browseRef = useRef(null);

  // Click outside to close mobile browse menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (browseRef.current && !browseRef.current.contains(e.target)) {
        setShowBrowseMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

        {/* Mobile Browse Dropdown */}
        <div className="mobile-browse-container" ref={browseRef}>
          <button className="mobile-browse-btn" onClick={() => setShowBrowseMenu(!showBrowseMenu)}>
            <span>Browse</span>
            <ChevronDown size={14} className={`browse-caret ${showBrowseMenu ? 'open' : ''}`} />
          </button>
          
          {showBrowseMenu && (
            <div className="mobile-browse-menu">
              <div className="mobile-browse-arrow"></div>
              <ul className="mobile-browse-links">
                <li className={`mobile-browse-item ${activeTab === 'Home' ? 'active' : ''}`} onClick={() => { handleTabClick('Home'); setShowBrowseMenu(false); }}>Home</li>
                <li className={`mobile-browse-item ${activeTab === 'TV Shows' ? 'active' : ''}`} onClick={() => { handleTabClick('TV Shows'); setShowBrowseMenu(false); }}>TV Shows</li>
                <li className={`mobile-browse-item ${activeTab === 'Movies' ? 'active' : ''}`} onClick={() => { handleTabClick('Movies'); setShowBrowseMenu(false); }}>Movies</li>
                <li className={`mobile-browse-item ${activeTab === 'New & Popular' ? 'active' : ''}`} onClick={() => { handleTabClick('New & Popular'); setShowBrowseMenu(false); }}>New & Popular</li>
                <li className={`mobile-browse-item ${activeTab === 'My List' ? 'active' : ''}`} onClick={() => { handleTabClick('My List'); setShowBrowseMenu(false); }}>My List</li>
              </ul>
            </div>
          )}
        </div>
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

        {/* Bell notifications with interactive dropdown */}
        <div 
          className="notification-container" 
          ref={notificationRef}
          onMouseEnter={() => setShowNotifications(true)}
          onMouseLeave={() => setShowNotifications(false)}
        >
          <button 
            className="notification-btn" 
            aria-label="View notifications"
            aria-haspopup="true"
            aria-expanded={showNotifications}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notifications-dropdown-wrapper">
              <div className="notifications-dropdown-menu">
                <div className="notifications-header">
                  <h3>Notifications</h3>
                  {unreadCount > 0 && (
                    <button className="mark-read-btn" onClick={handleMarkAllRead}>
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="notifications-list">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`notification-item ${notif.isUnread ? 'unread' : ''}`}
                        onClick={() => handleNotificationItemClick(notif.id)}
                      >
                        <img src={notif.image} alt="" className="notification-item-img" />
                        <div className="notification-item-content">
                          <span className="notification-item-title">{notif.title}</span>
                          <span className="notification-item-desc">{notif.message}</span>
                          <span className="notification-item-time">{notif.time}</span>
                        </div>
                        {notif.isUnread && <span className="notification-unread-dot" />}
                      </div>
                    ))
                  ) : (
                    <div className="no-notifications">
                      No new notifications
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

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
            <div 
              className="dropdown-item" 
              onClick={() => {
                if (window.location.pathname !== '/browse') {
                  navigate('/browse');
                }
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent('open-help-center'));
                }, 150);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            >
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
