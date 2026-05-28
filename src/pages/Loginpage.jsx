import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { api } from '../services/api.js';
import netflixLogo from '../assets/netflix-logo.svg';
import './Loginpage.css';

function Loginpage({ onLogin }) {
  const [isSignInMode, setIsSignInMode] = useState(true);
  
  // Input fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // Validation States
  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // ReCAPTCHA disclaimer expansion state
  const [showCaptchaDetails, setShowCaptchaDetails] = useState(false);

  const validateFullName = (val) => {
    if (!val) {
      return 'Please enter your first and last name.';
    }
    if (val.trim().length < 2) {
      return 'Name must contain at least 2 characters.';
    }
    return '';
  };

  const validateEmail = (val) => {
    if (!val) {
      return 'Please enter a valid email or phone number.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{8,15}$/;
    
    if (!emailRegex.test(val) && !phoneRegex.test(val)) {
      return 'Please enter a valid email address or phone number.';
    }
    return '';
  };

  const validatePassword = (val) => {
    if (!val) {
      return 'Your password must contain between 4 and 60 characters.';
    }
    if (val.length < 4 || val.length > 60) {
      return 'Your password must contain between 4 and 60 characters.';
    }
    return '';
  };

  const validateConfirmPassword = (val, pass) => {
    if (!val) {
      return 'Please confirm your password.';
    }
    if (val !== pass) {
      return 'Passwords do not match.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset errors
    setFullNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    
    let hasError = false;
    
    if (!isSignInMode) {
      const fnErr = validateFullName(fullName);
      if (fnErr) {
        setFullNameError(fnErr);
        hasError = true;
      }
    }
    
    const eErr = validateEmail(email);
    if (eErr) {
      setEmailError(eErr);
      hasError = true;
    }
    
    const pErr = validatePassword(password);
    if (pErr) {
      setPasswordError(pErr);
      hasError = true;
    }
    
    if (!isSignInMode) {
      const cpErr = validateConfirmPassword(confirmPassword, password);
      if (cpErr) {
        setConfirmPasswordError(cpErr);
        hasError = true;
      }
    }
    
    if (hasError) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (isSignInMode) {
        const res = await api.login(email, password);
        setIsSubmitting(false);
        onLogin(res.user);
      } else {
        const res = await api.register(fullName, email, password);
        setIsSubmitting(false);
        onLogin(res.user);
      }
    } catch (error) {
      setIsSubmitting(false);
      if (isSignInMode) {
        setPasswordError(error.message || 'Incorrect email or password.');
      } else {
        setEmailError(error.message || 'Registration failed. Email might already exist.');
      }
    }
  };

  const toggleMode = (e) => {
    e.preventDefault();
    setIsSignInMode(!isSignInMode);
    
    // Clear inputs and error flags
    setFullName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    
    setFullNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
  };

  return (
    <div className="login-container">
      {/* Top Left Header with Premium 100% Transparent SVG Logo */}
      <header className="login-header">
        <img className="login-logo" src={netflixLogo} alt="QStream" />
      </header>

      {/* Main Glassmorphic Card */}
      <div className="login-card-wrapper">
        <div className="login-card">
          <h2>{isSignInMode ? 'Sign In' : 'Sign Up'}</h2>
          
          <form className="login-form" onSubmit={handleSubmit}>
            
            {/* Full Name field (Only in Sign Up Mode) */}
            {!isSignInMode && (
              <>
                <div className="input-group">
                  <input 
                    type="text" 
                    id="fullName"
                    placeholder=" "
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (fullNameError) setFullNameError('');
                    }}
                    disabled={isSubmitting}
                  />
                  <label htmlFor="fullName">Full Name</label>
                </div>
                {fullNameError && <div className="login-error" style={{ background: 'none', color: '#e87c03', padding: '0 4px', fontSize: '13px', marginTop: '-8px' }}>{fullNameError}</div>}
              </>
            )}

            {/* Email / Phone Input Field */}
            <div className="input-group">
              <input 
                type="text" 
                id="email"
                placeholder=" "
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                }}
                disabled={isSubmitting}
              />
              <label htmlFor="email">Email or phone number</label>
            </div>
            {emailError && <div className="login-error" style={{ background: 'none', color: '#e87c03', padding: '0 4px', fontSize: '13px', marginTop: '-8px' }}>{emailError}</div>}
            
            {/* Password Input Field with Toggle Visibility */}
            <div className="input-group">
              <input 
                type={showPassword ? "text" : "password"} 
                id="password"
                placeholder=" "
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError('');
                }}
                disabled={isSubmitting}
              />
              <label htmlFor="password">Password</label>
              {password.length > 0 && (
                <button 
                  type="button" 
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              )}
            </div>
            {passwordError && <div className="login-error" style={{ background: 'none', color: '#e87c03', padding: '0 4px', fontSize: '13px', marginTop: '-8px' }}>{passwordError}</div>}
            
            {/* Confirm Password field (Only in Sign Up Mode) */}
            {!isSignInMode && (
              <>
                <div className="input-group">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    id="confirmPassword"
                    placeholder=" "
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (confirmPasswordError) setConfirmPasswordError('');
                    }}
                    disabled={isSubmitting}
                  />
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  {confirmPassword.length > 0 && (
                    <button 
                      type="button" 
                      className="password-toggle-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  )}
                </div>
                {confirmPasswordError && <div className="login-error" style={{ background: 'none', color: '#e87c03', padding: '0 4px', fontSize: '13px', marginTop: '-8px' }}>{confirmPasswordError}</div>}
              </>
            )}

            {/* Submit Action Button */}
            <button 
              type="submit" 
              className="btn-netflix submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? (isSignInMode ? 'Signing In...' : 'Creating Account...') 
                : (isSignInMode ? 'Sign In' : 'Sign Up')
              }
            </button>
            
            {/* Form Auxiliary Controls */}
            <div className="login-options">
              <label className="remember-me">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <a href="#" className="help-link">Need help?</a>
            </div>
          </form>
          
          {/* Card Footer Elements */}
          <div className="login-footer-info">
            <div>
              <span style={{ color: '#808080' }}>
                {isSignInMode ? 'New to QStream? ' : 'Already have an account? '}
              </span>
              <a href="#" className="signup-link" onClick={toggleMode}>
                {isSignInMode ? 'Sign up now' : 'Sign in now'}
              </a>.
            </div>
            
            <p className="recaptcha-text">
              This page is protected by Google reCAPTCHA to ensure you're not a bot.
              {!showCaptchaDetails ? (
                <button 
                  type="button"
                  className="learn-more-btn" 
                  onClick={() => setShowCaptchaDetails(true)}
                >
                  Learn more.
                </button>
              ) : (
                <span style={{ display: 'block', marginTop: '8px', color: '#808080', fontSize: '12px', animation: 'slideDown 0.3s ease' }}>
                  The information collected by Google reCAPTCHA is subject to the Google <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#0071eb', textDecoration: 'underline' }}>Privacy Policy</a> and <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" style={{ color: '#0071eb', textDecoration: 'underline' }}>Terms of Service</a>, and is used for providing, maintaining, and improving the reCAPTCHA service and for general security purposes (it is not used for personalized advertising by Google).
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Loginpage;
