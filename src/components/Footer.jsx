import { useState, useEffect, useRef } from 'react';
import { X, Copy, Check } from 'lucide-react';

const footerLinks = [
  'Help Center',
  'Media Center',
  'Terms of Use',
  'Privacy',
  'Legal Notices',
  'Cookie Preferences',
  'Contact Us',
  'Support'
];

const socialLinks = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/qstream',
    children: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3.6l.4-4h-4V7a1 1 0 0 1 1-1h3V2z" fill="currentColor" stroke="none" />,
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/qstream',
    children: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    label: 'Twitter',
    href: 'https://twitter.com/qstream',
    children: <path d="M22 5.8c-.7.3-1.5.5-2.3.6.8-.5 1.4-1.2 1.7-2.2-.8.5-1.6.8-2.5 1A4 4 0 0 0 12 8.8c0 .3 0 .6.1.9A11.3 11.3 0 0 1 3.9 5.5a4 4 0 0 0 1.2 5.3c-.6 0-1.2-.2-1.8-.5v.1a4 4 0 0 0 3.2 3.9c-.5.1-1 .2-1.8.1a4 4 0 0 0 3.7 2.8A8 8 0 0 1 2.5 19a11.3 11.3 0 0 0 17.4-9.5v-.5c.8-.8 1.5-1.8 2.1-3.2z" fill="currentColor" stroke="none" />,
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/qstream',
    children: (
      <>
        <path d="M22.5 7.1a3 3 0 0 0-2.1-2.1C18.5 4.5 12 4.5 12 4.5s-6.5 0-8.4.5a3 3 0 0 0-2.1 2.1A31 31 0 0 0 1 12a31 31 0 0 0 .5 4.9A3 3 0 0 0 3.6 19c1.9.5 8.4.5 8.4.5s6.5 0 8.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 23 12a31 31 0 0 0-.5-4.9z" fill="currentColor" stroke="none" />
        <path d="M10 15.5v-7l6 3.5-6 3.5z" fill="#0c0c0c" stroke="none" />
      </>
    ),
  },
];

function BrandIcon({ item }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {item.children}
    </svg>
  );
}

function Footer() {
  const [activeModal, setActiveModal] = useState(null);
  const [serviceCode, setServiceCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  
  // Cookie Preferences State
  const [cookies, setCookies] = useState({
    performance: false,
    marketing: false,
  });

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: 'General Support',
    message: '',
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  const modalRef = useRef(null);
  const chatEndRef = useRef(null);

  // Live Support Chat State
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am your Qstream Virtual Assistant. How can I help you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const closeModal = () => {
    setActiveModal(null);
    setActiveFaq(null);
    setChatMessages([
      {
        sender: 'bot',
        text: 'Hello! I am your Qstream Virtual Assistant. How can I help you today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setChatInput('');
    setIsTyping(false);
  };

  // Auto Scroll to bottom for Chat
  useEffect(() => {
    if (activeModal === 'Support' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isTyping, activeModal]);

  // Listen for global help center navigation events
  useEffect(() => {
    const handleOpenHelp = () => {
      setActiveModal('Help Center');
    };
    window.addEventListener('open-help-center', handleOpenHelp);
    return () => {
      window.removeEventListener('open-help-center', handleOpenHelp);
    };
  }, []);

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = {
      sender: 'user',
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMessage]);
    const query = chatInput.toLowerCase();
    setChatInput('');
    setIsTyping(true);

    // Bot Response Logic
    setTimeout(() => {
      let botText = "Thank you for reaching out! I've noted your question. If you need immediate assistance, feel free to contact us via the 'Contact Us' tab or email support.qstream@gmail.com.";

      if (query.includes('watchlist') || query.includes('list') || query.includes('add')) {
        botText = "To add movies/shows to your Watchlist, hover over any card on the homepage and click the '+' icon. You can view all saved items in the 'My List' tab at the top of the homepage!";
      } else if (query.includes('password') || query.includes('reset') || query.includes('change password')) {
        botText = "You can update your password on the Account Settings page (from your profile dropdown). Enter your current password and your new password to update it securely.";
      } else if (query.includes('delete') || query.includes('cancel') || query.includes('remove account')) {
        botText = "To permanently delete your account, go to the Account page, scroll down to the 'Danger Zone' and select 'Delete Account'. This will completely remove all your profiles, watchlist data, and login credentials.";
      } else if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
        botText = "Hello! How can I assist you with Qstream today? You can ask me about watchlists, account settings, passwords, or profiles!";
      } else if (query.includes('profile') || query.includes('avatar')) {
        botText = "Manage profiles from the dropdown or the Profile selection screen. You can add new profiles, change names, avatars, and interface theme colors.";
      }

      setChatMessages(prev => [...prev, {
        sender: 'bot',
        text: botText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsTyping(false);
    }, 1200);
  };

  // Load Saved Cookie Preferences
  useEffect(() => {
    const savedCookies = localStorage.getItem('qstream_cookie_preferences');
    if (savedCookies) {
      try {
        setCookies(JSON.parse(savedCookies));
      } catch (e) {
        console.error('Failed to parse cookie preferences:', e);
      }
    }
  }, []);

  // Escape key event listener to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    if (activeModal) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeModal]);

  const generateServiceCode = () => {
    const segment1 = Math.floor(100 + Math.random() * 900);
    const segment2 = Math.floor(100 + Math.random() * 900);
    const segment3 = Math.floor(100 + Math.random() * 900);
    setServiceCode(`${segment1}-${segment2}-${segment3}`);
    setIsCopied(false);
  };

  const copyServiceCode = () => {
    navigator.clipboard.writeText(serviceCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleLinkClick = (e, link) => {
    e.preventDefault();
    setActiveModal(link);
    if (link === 'Cookie Preferences') {
      // Refresh current states from localstorage just in case
      const savedCookies = localStorage.getItem('qstream_cookie_preferences');
      if (savedCookies) {
        try {
          setCookies(JSON.parse(savedCookies));
        } catch (err) {
          console.error(err);
        }
      }
    }
    setFormSuccess(false);
    setFormError('');
  };

  const handleServiceCodeClick = () => {
    generateServiceCode();
    setActiveModal('Service Code');
  };


  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      closeModal();
    }
  };

  // Cookie Save Handler
  const handleSaveCookies = () => {
    localStorage.setItem('qstream_cookie_preferences', JSON.stringify(cookies));
    alert('Your cookie preferences have been updated!');
    closeModal();
  };

  // Contact Form Submission
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name.trim()) {
      setFormError('Please enter your name.');
      return;
    }
    if (!contactForm.email.trim()) {
      setFormError('Please enter your email.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactForm.email)) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!contactForm.message.trim()) {
      setFormError('Please enter a message.');
      return;
    }

    try {
      setFormError('');
      
      const response = await fetch('https://formsubmit.co/ajax/support.qstream@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          Name: contactForm.name,
          Email: contactForm.email,
          Subject: contactForm.subject,
          Message: contactForm.message,
          _subject: `[Qstream Support] ${contactForm.subject}`
        })
      });

      const resData = await response.json();
      if (!response.ok || resData.success === 'false') {
        throw new Error(resData.message || 'Failed to send message.');
      }

      setFormSuccess(true);
      setContactForm({
        name: '',
        email: '',
        subject: 'General Support',
        message: '',
      });
    } catch (err) {
      console.error(err);
      setFormError('Something went wrong. Please check your network and try again.');
    }
  };

  const renderModalContent = () => {
    switch (activeModal) {
      case 'Service Code':
        return (
          <div className="service-code-container">
            <p style={{ margin: 0, color: '#a3a3a3', textAlign: 'center' }}>
              Provide this unique diagnostic code when contacting Qstream support.
            </p>
            <div className="service-code-display">
              {serviceCode}
            </div>
            <button
              onClick={copyServiceCode}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '6px',
                padding: '8px 16px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {isCopied ? (
                <>
                  <Check size={16} color="#22c55e" />
                  <span style={{ color: '#22c55e' }}>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        );

      case 'Help Center': {
        const faqs = [
          {
            q: "How can I access Qstream on multiple devices?",
            a: "Qstream supports concurrent streaming across web browsers and mobile clients. Simply log in with your account on any compatible device. Depending on your active profile, watchlist updates and video streaming will sync in real time."
          },
          {
            q: "How do I update my profile details?",
            a: "Go to your Profile select page or choose the Account Settings option from the Navbar dropdown. You can manage individual profile names, avatars, and interface accent colors directly from there."
          },
          {
            q: "Can I cancel or delete my account?",
            a: "Yes. From your Account page, navigate to the Danger Zone section. There, you can delete your account permanently. This will completely delete all personal profiles, auth records, and watchlist lists from our servers cascade-style."
          },
          {
            q: "How does the watchlist feature work?",
            a: "Simply hover or tap on any movie or TV series card on the homepage and click the '+' icon. This adds it directly to your profile's 'My List' section. The watchlist is synced securely in your Supabase profile database."
          }
        ];
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <button
                  className="faq-trigger"
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                >
                  <span>{faq.q}</span>
                  <span style={{ fontSize: '18px', color: activeFaq === index ? '#e50914' : '#808080' }}>
                    {activeFaq === index ? '−' : '+'}
                  </span>
                </button>
                {activeFaq === index && (
                  <div className="faq-content">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      }

      case 'Media Center':
        return (
          <div>
            <h4 style={{ color: '#fff', marginTop: 0, marginBottom: '12px' }}>Welcome to Qstream Media Center</h4>
            <p>Get the latest company announcements, press kits, branding logo assets, and official statements regarding Qstream entertainment.</p>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', marginTop: '16px' }}>
              <h5 style={{ color: '#e50914', margin: '0 0 8px 0' }}>Latest Press Releases</h5>
              <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <li><strong>July 2026:</strong> Qstream Migrates to Supabase Realtime Architecture.</li>
              </ul>
            </div>
          </div>
        );

      case 'Terms of Use':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p>Welcome to Qstream. By accessing our platform, services, and catalogs, you agree to comply with and be bound by the following Terms of Use.</p>
            <h5 style={{ color: '#fff', margin: '0' }}>1. Account Security</h5>
            <p style={{ margin: 0, color: '#a3a3a3' }}>You are solely responsible for keeping your password secure and checking profile credentials regularly. Sharing accounts with unauthorized users violates service guidelines.</p>
            <h5 style={{ color: '#fff', margin: '0' }}>2. Catalog Intellectual Property</h5>
            <p style={{ margin: 0, color: '#a3a3a3' }}>All video streams, backdrops, designs, and metadata rendered on Qstream are protected by international copyrights. Mirroring, downloading, or redistributing content is strictly prohibited.</p>
          </div>
        );

      case 'Privacy':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p>Your privacy is important to us. This Privacy Policy details the types of personal data we collect when you stream on Qstream and how we protect it.</p>
            <h5 style={{ color: '#fff', margin: '0' }}>1. Data Collection</h5>
            <p style={{ margin: 0, color: '#a3a3a3' }}>We collect metadata associated with your profiles, passwords, and watchlist selections to personalize recommendations and save watchlist syncing preferences.</p>
            <h5 style={{ color: '#fff', margin: '0' }}>2. Cookies & Analytics</h5>
            <p style={{ margin: 0, color: '#a3a3a3' }}>We use cookies to keep you signed in across multiple browsing sessions. You can configure non-essential cookies via our Cookie Preferences dashboard.</p>
            <h5 style={{ color: '#fff', margin: '0' }}>3. Third-party Sharing</h5>
            <p style={{ margin: 0, color: '#a3a3a3' }}>We never sell your personal information. Database storage is safely managed via Supabase servers utilizing high-grade SSL/TLS encryption.</p>
          </div>
        );

      case 'Legal Notices':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p>Qstream and its associated player nodes are registered trademarks. All rights reserved.</p>
            <div style={{ borderLeft: '3px solid #e50914', paddingLeft: '12px', background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: '4px' }}>
              <p style={{ margin: 0, fontSize: '13px' }}><strong>Patents & Licensing:</strong> Streaming engines utilize open-source technologies under the MIT and Apache 2.0 license protocols. Media catalog backdrops are powered by TMDB metadata under Creative Commons Licenses.</p>
            </div>
            <p>For official legal inquiries, corporate governance issues, or copyright complaints under the DMCA guidelines, please contact our compliance department via the support team.</p>
          </div>
        );

      case 'Cookie Preferences':
        return (
          <div className="cookie-options">
            <div className="cookie-option-card">
              <div className="cookie-details">
                <div className="cookie-title-row">
                  <h5 className="cookie-title">Essential Cookies</h5>
                  <span className="cookie-badge">Required</span>
                </div>
                <p className="cookie-desc">Necessary for the website to function. Keeps you authenticated and maintains your active profile selection.</p>
              </div>
              <label className="switch">
                <input type="checkbox" checked disabled />
                <span className="slider"></span>
              </label>
            </div>

            <div className="cookie-option-card">
              <div className="cookie-details">
                <div className="cookie-title-row">
                  <h5 className="cookie-title">Performance & Analytics</h5>
                </div>
                <p className="cookie-desc">Helps us monitor stream latency, playback health, and user navigation paths to resolve interface glitches.</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={cookies.performance}
                  onChange={(e) => setCookies({ ...cookies, performance: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="cookie-option-card">
              <div className="cookie-details">
                <div className="cookie-title-row">
                  <h5 className="cookie-title">Advertising & Marketing</h5>
                </div>
                <p className="cookie-desc">Used to customize ambient promotions and recommend movies based on viewing trends.</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={cookies.marketing}
                  onChange={(e) => setCookies({ ...cookies, marketing: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>

            <button className="cookie-save-btn" onClick={handleSaveCookies}>
              Save Preferences
            </button>
          </div>
        );

      case 'Contact Us':
        if (formSuccess) {
          return (
            <div className="contact-success">
              <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '16px', borderRadius: '50%', color: '#22c55e' }}>
                <Check size={32} />
              </div>
              <h3>Message Sent Successfully</h3>
              <p>Thank you for reaching out! A support ticket has been registered. Our staff will respond within 24 hours.</p>
              <button
                className="contact-submit"
                onClick={() => setFormSuccess(false)}
                style={{ width: 'auto', padding: '10px 24px', fontSize: '13.5px' }}
              >
                Send Another Message
              </button>
            </div>
          );
        }
        return (
          <form className="contact-form" onSubmit={handleContactSubmit}>
            {formError && (
              <div style={{ backgroundColor: 'rgba(229, 9, 20, 0.1)', border: '1px solid rgba(229, 9, 20, 0.3)', padding: '12px', borderRadius: '6px', color: '#ff6b6b', fontSize: '13.5px' }}>
                {formError}
              </div>
            )}
            <div className="contact-group">
              <label className="contact-label">Name</label>
              <input
                type="text"
                className="contact-input"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                placeholder="your username"
              />
            </div>
            <div className="contact-group">
              <label className="contact-label">Email</label>
              <input
                type="email"
                className="contact-input"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                placeholder="your email"
              />
            </div>
            <div className="contact-group">
              <label className="contact-label">Subject</label>
              <select
                className="contact-select"
                value={contactForm.subject}
                onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
              >
                <option value="General Support">General Support</option>
                <option value="Stream Playback Issues">Stream Playback Issues</option>
                <option value="Bug Reporting">Bug Reporting</option>
              </select>
            </div>
            <div className="contact-group">
              <label className="contact-label">Message</label>
              <textarea
                className="contact-textarea"
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                placeholder="How can we help you today?"
              />
            </div>
            <button type="submit" className="contact-submit">
              Submit Request
            </button>
          </form>
        );

      case 'Support':
        return (
          <div className="chat-container">
            <div className="chat-messages">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`chat-bubble-wrapper ${msg.sender}`}>
                  <div className="chat-bubble">
                    {msg.text}
                  </div>
                  <span className="chat-time">{msg.timestamp}</span>
                </div>
              ))}
              {isTyping && (
                <div className="chat-typing">
                  <span>Qstream Assistant is typing</span>
                  <div className="chat-typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <form className="chat-input-bar" onSubmit={handleSendChatMessage}>
              <input
                type="text"
                className="chat-input-field"
                placeholder="Ask me a question..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={isTyping}
              />
              <button type="submit" className="chat-send-btn" disabled={isTyping || !chatInput.trim()}>
                Send
              </button>
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <footer className="footer-container">
        <div className="footer-socials" aria-label="Netflix social links">
          {socialLinks.map((item) => (
            <a
              key={item.label}
              className="social-icon-link"
              href={item.href}
              target="_blank"
              rel="noreferrer"
              aria-label={item.label}
              title={item.label}
            >
              <BrandIcon item={item} />
            </a>
          ))}
        </div>

        <div className="footer-grid">
          {footerLinks.map((link) => (
            <a
              key={link}
              className="footer-link"
              href="#"
              onClick={(e) => handleLinkClick(e, link)}
            >
              {link}
            </a>
          ))}
        </div>

        <button
          className="footer-service-code"
          type="button"
          onClick={handleServiceCodeClick}
        >
          Service Code
        </button>

        <p className="footer-copyright">
          &copy; 2026 QStream, Made with passion by Asmit.
        </p>
      </footer>

      {/* Interactive Modal Overlay */}
      {activeModal && (
        <div className="footer-modal-overlay" onClick={handleOverlayClick}>
          <div className="footer-modal-card" ref={modalRef}>
            <div className="footer-modal-header">
              <h3 className="footer-modal-title">{activeModal}</h3>
              <button className="footer-modal-close" onClick={closeModal} aria-label="Close modal">
                <X size={20} />
              </button>
            </div>
            <div className="footer-modal-body">
              {renderModalContent()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Footer;
