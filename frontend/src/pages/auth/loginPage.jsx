import { Link } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';
import logoMark from '../../assets/icons/logo-mark.svg';

function LoginPage() {
  return (
    <div className="auth-page">
      <div className="card auth-card">
        <div className="auth-brand">
          <span className="auth-logo">
            <img src={logoMark} alt="" />
          </span>
          <h1>zubr-fit</h1>
          <p className="auth-tagline">La performance à votre portée.</p>
        </div>

        <h2>Connexion</h2>
        <LoginForm />

        <p className="auth-switch">
          Nouveau sur zubr-fit ? <Link to="/register">S'inscrire</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
