import { useEffect } from 'react';

// On met à jour document.title et la balise meta description directement en JS plutôt que
// de compter sur le rendu de <title>/<meta> par React : avec un <title> déjà présent dans
// index.html, les deux se marchaient dessus et le titre de l'onglet restait vide.
function PageMeta({ title, description }) {
  useEffect(() => {
    document.title = `${title} · zubr-fit`;
  }, [title]);

  useEffect(() => {
    if (!description) {
      return;
    }

    let metaTag = document.querySelector('meta[name="description"]');
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('name', 'description');
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute('content', description);
  }, [description]);

  return null;
}

export default PageMeta;
