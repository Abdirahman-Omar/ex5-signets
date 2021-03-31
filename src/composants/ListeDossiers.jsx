import './ListeDossiers.scss';
import Dossier from './Dossier';
import * as crudDossiers from '../services/crud-dossiers';
import { useState, useEffect } from 'react';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';

export default function ListeDossiers({ utilisateur, etatDossiers }) {
  // État des dossiers (vient du composant Appli)
  const [dossiers, setDossiers] = etatDossiers;

  // Lire les dossiers dans Firestore et forcer le réaffichage du composant
  // Remarquez que ce code est dans un useEffect() car on veut l'exécuter 
  // UNE SEULE FOIS (regardez le tableau des 'deps' - dépendances) et ceci 
  // APRÈS l'affichage du composant pour que la requête asynchrone à Firestore  
  // ait eu le temps d'être complétée et le réaffichage du composant soit
  // forcé par la mutation de l'état des dossiers
  useEffect(
    () => {
      crudDossiers.lireTout(utilisateur.uid).then(
        dossiers => setDossiers(dossiers)
      )
    }, []
  );


  /**
   * Gérer le clic du bouton 'supprimer' correspondant au dossier identifié en argument
   * @param {string} idd identifiant Firestore du dossier
   */
  async function gererSupprimer(idd) {
    // On fait appel à la méthode supprimer de notre code d'interaction avec Firestore
    crudDossiers.supprimer(utilisateur.uid, idd).then(
      () => {
        const tempDossiers = [...dossiers]; // copier le tableau des dossiers existants
        const dossiersRestants = tempDossiers.filter((elt) => elt.id !== idd); // filtrer pour garder tous les dossiers sauf celui qu'on a demandé de supprimer
        setDossiers(dossiersRestants); // Muter l'état pour forcer le réaffichage du composant
      }).catch(erreur => console.log('Échec de la suppression - Firestore a répondu :', erreur.message));
  }

  function gererLesTris(evt) {
    
    //On sépare le string en deux, on met les 2 string résultant dans un array
    let tableauParamsTri;

    tableauParamsTri = evt.target.value.split("--");

    console.log(tableauParamsTri);
    //On passe les paramètres de tri dans la fonction lireTout (2 nouveaux params optionnels ont été ajoutés à lireTout 
    //pour gérer le orderBy) dynamiquement

    crudDossiers.lireTout(utilisateur.uid, tableauParamsTri[0], tableauParamsTri[1]).then(dossiers => setDossiers(dossiers));
    
  }

 

  return (
    <>

      <FormControl style={{ marginLeft: "100px", marginTop: "50px", minWidth: 180 }}>
        <InputLabel id="demo-controlled-open-select-label">Tri des dossiers</InputLabel>
        <Select
        
        defaultValue={"datemodif--desc"}
          onChange={gererLesTris}

        >
          <MenuItem value={"datemodif--desc"}>Date de modification descendante</MenuItem>
          <MenuItem value={"nom--asc"}>Alphabétique ascendant</MenuItem>
          <MenuItem value={"nom--desc"}>Alphabétique descendant</MenuItem>
        </Select>

      </FormControl>
      <ul className="ListeDossiers">
        {
          (dossiers.length > 0) ?
            dossiers.map(dossier => <li key={dossier.id}><Dossier {...dossier} gererSupprimer={gererSupprimer} /></li>)
            :
            <li className="msgAucunDossier">
              Votre liste de dossiers est vide
            <p>;-(</p>
            </li>
        }
      </ul>
    </>
  );
}