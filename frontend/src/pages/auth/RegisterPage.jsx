import { Link } from 'react-router-dom';
import RegisterForm from '../../components/auth/RegisterForm';
import PageMeta from '../../components/layout/PageMeta';
import logoMark from '../../assets/icons/logo-mark.svg';

function RegisterPage() {
  return (
    <div className="auth-page">
      <PageMeta title="Créer un compte" />
      <div className="card auth-card">
        <div className="auth-brand">
          <span className="auth-logo">
            <img src={logoMark} alt="" />
          </span>
          <h1>zubr-fit</h1>
          <p className="auth-tagline">Rejoins la plateforme de coaching sportif.</p>
        </div>

        <h2>Créer un compte</h2>
        <RegisterForm />

        <p className="auth-switch">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
