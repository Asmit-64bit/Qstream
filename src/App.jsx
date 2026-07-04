import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Loginpage from './pages/Loginpage.jsx';
import Homepage from './pages/Homepage.jsx';
import Profilepage from './pages/Profilepage.jsx';
import Accountpage from './pages/Accountpage.jsx';
import { api } from './services/api.js';

// Breathtaking 3D scale brand intro animation
const TudumLoader = () => {
  useEffect(() => {
    // Play synthesis chime when tudum loader mounts
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx) {
        // Hit 1: Low deep rumble
        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(75, audioCtx.currentTime); // D2
        gain1.gain.setValueAtTime(0, audioCtx.currentTime);
        gain1.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05);
        gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.2);
        osc1.start();
        osc1.stop(audioCtx.currentTime + 1.3);

        // Hit 2: Signature higher chime overtone
        setTimeout(() => {
          const osc2 = audioCtx.createOscillator();
          const gain2 = audioCtx.createGain();
          osc2.connect(gain2);
          gain2.connect(audioCtx.destination);
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(115, audioCtx.currentTime); // D3
          gain2.gain.setValueAtTime(0, audioCtx.currentTime);
          gain2.gain.linearRampToValueAtTime(0.6, audioCtx.currentTime + 0.05);
          gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.4);
          osc2.start();
          osc2.stop(audioCtx.currentTime + 1.55);
        }, 80);
      }
    } catch {
      console.log('AudioContext blocked or unsupportive');
    }
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 99999,
      overflow: 'hidden'
    }}>
      <svg 
        width="260" 
        height="260" 
        viewBox="0 0 240 240" 
        style={{
          animation: 'tudumZoom 2.2s cubic-bezier(0.25, 1, 0.5, 1) forwards',
          filter: 'drop-shadow(0 0 35px rgba(229, 9, 20, 0.7))'
        }}
      >
        {/* Glowing Central Nucleus */}
        <circle cx="120" cy="120" r="14" fill="#e50914" />
        <circle cx="120" cy="120" r="6" fill="#ffffff" />
        
        {/* Animated Quantum Orbits & Electrons */}
        <g transform="translate(120, 120)">
          {/* Orbit 1 (Tilted at 30 deg) */}
          <g transform="rotate(30)">
            <ellipse cx="0" cy="0" rx="96" ry="26" stroke="#e50914" strokeWidth="4.5" fill="none" opacity="0.85" />
            <circle cx="0" cy="0" r="6" fill="#ffffff">
              <animateMotion dur="2s" repeatCount="indefinite" path="M -96 0 A 96 26 0 1 1 96 0 A 96 26 0 1 1 -96 0" />
            </circle>
          </g>

          {/* Orbit 2 (Tilted at 90 deg) */}
          <g transform="rotate(90)">
            <ellipse cx="0" cy="0" rx="96" ry="26" stroke="#e50914" strokeWidth="4.5" fill="none" opacity="0.85" />
            <circle cx="0" cy="0" r="6" fill="#ffffff">
              <animateMotion dur="2.8s" repeatCount="indefinite" path="M -96 0 A 96 26 0 1 1 96 0 A 96 26 0 1 1 -96 0" />
            </circle>
          </g>

          {/* Orbit 3 (Tilted at 150 deg) */}
          <g transform="rotate(150)">
            <ellipse cx="0" cy="0" rx="96" ry="26" stroke="#e50914" strokeWidth="4.5" fill="none" opacity="0.85" />
            <circle cx="0" cy="0" r="6" fill="#ffffff">
              <animateMotion dur="2.4s" repeatCount="indefinite" path="M -96 0 A 96 26 0 1 1 96 0 A 96 26 0 1 1 -96 0" />
            </circle>
          </g>
        </g>
      </svg>
      
      <style>{`
        @keyframes tudumZoom {
          0% { transform: scale(0.1); opacity: 0; filter: blur(10px); }
          15% { transform: scale(1.0); opacity: 1; filter: blur(0); }
          80% { transform: scale(1.04); opacity: 1; filter: blur(0); }
          100% { transform: scale(7.5); opacity: 0; filter: blur(15px); }
        }
      `}</style>
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('netflix_token') !== null;
  });

  const [isTudumPlaying, setIsTudumPlaying] = useState(false);

  const [selectedProfile, setSelectedProfile] = useState(() => {
    return localStorage.getItem('netflix_selected_profile') || null;
  });

  const login = () => {
    setIsAuthenticated(true);
    setSelectedProfile(null);
    localStorage.removeItem('netflix_selected_profile');
    localStorage.removeItem('netflix_selected_avatar');
    localStorage.removeItem('netflix_selected_profile_id');
    // Start brand loading cinematic
    setIsTudumPlaying(true);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setIsAuthenticated(false);
    setSelectedProfile(null);
    localStorage.removeItem('netflix_token');
    localStorage.removeItem('netflix_selected_profile');
    localStorage.removeItem('netflix_selected_avatar');
    localStorage.removeItem('netflix_selected_profile_id');
  };

  // Verify token validation on mount to handle expired session
  useEffect(() => {
    const verifySession = async () => {
      if (isAuthenticated) {
        try {
          await api.getMe();
        } catch (error) {
          console.error('Session validation failed. Logging out...', error);
          logout();
        }
      }
    };
    verifySession();
  }, [isAuthenticated]);

  const handleProfileSelect = (name, avatar) => {
    // Hold profile switcher for a split second to sync transitions
    setTimeout(() => {
      setSelectedProfile(name);
      localStorage.setItem('netflix_selected_profile', name);
      localStorage.setItem('netflix_selected_avatar', avatar);
    }, 450);
  };

  // Close tudum loader after 2.2 seconds
  useEffect(() => {
    if (isTudumPlaying) {
      const timer = setTimeout(() => {
        setIsTudumPlaying(false);
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [isTudumPlaying]);

  return (
    <Router>
      {/* Cinematic Tudum Brand Intro Chime */}
      {isTudumPlaying && <TudumLoader />}

      <Routes>
        {/* Gateway Auth Page */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              <Navigate to="/browse" replace />
            ) : (
              <Loginpage onLogin={login} />
            )
          } 
        />
        
        {/* Immersive Browse Page */}
        <Route 
          path="/browse" 
          element={
            isAuthenticated ? (
              !selectedProfile ? (
                <Profilepage onSelectProfile={handleProfileSelect} />
              ) : (
                <Homepage onLogout={logout} />
              )
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        
        {/* Account Management Page */}
        <Route 
          path="/account" 
          element={
            isAuthenticated ? (
              <Accountpage />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        
        {/* Fallback catches */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
