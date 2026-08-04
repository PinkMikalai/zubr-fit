import { useState } from 'react';

// Filtre une liste d'exercices par catégorie et/ou niveau. Réutilisé partout où on doit
// choisir un exercice dans une liste qui peut devenir longue (bibliothèque, ajout à une séance).
export function useExerciseFilters(exercises) {
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');

  let filteredExercises = exercises;

  if (category) {
    filteredExercises = filteredExercises.filter((exercise) => {
      // Le backend renvoie "Category" (majuscule) à cause d'une coquille sur l'entité Exercise,
      // sauf dans SeanceExerciseController qui renvoie "category" (minuscule)
      let exerciseCategory = exercise.Category;
      if (!exerciseCategory) {
        exerciseCategory = exercise.category;
      }
      return exerciseCategory === category;
    });
  }

  if (level) {
    filteredExercises = filteredExercises.filter((exercise) => exercise.level === level);
  }

  return { category, setCategory, level, setLevel, filteredExercises };
}
