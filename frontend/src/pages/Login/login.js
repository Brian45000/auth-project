import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../../assets/formStyle.css";
import NavBar from "../../components/NavBar";
import { useCookies } from "react-cookie";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Login() {
  const navigate = useNavigate();

  const [identifiant, setIdentifiant] = useState("");
  const [mdp, setMdp] = useState("");

  const [cookies, setCookie, removeCookie] = useCookies(["tokenJWT"]);

  const handleIdentifiantChange = (e) => {
    setIdentifiant(e.target.value);
  };

  const handleMdpChange = (e) => {
    setMdp(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const sendLogin = async () => {
        const data = [identifiant, mdp];
        const columnNames = ["identifiant", "mdp"];

        const jsonData = [
          data.reduce((obj, val, i) => {
            obj[columnNames[i]] = val;
            return obj;
          }, {}),
        ];

        await axios
          .post("http://localhost:5000/login", JSON.stringify(jsonData), {
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
              if (res.data.is2faIsActivated === 1) {
                navigate("/verify");
              } else {
                navigate("/enable-2fa?email=" + res.data.email);
              }
            }
          });
      };
      sendLogin();
    } catch (e) {}
  };

  const loginWithGoogle = () => {
    // Redirige vers l'authentification Google
    window.location.href = "http://localhost:5000/auth/google";
  };

  const loginWithGithub = () => {
    // Redirige vers l'authentification Google
    window.location.href = "http://localhost:5000/auth/github";
  };

  return (
    <>
      <NavBar />
      <aside>
        <ToastContainer />
      </aside>

      <div className="card-login">
        <form
          class="centered-form "
          action="#"
          method="post"
          onSubmit={handleSubmit}
        >
          <label htmlFor="username">Adresse mail :</label>
          <input
            type="text"
            id="username"
            name="username"
            value={identifiant}
            onChange={handleIdentifiantChange}
            placeholder="Saisir votre identifiant"
            required
          />

          <label htmlFor="password">Mot de passe :</label>
          <input
            type="password"
            id="password"
            name="password"
            value={mdp}
            onChange={handleMdpChange}
            placeholder="Saisir votre mot de passe"
            required
          />

          <button type="submit">Se Connecter</button>

          <button type="button" className="btn-create-account">
            <Link to="/register">Créer un compte</Link>
          </button>
        </form>

        <button className="btn-google" onClick={loginWithGoogle}>
          Connexion avec Google 🔍
        </button>
        <button className="btn-github" onClick={loginWithGithub}>
          Connexion avec Github 🔑
        </button>
      </div>
    </>
  );
}

export default Login;
