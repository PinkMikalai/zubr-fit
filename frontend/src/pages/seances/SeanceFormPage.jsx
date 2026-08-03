import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import SeanceForm from '../../components/seances/SeanceForm';
import seanceService from '../../services/seanceService';
import infoIcon from '../../assets/icons/info.svg';

// Page d'édition d'une séance déjà existante (le nom, la durée, le commentaire).
// La création d'une séance se fait sur une page à part, SeanceCreatePage, plus complète.
function SeanceFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    seanceService
      .getById(id)
      .then(setInitialValues)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setError(null);
    try {
      await seanceService.update(id, values);
      navigate(`/seances/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p>Chargement...</p>;
  }

  return (
    <div className="seance-create-page">
      <nav className="breadcrumb">
        <Link to="/seances">Séances</Link>
        <span>/</span>
        <span>Modifier</span>
      </nav>

      <h1>Modifier la séance</h1>

      <section className="card seance-create-section seance-create-narrow">
        <h2><img src={infoIcon} alt="" className="section-icon" />Informations générales</h2>
        <SeanceForm initialValues={initialValues} onSubmit={handleSubmit} submitting={submitting} error={error} />
      </section>
    </div>
  );
}

export default SeanceFormPage;
