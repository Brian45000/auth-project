import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import "../../assets/formStyle.css";
import NavBar from "../../components/NavBar";
import { useCookies } from "react-cookie";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function TfaForm() {
  const navigate = useNavigate();

  // Utilisez useLocation pour obtenir l'objet location
  const location = useLocation();

  // Utilisez location.search pour obtenir la chaîne de requête (ex: "?param1=valeur1&param2=valeur2")
  const searchParams = new URLSearchParams(location.search);

  // Utilisez get pour récupérer la valeur d'un paramètre spécifique
  let tokenJWT = searchParams.get("tokenJWT");

  const [cookies, setCookie] = useCookies(["tokenJWT"]);

  useEffect(() => {
    if (tokenJWT) {
      setCookie("tokenJWT", tokenJWT, { path: "/" });
    }
  }, [tokenJWT, setCookie]);

  const [code, setCode] = useState("");

  const handleCodeChange = (e) => {
    setCode(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sendLogin = async () => {
      const data = [code, cookies];
      const columnNames = ["token", "tokenJWT"];

      const jsonData = [
        data.reduce((obj, val, i) => {
          obj[columnNames[i]] = val;
          return obj;
        }, {}),
      ];

      await axios
        .post("http://localhost:5000/verify", JSON.stringify(jsonData), {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          if (res.data.status === "Error") {
            toast.error(res.data.message);
          } else {
            toast.success(res.data.message);
            setCookie("tokenJWT", res.data.tokenJWT, { path: "/" });
            setTimeout(navigate("/home"), 5000);
          }
        });
    };
    sendLogin();
    try {
    } catch (e) {}
  };

  return (
    <>
      <NavBar />
      <aside>
        <ToastContainer />
      </aside>
      <div className="card-login">
        <form
          className="centered-form"
          action="#"
          method="post"
          onSubmit={handleSubmit}
        >
          <label for="authCode">Code d'Authentification à Deux Facteurs:</label>
          <input
            type="text"
            id="authCode"
            name="authCode"
            value={code}
            onChange={handleCodeChange}
            placeholder="Saisir le code"
            required
          />

          <button type="submit">Valider le Code</button>
          <button type="button" className="btn-retour">
            <Link to="/home">Pas pour le moment</Link>
          </button>
        </form>
      </div>
    </>
  );
}

export default TfaForm;
