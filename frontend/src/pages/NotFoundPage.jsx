import { Link } from 'react-router-dom';
import PageMeta from '../components/layout/PageMeta';

// Cette page s'affiche quand l'utilisateur va sur une URL qui ne correspond à aucune route
// définie dans routes/index.jsx (par exemple une faute de frappe dans l'adresse).
function NotFoundPage() {
  return (
    <div className="not-found-page">
      <PageMeta title="Page introuvable" />
      <h1>404</h1>
      <p>Cette page n'existe pas ou plus.</p>
      <Link to="/">Retourner à l'accueil</Link>
    </div>
  );
}

export default NotFoundPage;
