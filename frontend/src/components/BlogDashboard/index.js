import "./styles.css";
import React, { useState, useEffect } from "react";
import axios from "axios";

function BlogDashboard(props) {
  const { id, title, access, name } = props;

  // on nomme nos Etats reacts
  const [IsModif, SetIsModif] = useState(false);

  const [values, setValues] = React.useState({
    newTitle: title,
    newAccess: access,
  });

  const handleChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  const handleSubmitEdit = async () => {
    try {
      const sendModification = async () => {
        const data = [values.newTitle, values.newAccess, id];
        const columnNames = ["newTitle", "newAccess", "id_blog"];

        const jsonData = [
          data.reduce((obj, val, i) => {
            obj[columnNames[i]] = val;
            return obj;
          }, {}),
        ];

        await axios
          .post("http://localhost:5000/edit-blog", JSON.stringify(jsonData), {
            headers: {
              "Content-Type": "application/json",
            },
          })
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

  const handleDelete = async () => {
    try {
      const deleteBlog = async () => {
        const data = [id];
        const columnNames = ["id_blog"];

        const jsonData = [
          data.reduce((obj, val, i) => {
            obj[columnNames[i]] = val;
            return obj;
          }, {}),
        ];

        await axios
          .post("http://localhost:5000/delete-blog", JSON.stringify(jsonData), {
            headers: {
              "Content-Type": "application/json",
            },
          })
          .then((res) => {
            if (res.data.status === "Success") {
              SetIsModif(false);
              window.location.reload();
            }
          });
      };

      deleteBlog();
    } catch (e) {}
  };

  useEffect(() => {}, []);

  return (
    <div className="blog-card">
      {!IsModif ? (
        <>
          <p className="blog-title">{title}</p>
          <p className="blog-access">Accès : {access}</p>
          <p className="blog-created-by">Créé par : {name}</p>

          <button onClick={() => SetIsModif(true)} className="update-button">
            Modifier ✏️
          </button>
          <button onClick={() => handleDelete()} className="delete-button">
            Supprimer ❌
          </button>
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
              <label htmlFor="newAccess">Accès :</label>
              <select
                id="newAccess"
                value={values.newAccess}
                onChange={handleChange("newAccess")}
              >
                <option value="Public">Public</option>
                <option value="Private">Private</option>
              </select>
            </div>
            <button
              type="button"
              className="detail-button"
              onClick={() => handleSubmitEdit()}
            >
              Enregistrer ✏️
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

export default BlogDashboard;
