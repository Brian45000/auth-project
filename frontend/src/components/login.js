import React, { useState } from "react";
import axios from "axios";
import "../assets/login.css";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Login() {
  const [identifiant, setIdentifiant] = useState("");
  const [mdp, setMdp] = useState("");

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

  return (
    <>
      <aside>
        <ToastContainer />
      </aside>
      <form action="#" method="post" onSubmit={handleSubmit}>
        <label htmlFor="username">Adresse mail:</label>
        <input
          type="text"
          id="username"
          name="username"
          value={identifiant}
          onChange={handleIdentifiantChange}
          required
        />

        <label htmlFor="password">Mot de passe:</label>
        <input
          type="password"
          id="password"
          name="password"
          value={mdp}
          onChange={handleMdpChange}
          required
        />

        <button type="submit">Se Connecter</button>
      </form>
      <button onClick={loginWithGoogle}>Connexion avec Google</button>
    </>
  );
}

export default Login;
