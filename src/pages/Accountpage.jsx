import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, CreditCard, Key, ShieldAlert, Trash2, Edit2, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { api } from '../services/api.js';
import netflixLogo from '../assets/netflix-logo.svg';
import './Accountpage.css';

function Accountpage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form Edit States
  const [showNameModal, setShowNameModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Inputs
  const [fullNameInput, setFullNameInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  
  // Feedback
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active Profile Info (for visual display at the top right)
  const activeAvatar = localStorage.getItem('netflix_selected_avatar') || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80';
  const activeProfileName = localStorage.getItem('netflix_selected_profile') || 'Astro';

  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        setLoading(true);
        const meData = await api.getMe();
        setUser(meData.user);
        setFullNameInput(meData.user.fullName || '');

        const profilesData = await api.getProfiles();
        setProfiles(profilesData);
      } catch (err) {
        console.error('Failed to load account details:', err);
        navigate('/'); // redirect to login if auth check fails
      } finally {
        setLoading(false);
      }
    };
    fetchAccountData();
  }, [navigate]);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!fullNameInput.trim()) return;

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await api.updateProfileMetadata(fullNameInput.trim());
      setUser(prev => ({ ...prev, fullName: res.user.fullName }));
      setSuccessMsg('Account name updated successfully!');
      setTimeout(() => {
        setShowNameModal(false);
        setSuccessMsg('');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update name.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentPasswordInput) {
      setErrorMsg('Please enter your current password.');
      return;
    }
    if (newPasswordInput.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.updatePassword(currentPasswordInput, newPasswordInput);
      setSuccessMsg('Password updated successfully!');
      setCurrentPasswordInput('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
      setTimeout(() => {
        setShowPasswordModal(false);
        setSuccessMsg('');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirm1 = window.confirm('WARNING: Are you absolutely sure you want to permanently delete your account? This action CANNOT be undone.');
    if (!confirm1) return;

    const confirm2 = window.prompt('To confirm deletion, please type "DELETE MY ACCOUNT" below:');
    if (confirm2 !== 'DELETE MY ACCOUNT') {
      alert('Account deletion cancelled.');
      return;
    }

    try {
      setLoading(true);
      await api.deleteAccount();
      alert('Your account has been permanently deleted.');
      navigate('/');
      window.location.reload();
    } catch (err) {
      alert(err.message || 'Failed to delete account.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="account-loading-container">
        <div className="loading-spinner"></div>
        <h2>Loading account settings...</h2>
      </div>
    );
  }

  return (
    <div className="account-page-container">
      {/* Top Header */}
      <header className="account-navbar">
        <div className="navbar-left">
          <Link to="/browse">
            <img className="account-logo" src={netflixLogo} alt="QStream" />
          </Link>
        </div>
        <div className="navbar-right">
          <Link to="/browse" className="back-to-browse-btn">
            <ArrowLeft size={16} />
            <span>Back to Browse</span>
          </Link>
          <div className="active-profile-display">
            <img src={activeAvatar} alt={activeProfileName} className="active-profile-img" />
            <span className="active-profile-text">{activeProfileName}</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="account-content">
        <h1 className="account-title">Account Settings</h1>
        
        {/* Core Layout Panels */}
        <div className="account-panel-stack">
          
          {/* Panel 1: Membership & Login Security */}
          <section className="account-section-panel">
            <div className="panel-header">
              <User className="panel-icon" size={22} />
              <h2>Membership & Security</h2>
            </div>
            
            <div className="panel-body">
              <div className="info-row">
                <div className="info-label">Email Address</div>
                <div className="info-value email-value">{user?.email}</div>
              </div>
              
              <div className="info-row">
                <div className="info-label">Full Name</div>
                <div className="info-value">
                  {user?.fullName || 'Not set'}
                  <button className="edit-value-btn" onClick={() => {
                    setErrorMsg('');
                    setShowNameModal(true);
                  }}>
                    <Edit2 size={14} />
                    <span>Change Name</span>
                  </button>
                </div>
              </div>

              <div className="info-row">
                <div className="info-label">Password</div>
                <div className="info-value">
                  ••••••••••••
                  <button className="edit-value-btn" onClick={() => {
                    setErrorMsg('');
                    setShowPasswordModal(true);
                  }}>
                    <Key size={14} />
                    <span>Update Password</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Panel 2: Plan & Billing Details */}
          <section className="account-section-panel">
            <div className="panel-header">
              <CreditCard className="panel-icon" size={22} />
              <h2>Plan Details</h2>
            </div>
            
            <div className="panel-body">
              <div className="info-row">
                <div className="info-label">Streaming Plan</div>
                <div className="info-value plan-value">
                  Premium Ultra HD (4K + HDR)
                  <span className="plan-badge">Active</span>
                </div>
              </div>
              <div className="info-row">
                <div className="info-label">Billing Date</div>
                <div className="info-value next-billing">Renews automatically via Supabase Auth</div>
              </div>
            </div>
          </section>

          {/* Panel 3: Active Profiles */}
          <section className="account-section-panel">
            <div className="panel-header">
              <User className="panel-icon" size={22} />
              <h2>Active Profiles</h2>
            </div>
            
            <div className="panel-body profiles-panel-body">
              <p className="profiles-sub">Manage configuration and personalization across your account profiles.</p>
              <div className="profiles-grid">
                {profiles.map(p => (
                  <div key={p.id} className="profile-mini-card" style={{ '--accent-glow': p.color }}>
                    <div className="profile-mini-avatar-wrapper">
                      <img src={p.avatar} alt={p.name} />
                    </div>
                    <span className="profile-mini-name">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Panel 4: Danger Zone */}
          <section className="account-section-panel danger-zone-panel">
            <div className="panel-header danger-header">
              <ShieldAlert className="panel-icon" size={22} />
              <h2>Danger Zone</h2>
            </div>
            
            <div className="panel-body danger-body">
              <div className="danger-flex">
                <div className="danger-desc">
                  <h3>Delete Account Permanently</h3>
                  <p>Once you delete your account, there is no going back. All of your profiles, personalized settings, watchlists, and account credentials will be permanently purged.</p>
                </div>
                <button className="delete-account-btn" onClick={handleDeleteAccount}>
                  <Trash2 size={16} />
                  <span>Delete Account</span>
                </button>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* --- Change Name Modal --- */}
      {showNameModal && (
        <div className="account-modal-overlay" onClick={() => setShowNameModal(false)}>
          <div className="account-modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-card-header">
              <h2>Change Account Name</h2>
            </div>
            <form onSubmit={handleUpdateName}>
              <div className="modal-card-body">
                {errorMsg && <div className="modal-alert-error">{errorMsg}</div>}
                {successMsg && <div className="modal-alert-success"><CheckCircle size={16} /> {successMsg}</div>}
                
                <div className="modal-input-group">
                  <label htmlFor="name-input">Full Name</label>
                  <input 
                    type="text" 
                    id="name-input"
                    value={fullNameInput}
                    onChange={e => setFullNameInput(e.target.value)}
                    placeholder="Enter your first and last name"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="modal-card-footer">
                <button type="submit" className="btn-modal-save" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Name'}
                </button>
                <button type="button" className="btn-modal-cancel" onClick={() => setShowNameModal(false)} disabled={isSubmitting}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Change Password Modal --- */}
      {showPasswordModal && (
        <div className="account-modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="account-modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-card-header">
              <h2>Update Account Password</h2>
            </div>
            <form onSubmit={handleUpdatePassword}>
              <div className="modal-card-body">
                {errorMsg && <div className="modal-alert-error">{errorMsg}</div>}
                {successMsg && <div className="modal-alert-success"><CheckCircle size={16} /> {successMsg}</div>}
                
                <div className="modal-input-group relative-input">
                  <label htmlFor="current-password-input">Current Password</label>
                  <input 
                    type={showCurrentPassword ? "text" : "password"} 
                    id="current-password-input"
                    value={currentPasswordInput}
                    onChange={e => setCurrentPasswordInput(e.target.value)}
                    placeholder="Enter current password"
                    required
                    disabled={isSubmitting}
                  />
                  <button 
                    type="button" 
                    className="modal-pw-toggle"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="modal-input-group relative-input">
                  <label htmlFor="password-input">New Password</label>
                  <input 
                    type={showNewPassword ? "text" : "password"} 
                    id="password-input"
                    value={newPasswordInput}
                    onChange={e => setNewPasswordInput(e.target.value)}
                    placeholder="Minimum 6 characters"
                    required
                    disabled={isSubmitting}
                  />
                  <button 
                    type="button" 
                    className="modal-pw-toggle"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="modal-input-group">
                  <label htmlFor="confirm-password-input">Confirm New Password</label>
                  <input 
                    type={showNewPassword ? "text" : "password"} 
                    id="confirm-password-input"
                    value={confirmPasswordInput}
                    onChange={e => setConfirmPasswordInput(e.target.value)}
                    placeholder="Re-enter password"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="modal-card-footer">
                <button type="submit" className="btn-modal-save" disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update Password'}
                </button>
                <button type="button" className="btn-modal-cancel" onClick={() => setShowPasswordModal(false)} disabled={isSubmitting}>
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

export default Accountpage;
