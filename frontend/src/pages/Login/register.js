import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../../assets/formStyle.css";
import NavBar from "../../components/NavBar";

function Register() {
  const [values, setValues] = React.useState({
    fullname: "",
    email: "",
    newUsername: "",
    newPassword: "",
  });

  const handleChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const sendRegister = async () => {
        const data = [
          values.fullname,
          values.email,
          values.newUsername,
          values.newPassword,
        ];
        const columnNames = ["fullname", "email", "newUsername", "newPassword"];

        const jsonData = [
          data.reduce((obj, val, i) => {
            obj[columnNames[i]] = val;
            return obj;
          }, {}),
        ];

        await axios
          .post("http://localhost:5000/register", JSON.stringify(jsonData), {
            headers: {
              "Content-Type": "application/json",
            },
          })
          .then((res) => {});
      };
      sendRegister();
    } catch (e) {}
  };

  const registerWithGoogle = () => {
    // Redirige vers l'authentification Google
    window.location.href = "http://localhost:5000/auth/google";
  };

  const registerWithGithub = () => {
    // Redirige vers l'authentification Google
    window.location.href = "http://localhost:5000/auth/github";
  };

  return (
    <>
      <NavBar />

      <div className="card-login">
        <form
          className="centered-form"
          action="#"
          method="post"
          onSubmit={handleSubmit}
        >
          <label for="fullname">Nom Complet :</label>
          <input
            type="text"
            id="fullname"
            name="fullname"
            value={values.fullname}
            onChange={handleChange("fullname")}
            placeholder="Saisir votre Nom"
            required
          />

          <label for="email">Adresse Email :</label>
          <input
            type="email"
            id="email"
            name="email"
            value={values.email}
            onChange={handleChange("email")}
            placeholder="Saisir votre Email"
            required
          />

          <label for="newUsername">Identifiant :</label>
          <input
            type="text"
            id="newUsername"
            name="newUsername"
            value={values.newUsername}
            onChange={handleChange("newUsername")}
            placeholder="Saisir votre Username"
            required
          />

          <label for="newPassword">Mot de passe :</label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={values.newPassword}
            onChange={handleChange("newPassword")}
            placeholder="Saisir votre Mot de passe"
            required
          />

          <button type="submit">S'inscrire</button>

          <button type="button" className="btn-retour">
            <Link to="/login">Retour</Link>
          </button>
        </form>
        <button className="btn-google" onClick={registerWithGoogle}>
          Connexion avec Google 🔍
        </button>
        <button className="btn-github" onClick={registerWithGithub}>
          Connexion avec Github 🔑
        </button>
      </div>
    </>
  );
}

export default Register;
