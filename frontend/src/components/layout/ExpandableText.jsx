import { useState } from 'react';
import chevronUpIcon from '../../assets/icons/chevron-up.svg';
import chevronDownIcon from '../../assets/icons/chevron-down.svg';

const PREVIEW_LENGTH = 100;

// Affiche un texte entier s'il est court. S'il dépasse PREVIEW_LENGTH caractères, il est
// tronqué avec un bouton "Voir tout" pour le dérouler (et "Voir moins" pour le réduire).
function ExpandableText({ text }) {
  const [isOpen, setIsOpen] = useState(false);

  let isLong = false;
  if (text.length > PREVIEW_LENGTH) {
    isLong = true;
  }

  let displayedText = text;
  if (isLong && !isOpen) {
    displayedText = text.slice(0, PREVIEW_LENGTH).trim() + '…';
  }

  let toggleButton = null;
  if (isLong) {
    let toggleIcon = chevronDownIcon;
    let toggleLabel = 'Voir tout';
    if (isOpen) {
      toggleIcon = chevronUpIcon;
      toggleLabel = 'Voir moins';
    }

    toggleButton = (
      <button type="button" className="link-button expandable-text-toggle" onClick={() => setIsOpen(!isOpen)}>
        {toggleLabel}
        <img src={toggleIcon} alt="" />
      </button>
    );
  }

  return (
    <>
      <p>{displayedText}</p>
      {toggleButton}
    </>
  );
}

export default ExpandableText;
