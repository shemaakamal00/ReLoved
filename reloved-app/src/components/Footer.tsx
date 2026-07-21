import { Link } from "react-router-dom";

function Footer(){
    return(
        <footer className="site-footer">
        <div className="footer-bg-text">ReLoved</div>
  
        <div className="footer-inner">
          <a href="home.html" className="footer-logo">Re<span>Loved</span></a>
  
          <p className="footer-tagline">Älskat tidigare. Älskat igen.</p>
  
          <p className="footer-text">
            Köp, sälj och ge plagg ett nytt liv. ReLoved gör second hand enkelt,
            tryggt och hållbart.
          </p>
  
          <nav className="footer-nav" aria-label="Sidfot">
            <Link to = "/about" > Om ReLoved </Link>
            <Link to = "/faq" > Vanliga frågor </Link>
            <Link to = "/privacy-policy"> Integritetspolicy </Link>
            <Link to = "/terms-of-service"> Användarvillkor </Link>
            <Link to = "/contact"> Kontakta oss</Link>
          </nav>
  
          <div className="footer-socials">
            <a href="#">Instagram</a>
            <a href="#">TikTok</a>
            <a href="#">Pinterest</a>
          </div>
  
          <p className="footer-note">
            ReLoved är ett utbildningsprojekt utvecklat i studiesyfte.
          </p>
  
          <p className="footer-copy">© 2026 ReLoved. Alla rättigheter förbehållna.</p>
        </div>
      </footer>
    );
}

export default Footer;