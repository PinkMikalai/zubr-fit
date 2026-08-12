import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer className="app-footer">
            <p>zubr-fit © 2026 · <Link to="/about">À propos</Link></p>
        </footer>
    )
}

export default Footer;
