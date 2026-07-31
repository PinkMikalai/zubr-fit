import { Link, useSearchParams } from 'react-router-dom';
import { useSeances } from '../../hooks/useSeances';
import { useAuth } from '../../hooks/useAuth';
import SeanceCard from '../../components/seances/SeanceCard';

function SeancesPage() {
  const { seances, loading, error, remove } = useSeances();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  if (loading) {
    return <p>Chargement...</p>;
  }

  let isCoach = false;
  if (user && user.roles && user.roles.includes('ROLE_COACH')) {
    isCoach = true;
  }

  // On filtre par nom si la barre de recherche du header a été utilisée (paramètre ?q=)
  const query = searchParams.get('q');
  let visibleSeances = seances;
  if (query) {
    const needle = query.toLowerCase();
    visibleSeances = seances.filter((seance) => seance.name.toLowerCase().includes(needle));
  }

  let errorMessage = null;
  if (error) {
    errorMessage = <p className="form-error">{error}</p>;
  }

  let newSeanceLink = null;
  if (isCoach) {
    newSeanceLink = <Link to="/seances/new">Nouvelle séance</Link>;
  }

  let content;
  if (visibleSeances.length === 0 && query) {
    content = <p>Aucune séance ne correspond à "{query}".</p>;
  } else if (visibleSeances.length === 0) {
    content = <p>Aucune séance pour l'instant.</p>;
  } else {
    content = (
      <ul className="seance-list">
        {visibleSeances.map((seance) => {
          let removeButton = null;
          if (isCoach) {
            removeButton = <button onClick={() => remove(seance.id)}>Supprimer</button>;
          }

          return (
            <li key={seance.id}>
              <SeanceCard seance={seance} />
              {removeButton}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div>
      <h1>Mes séances</h1>
      {newSeanceLink}
      {errorMessage}
      {content}
    </div>
  );
}

export default SeancesPage;
