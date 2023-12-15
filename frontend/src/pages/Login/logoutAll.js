import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import "../../assets/formStyle.css";
import NavBar from "../../components/NavBar";
import { useCookies } from "react-cookie";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function LogoutAll() {
  const navigate = useNavigate();
  const [cookies, setCookie, removeCookie] = useCookies(["tokenJWT"]);

  const [code, setCode] = useState("");

  const handleCodeChange = (e) => {
    setCode(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sendData = async () => {
      const data = [code, cookies];
      const columnNames = ["token", "tokenJWT"];

      const jsonData = [
        data.reduce((obj, val, i) => {
          obj[columnNames[i]] = val;
          return obj;
        }, {}),
      ];

      await axios
        .post("http://localhost:5000/logoutAll", JSON.stringify(jsonData), {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          if (res.data.status === "Error") {
            toast.error(res.data.message);
          } else {
            toast.success(res.data.message);
            removeCookie(["tokenJWT"]);
            setTimeout(navigate("/home"), 5000);
          }
        });
    };
    sendData();
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
          <h2>
            Voulez vous vraiment vous déconnecter de tout les équipements ?{" "}
          </h2>
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

          <button type="submit">Valider la déconnexion</button>
          <button type="button" className="btn-retour">
            <Link to="/home">Annuler </Link>
          </button>
        </form>
      </div>
    </>
  );
}

export default LogoutAll;
