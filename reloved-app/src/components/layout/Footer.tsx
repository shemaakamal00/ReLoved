function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-bg-text">ReLoved</div>

      <div className="footer-inner">
        <a href="/" className="footer-logo">
          Re<span>Loved</span>
        </a>

        <p className="footer-tagline">Älskat tidigare. Älskat igen.</p>

        <p className="footer-text">
          Second hand där varje annons granskas innan den syns.
        </p>

        <nav className="footer-nav" aria-label="Sidfot">
          <a href="/about">Om ReLoved</a>
          <a href="/faq">Vanliga frågor</a>
          <a href="/privacy-policy">Integritetspolicy</a>
          <a href="/terms-of-service">Användarvillkor</a>
          <a href="/contact">Kontakta oss</a>
        </nav>

        <p className="footer-note">
          ReLoved är ett skolprojekt. Inga riktiga köp görs.
        </p>

        <p className="footer-copy">© 2026 ReLoved.</p>
      </div>
    </footer>
  );
}

export default Footer;
