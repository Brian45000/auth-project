import "./styles.css";

import React, { useState, useEffect } from "react";
import axios from "axios";

function Publication(props) {
  // on recupere les parametres de la page DetailBlog
  const {
    title,
    date_creation,
    description,
    user_fullname,
    doubleAuth,
    IsMonBlog,
    id_publication,
  } = props;
  // on initie nos states
  const [IsModif, SetIsModif] = useState(false);

  const [values, setValues] = React.useState({
    newTitle: title,
    newDescription: description,
  });

  // on déclare nos fonctions pour enregistrer les changement dynamique de l'utilisateur
  const handleChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  // cette function permet d'envoyer les données enregistrés au serveur pour modifier une ressource existante
  const handleSubmitEdit = async (e) => {
    try {
      const sendModification = async () => {
        const data = [values.newTitle, values.newDescription, id_publication];
        const columnNames = ["newTitle", "newDescription", "id_publication"];

        const jsonData = [
          data.reduce((obj, val, i) => {
            obj[columnNames[i]] = val;
            return obj;
          }, {}),
        ];

        await axios
          .post(
            "http://localhost:5000/edit-publication",
            JSON.stringify(jsonData),
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          )
          .then((res) => {
            if (res.data.status === "Success") {
              SetIsModif(false);
              window.location.reload();
            }
          });
      };
      sendModification();
    } catch (e) {}
  };

  //cette function permet de supprimé le blog selectionné
  const handleDelete = async (e) => {
    try {
      const deletePublication = async () => {
        const data = [id_publication];
        const columnNames = ["id_publication"];

        const jsonData = [
          data.reduce((obj, val, i) => {
            obj[columnNames[i]] = val;
            return obj;
          }, {}),
        ];

        await axios
          .post(
            "http://localhost:5000/delete-publication",
            JSON.stringify(jsonData),
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          )
          .then((res) => {
            if (res.data.status === "Success") {
              SetIsModif(false);
              window.location.reload();
            }
          });
      };

      deletePublication();
    } catch (e) {}
  };
  useEffect(() => {}, []);
  return (
    <div className="publication-card">
      {!IsModif ? (
        <>
          <p className="publication-title">{title}</p>
          <p className="publication-created-by">Créé par : {user_fullname}</p>
          <p className="publication-created-by">Créé le : {date_creation}</p>
          <p className="publication-desc">{description}</p>

          {doubleAuth && IsMonBlog && (
            <>
              <button
                onClick={() => SetIsModif(true)}
                className="update-button"
              >
                Modifier ✏️
              </button>
              <button onClick={() => handleDelete()} className="delete-button">
                Supprimer ❌
              </button>
            </>
          )}
        </>
      ) : (
        <>
          <form>
            <div>
              <label htmlFor="newTitle">Titre :</label>
              <input
                type="text"
                id="newTitle"
                value={values.newTitle}
                onChange={handleChange("newTitle")}
              />
            </div>
            <div>
              <label htmlFor="newDescription">Description :</label>
              <textarea
                id="newDescription"
                value={values.newDescription}
                onChange={handleChange("newDescription")}
                rows="5"
                cols="41"
              />
            </div>
            <button
              type="button"
              className="detail-button"
              onClick={() => handleSubmitEdit()}
            >
              Enregistrer✏️
            </button>
            <button onClick={() => SetIsModif(false)} className="delete-button">
              Annuler ❌
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default Publication;
