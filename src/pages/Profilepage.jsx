import { useState, useEffect } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import { api } from '../services/api.js';
import './Profilepage.css';

const DEFAULT_AVATARS = [
  { id: 'av1', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80' },
  { id: 'av2', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80' },
  { id: 'av3', url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=150&h=150&q=80' },
  { id: 'av4', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150&q=80' },
  { id: 'av5', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80' },
  { id: 'av6', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80' }
];

const ACCENT_COLORS = [
  { name: 'Red', hex: '#e50914' },
  { name: 'Blue', hex: '#0071eb' },
  { name: 'Orange', hex: '#e87c03' },
  { name: 'Green', hex: '#2de56d' },
  { name: 'Purple', hex: '#bd00eb' },
  { name: 'Pink', hex: '#eb008b' }
];

function Profilepage({ onSelectProfile }) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states for creating a new profile
  const [newName, setNewName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(DEFAULT_AVATARS[0].url);
  const [selectedColor, setSelectedColor] = useState(ACCENT_COLORS[0].hex);

  // Fetch profiles from backend API
  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const data = await api.getProfiles();
      setProfiles(data);
      localStorage.setItem('netflix_profiles', JSON.stringify(data));
    } catch (e) {
      console.error('Failed to load profiles from database:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleProfileClick = (profile) => {
    if (isEditing) return; // In edit mode, click shouldn't trigger entry

    // Save profile id to locate watchlists
    localStorage.setItem('netflix_selected_profile_id', profile.id);

    // Synthesize the classic warm Tudum sound chime!
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext) {
        // First low bass note
        const osc1 = audioContext.createOscillator();
        const gain1 = audioContext.createGain();
        osc1.connect(gain1);
        gain1.connect(audioContext.destination);
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(80, audioContext.currentTime); // D2
        gain1.gain.setValueAtTime(0, audioContext.currentTime);
        gain1.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.05);
        gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
        osc1.start();
        osc1.stop(audioContext.currentTime + 0.85);

        // Second overlay higher note (Tudum signature double hit)
        setTimeout(() => {
          const osc2 = audioContext.createOscillator();
          const gain2 = audioContext.createGain();
          osc2.connect(gain2);
          gain2.connect(audioContext.destination);
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(120, audioContext.currentTime); // D3
          gain2.gain.setValueAtTime(0, audioContext.currentTime);
          gain2.gain.linearRampToValueAtTime(0.6, audioContext.currentTime + 0.05);
          gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.9);
          osc2.start();
          osc2.stop(audioContext.currentTime + 0.95);
        }, 90);
      }
    } catch {
      console.log('AudioContext synthesis blocked or unsupported');
    }

    onSelectProfile(profile.name, profile.avatar);
  };

  const handleAddProfileSubmit = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      const created = await api.createProfile(newName.trim(), selectedAvatar, selectedColor);
      setProfiles(prev => {
        const next = [...prev, created];
        localStorage.setItem('netflix_profiles', JSON.stringify(next));
        return next;
      });
      
      // Reset Form & Close Modal
      setNewName('');
      setSelectedAvatar(DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)].url);
      setSelectedColor(ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)].hex);
      setShowAddModal(false);
    } catch (error) {
      alert(error.message || 'Failed to create profile');
    }
  };

  const handleDeleteProfile = async (e, profileId, nameToDelete) => {
    e.stopPropagation(); // Avoid triggering profile click entry
    
    if (profiles.length <= 1) {
      alert("You must keep at least one profile!");
      return;
    }

    if (window.confirm(`Are you sure you want to delete profile "${nameToDelete}"?`)) {
      try {
        await api.deleteProfile(profileId);
        setProfiles(prev => {
          const next = prev.filter(p => p.id !== profileId);
          localStorage.setItem('netflix_profiles', JSON.stringify(next));
          return next;
        });
      } catch (error) {
        alert(error.message || 'Failed to delete profile');
      }
    }
  };

  if (loading) {
    return (
      <div className="profiles-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h2 style={{ color: '#fff', fontSize: '24px', fontWeight: '500' }}>Loading Profiles...</h2>
      </div>
    );
  }

  return (
    <div className="profiles-container">
      <div className="profiles-wrapper">
        <h1 className="profiles-title">
          {isEditing ? 'Manage Profiles' : "Who's watching?"}
        </h1>
        
        <div className="profiles-list">
          {profiles.map((profile) => (
            <div 
              key={profile.id} 
              className={`profile-card ${isEditing ? 'edit-mode' : ''}`}
              onClick={() => handleProfileClick(profile)}
            >
              <div 
                className="avatar-wrapper" 
                style={{ 
                  '--accent-glow': profile.color,
                  borderColor: isEditing ? 'var(--netflix-medium-grey)' : 'transparent' 
                }}
              >
                <img src={profile.avatar} alt={profile.name} className="profile-avatar-img" />
                
                {/* Delete button overlay during edit mode */}
                {isEditing && (
                  <div 
                    className="avatar-delete-overlay"
                    onClick={(e) => handleDeleteProfile(e, profile.id, profile.name)}
                    title={`Delete ${profile.name}`}
                  >
                    <Trash2 size={24} color="#fff" />
                  </div>
                )}
              </div>
              <span className="profile-name">{profile.name}</span>
            </div>
          ))}
          
          {/* Add Profile Slot */}
          {!isEditing && profiles.length < 5 && (
            <div className="profile-card add-profile-slot" onClick={() => setShowAddModal(true)}>
              <div className="avatar-wrapper add-avatar">
                <Plus size={40} />
              </div>
              <span className="profile-name">Add Profile</span>
            </div>
          )}
        </div>

        <button 
          className={`manage-profiles-btn ${isEditing ? 'done' : ''}`}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Done' : 'Manage Profiles'}
        </button>
      </div>

      {/* --- Sleek Modern Glassmorphic Profile Creation Modal --- */}
      {showAddModal && (
        <div className="profile-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <h2>Add Profile</h2>
              <button className="profile-modal-close" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddProfileSubmit} className="profile-modal-form">
              <div className="profile-form-body">
                {/* Visual Preview Left */}
                <div className="profile-form-preview">
                  <div 
                    className="avatar-preview-circle"
                    style={{ border: `4px solid ${selectedColor}`, boxShadow: `0 0 25px ${selectedColor}44` }}
                  >
                    <img src={selectedAvatar} alt="Preview Avatar" />
                  </div>
                  <span className="preview-label">Live Preview</span>
                </div>

                {/* Input Controls Right */}
                <div className="profile-form-inputs">
                  <div className="profile-input-group">
                    <label>Profile Name</label>
                    <input 
                      type="text" 
                      maxLength="12"
                      placeholder="Enter profile name" 
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  {/* Curated Accent Colors selector */}
                  <div className="profile-selection-group">
                    <label>Glow Accent Color</label>
                    <div className="color-selection-row">
                      {ACCENT_COLORS.map((color) => (
                        <button
                          key={color.name}
                          type="button"
                          className={`accent-color-dot ${selectedColor === color.hex ? 'active' : ''}`}
                          style={{ backgroundColor: color.hex }}
                          onClick={() => setSelectedColor(color.hex)}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Curated Avatars Selector */}
                  <div className="profile-selection-group">
                    <label>Choose Avatar Icon</label>
                    <div className="avatar-selection-grid">
                      {DEFAULT_AVATARS.map((avatar) => (
                        <button
                          key={avatar.id}
                          type="button"
                          className={`avatar-picker-item ${selectedAvatar === avatar.url ? 'active' : ''}`}
                          onClick={() => setSelectedAvatar(avatar.url)}
                        >
                          <img src={avatar.url} alt="Option" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="profile-form-actions">
                <button type="submit" className="btn-netflix modal-save-btn">
                  Save Profile
                </button>
                <button 
                  type="button" 
                  className="btn-secondary modal-cancel-btn"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profilepage;
