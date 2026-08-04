import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import exerciseService from '../../services/exerciseService';
import coachClientService from '../../services/coachClientService';
import seanceService from '../../services/seanceService';
import seanceExerciseService from '../../services/seanceExerciseService';
import { getCategoryLabel, getLevelLabel, LEVEL_OPTIONS } from '../../utils/exerciseLabels';
import { useExerciseFilters } from '../../hooks/useExerciseFilters';
import ExerciseFilterBar from '../../components/exercises/ExerciseFilterBar';
import dumbbellIcon from '../../assets/icons/dumbbell.svg';
import trashIcon from '../../assets/icons/trash.svg';
import plusIcon from '../../assets/icons/plus.svg';
import searchIcon from '../../assets/icons/search.svg';
import checkIcon from '../../assets/icons/check.svg';
import userIcon from '../../assets/icons/user.svg';
import infoIcon from '../../assets/icons/info.svg';
import usersIcon from '../../assets/icons/users.svg';
import chevronUpIcon from '../../assets/icons/chevron-up.svg';
import chevronDownIcon from '../../assets/icons/chevron-down.svg';

const API_URL = import.meta.env.VITE_API_URL;

// Un identifiant temporaire pour les exercices ajoutés localement, avant que la séance
// (et donc ses exercices) ne soit vraiment créée côté serveur.
let nextTempId = 1;

function SeanceCreatePage() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [comment, setComment] = useState('');
  const [level, setLevel] = useState('');

  const [exercises, setExercises] = useState([]);
  const [clients, setClients] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const exerciseFilters = useExerciseFilters(exercises);

  // Les exercices et clients choisis ne sont gardés qu'en local tant que la séance
  // n'existe pas encore : ils seront envoyés au serveur seulement au clic sur "Finaliser la séance".
  const [lines, setLines] = useState([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickedExerciseId, setPickedExerciseId] = useState('');
  const [pickedSets, setPickedSets] = useState('');
  const [pickedReps, setPickedReps] = useState('');

  const [clientQuery, setClientQuery] = useState('');
  const [selectedClientIds, setSelectedClientIds] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([exerciseService.list(), coachClientService.list()])
      .then(([exercisesData, clientsData]) => {
        setExercises(exercisesData);
        setClients(clientsData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingOptions(false));
  }, []);

  const handleAddLine = () => {
    if (!pickedExerciseId) {
      setError('Choisis un exercice à ajouter');
      return;
    }

    const exercise = exercises.find((item) => item.id === Number(pickedExerciseId));
    if (!exercise) {
      return;
    }

    setError(null);
    setLines((prev) => [
      ...prev,
      { tempId: nextTempId++, exerciseId: exercise.id, exercise: exercise, sets: pickedSets, reps: pickedReps },
    ]);
    setPickedExerciseId('');
    setPickedSets('');
    setPickedReps('');
    setIsPickerOpen(false);
  };

  const handleRemoveLine = (tempId) => {
    setLines((prev) => prev.filter((line) => line.tempId !== tempId));
  };

  // Échange la ligne à l'index donné avec celle juste au-dessus/en-dessous, pour réordonner
  const moveLine = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= lines.length) {
      return;
    }

    setLines((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  const toggleClient = (clientId) => {
    if (selectedClientIds.includes(clientId)) {
      setSelectedClientIds((prev) => prev.filter((id) => id !== clientId));
    } else {
      setSelectedClientIds((prev) => [...prev, clientId]);
    }
  };

  const toggleSelectAllClients = () => {
    let allSelected = false;
    if (clients.length > 0 && clients.every((coachClient) => selectedClientIds.includes(coachClient.client.id))) {
      allSelected = true;
    }

    if (allSelected) {
      setSelectedClientIds([]);
    } else {
      setSelectedClientIds(clients.map((coachClient) => coachClient.client.id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name) {
      setError('Le nom de la séance est requis');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const created = await seanceService.create({ name, duration, comment, level });

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        await seanceExerciseService.add(created.id, {
          exerciseId: line.exerciseId,
          sets: line.sets,
          reps: line.reps,
          position: i,
        });
      }

      if (selectedClientIds.length > 0) {
        await seanceService.assign(created.id, selectedClientIds);
      }

      navigate(`/seances/${created.id}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (loadingOptions) {
    return <p>Chargement...</p>;
  }

  // On filtre les clients affichés à partir de la recherche texte, AVANT le return
  let visibleClients = clients;
  if (clientQuery) {
    const needle = clientQuery.toLowerCase();
    visibleClients = clients.filter((coachClient) => {
      const fullName = `${coachClient.client.firstname} ${coachClient.client.lastname}`.toLowerCase();
      return fullName.includes(needle);
    });
  }

  let errorMessage = null;
  if (error) {
    errorMessage = <p className="form-error">{error}</p>;
  }

  // On calcule le volume total (somme des séries) et le "Tout sélectionner", AVANT le return
  let totalSets = 0;
  lines.forEach((line) => {
    totalSets += Number(line.sets) || 0;
  });

  let allClientsSelected = false;
  if (clients.length > 0 && clients.every((coachClient) => selectedClientIds.includes(coachClient.client.id))) {
    allClientsSelected = true;
  }

  let selectAllText = 'Tout sélectionner';
  if (allClientsSelected) {
    selectAllText = 'Tout désélectionner';
  }

  // Le formulaire d'ajout, affiché soit sous le bouton du haut, soit à la place de la carte pointillée
  let pickerForm = null;
  if (isPickerOpen) {
    pickerForm = (
      <div className="card seance-create-line-picker">
        <ExerciseFilterBar
          category={exerciseFilters.category}
          level={exerciseFilters.level}
          onCategoryChange={exerciseFilters.setCategory}
          onLevelChange={exerciseFilters.setLevel}
        />
        <select value={pickedExerciseId} onChange={(e) => setPickedExerciseId(e.target.value)}>
          <option value="">Choisir un exercice...</option>
          {exerciseFilters.filteredExercises.map((exercise) => (
            <option key={exercise.id} value={exercise.id}>{exercise.name}</option>
          ))}
        </select>
        <input
          type="number"
          min="1"
          placeholder="Séries"
          value={pickedSets}
          onChange={(e) => setPickedSets(e.target.value)}
        />
        <input
          type="number"
          min="1"
          placeholder="Répétitions"
          value={pickedReps}
          onChange={(e) => setPickedReps(e.target.value)}
        />
        <div className="seance-create-line-picker-actions">
          <button type="button" onClick={handleAddLine}>Ajouter</button>
          <button type="button" onClick={() => setIsPickerOpen(false)} className="button-secondary">
            Annuler
          </button>
        </div>
      </div>
    );
  }

  // La carte cliquable pour ouvrir le formulaire (cachée pendant qu'il est ouvert)
  let addExerciseCard = null;
  if (exercises.length === 0) {
    addExerciseCard = (
      <p>
        Tu n'as pas encore d'exercice. <Link to="/exercises/new">En créer un</Link>.
      </p>
    );
  } else if (!isPickerOpen) {
    addExerciseCard = (
      <button type="button" onClick={() => setIsPickerOpen(true)} className="seance-create-add-exercise">
        <img src={plusIcon} alt="" />
        <span>Cliquer pour choisir un nouvel exercice</span>
        <span className="seance-create-add-exercise-hint">{exercises.length} exercice(s) disponible(s)</span>
      </button>
    );
  }

  let linesList = null;
  if (lines.length > 0) {
    linesList = (
      <ul className="seance-create-lines">
        {lines.map((line, index) => {
          let thumbnail;
          if (line.exercise.illustration) {
            thumbnail = (
              <img
                src={`${API_URL}/uploads/illustrations/${line.exercise.illustration}`}
                alt=""
                className="exercise-line-thumbnail"
              />
            );
          } else {
            thumbnail = (
              <div className="exercise-line-thumbnail exercise-line-thumbnail-placeholder">
                <img src={dumbbellIcon} alt="" />
              </div>
            );
          }

          let moveUpDisabled = false;
          if (index === 0) {
            moveUpDisabled = true;
          }

          let moveDownDisabled = false;
          if (index === lines.length - 1) {
            moveDownDisabled = true;
          }

          return (
            <li key={line.tempId} className="card exercise-line">
              <div className="exercise-line-reorder">
                <button
                  type="button"
                  onClick={() => moveLine(index, -1)}
                  disabled={moveUpDisabled}
                  aria-label="Monter l'exercice"
                >
                  <img src={chevronUpIcon} alt="" />
                </button>
                <button
                  type="button"
                  onClick={() => moveLine(index, 1)}
                  disabled={moveDownDisabled}
                  aria-label="Descendre l'exercice"
                >
                  <img src={chevronDownIcon} alt="" />
                </button>
              </div>
              {thumbnail}
              <div className="exercise-line-footer">
                <div className="exercise-line-info">
                  <h3>{index + 1}. {line.exercise.name}</h3>
                  <p className="exercise-line-tags">
                    {getCategoryLabel(line.exercise)} · {getLevelLabel(line.exercise)}
                  </p>
                  <div className="exercise-line-stats">
                    <div>
                      <span className="exercise-line-stat-label">Séries</span>
                      <span className="exercise-line-stat-value">{line.sets}</span>
                    </div>
                    <div>
                      <span className="exercise-line-stat-label">Reps</span>
                      <span className="exercise-line-stat-value">{line.reps}</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveLine(line.tempId)}
                  className="icon-button"
                  aria-label="Retirer l'exercice"
                >
                  <img src={trashIcon} alt="" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    );
  }

  let clientChecklist = null;
  if (clients.length === 0) {
    clientChecklist = (
      <p>
        Tu n'as pas encore de client. <Link to="/clients">En ajouter un</Link>.
      </p>
    );
  } else {
    clientChecklist = (
      <ul className="seance-create-clients">
        {visibleClients.map((coachClient) => {
          const client = coachClient.client;

          let avatarSrc = userIcon;
          if (client.avatarUrl) {
            avatarSrc = `${API_URL}${client.avatarUrl}`;
          }

          let isSelected = false;
          if (selectedClientIds.includes(client.id)) {
            isSelected = true;
          }

          let rowClassName = 'seance-create-client-row';
          if (isSelected) {
            rowClassName = 'seance-create-client-row seance-create-client-row-selected';
          }

          let checkMark = null;
          if (isSelected) {
            checkMark = (
              <span className="seance-create-client-checkbox seance-create-client-checkbox-checked">
                <img src={checkIcon} alt="" />
              </span>
            );
          } else {
            checkMark = <span className="seance-create-client-checkbox" />;
          }

          return (
            <li key={client.id}>
              <button type="button" onClick={() => toggleClient(client.id)} className={rowClassName}>
                {checkMark}
                <img src={avatarSrc} alt="" className="avatar-circle" />
                {client.firstname} {client.lastname}
              </button>
            </li>
          );
        })}
      </ul>
    );
  }

  let buttonText = 'Finaliser la séance';
  if (submitting) {
    buttonText = 'Création...';
  }

  return (
    <div className="form-page">
      <nav className="breadcrumb">
        <Link to="/seances">Séances</Link>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">Nouvelle séance</span>
      </nav>

      <h1>Créer une séance d'entraînement</h1>
      <p className="page-subtitle">Conçois un programme précis pour tes clients.</p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-page-grid">
          <div className="form-page-column">
            <section className="card form-page-section">
              <h2><img src={infoIcon} alt="" className="section-icon" />Informations générales</h2>

              <div>
                <label htmlFor="name">Nom de la séance</label>
                <input
                  id="name"
                  placeholder="Ex : Full Body Hypertrophie A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="duration">Durée estimée (minutes)</label>
                <input
                  id="duration"
                  type="number"
                  min="1"
                  placeholder="Ex : 45"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="level">Niveau</label>
                <select id="level" value={level} onChange={(e) => setLevel(e.target.value)}>
                  <option value="">Choisir un niveau...</option>
                  {LEVEL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="comment">Commentaires et consignes (optionnel)</label>
                <textarea
                  id="comment"
                  placeholder="Consignes spécifiques sur l'intensité, le temps ou l'échauffement..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
            </section>

            <section className="card form-page-section">
              <div className="form-page-section-header">
                <h2><img src={usersIcon} alt="" className="section-icon" />Assigner à des clients</h2>
                <button type="button" onClick={toggleSelectAllClients} className="link-button">
                  {selectAllText}
                </button>
              </div>

              <div className="input-with-icon">
                <img src={searchIcon} alt="" className="input-icon" />
                <input
                  type="text"
                  placeholder="Rechercher un client"
                  value={clientQuery}
                  onChange={(e) => setClientQuery(e.target.value)}
                />
              </div>
              {clientChecklist}
            </section>
          </div>

          <div className="form-page-column">
            <section className="card form-page-section">
              <h2><img src={dumbbellIcon} alt="" className="section-icon" />Exercices de la séance</h2>
              {linesList}
              {pickerForm}
              {addExerciseCard}
            </section>
          </div>
        </div>

        {errorMessage}

        <div className="seance-create-summary">
          <div className="seance-create-summary-grid">
            <div>
              <p className="seance-create-summary-value">{totalSets}</p>
              <p className="seance-create-summary-label">Volume total (séries)</p>
            </div>
            <div>
              <p className="seance-create-summary-value">{duration || '—'}</p>
              <p className="seance-create-summary-label">Temps estimé (min)</p>
            </div>
            <div>
              <p className="seance-create-summary-value">{selectedClientIds.length}</p>
              <p className="seance-create-summary-label">Clients assignés</p>
            </div>
          </div>
          <button type="submit" disabled={submitting} className="seance-create-submit">
            {buttonText}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SeanceCreatePage;
