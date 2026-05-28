const footerLinks = [
  'Audio Description',
  'Help Center',
  'Gift Cards',
  'Media Center',
  'Investor Relations',
  'Jobs',
  'Terms of Use',
  'Privacy',
  'Legal Notices',
  'Cookie Preferences',
  'Corporate Information',
  'Contact Us',
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
  return (
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
          <a key={link} className="footer-link" href="#">
            {link}
          </a>
        ))}
      </div>

      <button className="footer-service-code" type="button">
        Service Code
      </button>

      <p className="footer-copyright">
        &copy; 1997-2026 QStream, Inc. and its affiliates. Made with passion for Asmit.
      </p>
    </footer>
  );
}

export default Footer;
