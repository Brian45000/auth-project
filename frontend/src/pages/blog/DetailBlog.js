//import "./styles.css";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import NavBar from "../../components/NavBar";
import axios from "axios";
import Publication from "../../components/Publication";
import { useCookies } from "react-cookie";

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

  const [publications, setPublications] = useState();
  const [nom_blog, setNomBlog] = useState("");
  const [cookies, setCookie] = useCookies(["tokenJWT"]);

  useEffect(() => {
    const getBlog = async () => {
      const data = [id_blog, cookies];
      const columnNames = ["id_blog", "tokenJWT"];

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
          setPublications(res.data.publications);
          setNomBlog(res.data.nom_blog);
        });
    };
    getBlog();
  }, [cookies]);

  return (
    <div style={{ width: "100%" }}>
      <NavBar />
      <h2 className="titleH2">
        Liste des des publications du blog : {nom_blog}
      </h2>
      {publications && (
        <div className="publication-container">
          {publications?.map((publication) => (
            <Publication
              key={publication.ID_publication}
              title={publication.Title}
              date_creation={formattedDate(publication.Date_creation)}
              description={publication.Description}
              user_fullname={publication.FullName}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default DetailBlog;
