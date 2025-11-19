import { Link } from 'react-router-dom';
import './PortfolioBranding.css';

export function PortfolioBranding() {
  return (
    <>
      <footer className="portfolio-branding-footer">
        <Link to="/" className="portfolio-branding-link">
          made with porflyo
        </Link>
      </footer>
    </>
  );
}
