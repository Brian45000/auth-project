//import "./styles.css";
import React, { useState, useEffect } from "react";
import { Link, useLocation, us } from "react-router-dom";
import NavBar from "../../components/NavBar";
import axios from "axios";
import Publication from "../../components/Publication";
import { useCookies } from "react-cookie";
import { ToastContainer, toast } from "react-toastify";
import { user } from "../../features/user";

function formattedDate(dateToFormate) {
  const dateOriginale = new Date(dateToFormate);

  const jour = ("0" + dateOriginale.getDate()).slice(-2);
  const mois = ("0" + (dateOriginale.getMonth() + 1)).slice(-2);
  const annee = dateOriginale.getFullYear();

  const heures = ("0" + dateOriginale.getHours()).slice(-2);
  const minutes = ("0" + dateOriginale.getMinutes()).slice(-2);
  const secondes = ("0" + dateOriginale.getSeconds()).slice(-2);

  return `${jour}/${mois}/${annee} ${heures}:${minutes}:${secondes}`;
}

function DetailBlog() {
  // Utilisez useLocation pour obtenir l'objet location
  const location = useLocation();

  // Utilisez location.search pour obtenir la chaîne de requête (ex: "?param1=valeur1&param2=valeur2")
  const searchParams = new URLSearchParams(location.search);

  // Utilisez get pour récupérer la valeur d'un paramètre spécifique
  const id_blog = searchParams.get("id");

  // Déclarations de states reacts
  const [publications, setPublications] = useState();
  const [nom_blog, setNomBlog] = useState("");
  const [ID_User, setID_User] = useState("");
  const [cookies, setCookie] = useCookies(["tokenJWT"]);
  const [doubleAuth, setDoubleAuth] = useState(false);
  const [IsMonBlog, setIsMonBlog] = useState(false);
  const [countPublications, setCountPublications] = useState(0);
  const [IsAddPubli, SetIsAddPubli] = useState(false);

  const [values, setValues] = React.useState({
    newTitle: "",
    newDescription: "",
  });
  // Déclaration de la function pour changer le state value selon l'input reçu
  const handleChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  // function permettant d'envoyer les nouvels information d'un nouveau à la base de donnée
  const handleSubmitAdd = async (e) => {
    try {
      const sendAdd = async () => {
        const data = [values.newTitle, values.newDescription, ID_User, id_blog];
        const columnNames = ["newTitle", "newDescription", "userID", "blogID"];

        const jsonData = [
          data.reduce((obj, val, i) => {
            obj[columnNames[i]] = val;
            return obj;
          }, {}),
        ];

        await axios
          .post(
            "http://localhost:5000/add-publication",
            JSON.stringify(jsonData),
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          )
          .then((res) => {
            if (res.data.status === "Success") {
              SetIsAddPubli(false);
              window.location.reload();
            }
          });
      };
      sendAdd();
    } catch (e) {}
  };

  useEffect(() => {
    // function pour récuperer nos blogs
    const getBlog = async () => {
      const data = [id_blog, cookies, ID_User];
      const columnNames = ["id_blog", "tokenJWT", "id_user"];

      const jsonData = [
        data.reduce((obj, val, i) => {
          obj[columnNames[i]] = val;
          return obj;
        }, {}),
      ];

      await axios
        .post("http://localhost:5000/publications", JSON.stringify(jsonData), {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          if (res.data.status === "Success") {
            toast.success(res.data.message);
            setPublications(res.data.publications);
            setNomBlog(res.data.nom_blog);
            setID_User(res.data.id_user);
            setCountPublications(res.data.publications.length);
          } else {
            toast.error(res.data.message);
          }
        });
    };
    getBlog();
    //function pour récuperer le cookie
    const getCookies = async () => {
      const data = [cookies];
      const columnNames = ["tokenJWT", "BlogUserId"];

      const jsonData = [
        data.reduce((obj, val, i) => {
          obj[columnNames[i]] = val;
          return obj;
        }, {}),
      ];

      await axios
        .post("http://localhost:5000/get-cookies", JSON.stringify(jsonData), {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          setDoubleAuth(res.data.doubleAuthent);
          if (res.data.ID_user === ID_User) {
            setIsMonBlog(true);
          } else {
            setIsMonBlog(false);
          }
        });
    };
    if (cookies) getCookies();
  }, [cookies, ID_User, id_blog, countPublications]);

  return (
    <div style={{ width: "100%" }}>
      <NavBar />
      <aside>
        <ToastContainer />
      </aside>
      <h2 className="titleH2">
        Liste des des publications de "{nom_blog} "
        {doubleAuth && IsMonBlog && (
          <>
            <button
              onClick={() => SetIsAddPubli(true)}
              className="detail-button"
            >
              Ajouter une publication ➕
            </button>
          </>
        )}
      </h2>

      {publications && (
        <div className="publication-container">
          {IsAddPubli && (
            <div className="publication-card">
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
                  onClick={() => handleSubmitAdd()}
                  className="detail-button"
                >
                  Enregistrer✏️
                </button>
                <button
                  onClick={() => SetIsAddPubli(false)}
                  className="delete-button"
                >
                  Annuler ❌
                </button>
              </form>
            </div>
          )}

          {publications?.map((publication) => (
            <Publication
              key={publication.ID_publication}
              title={publication.Title}
              date_creation={formattedDate(publication.Date_creation)}
              description={publication.Description}
              user_fullname={publication.FullName}
              user_idblog={ID_User}
              doubleAuth={doubleAuth}
              IsMonBlog={IsMonBlog}
              id_publication={publication.id_publication}
              id_blog={id_blog}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default DetailBlog;
