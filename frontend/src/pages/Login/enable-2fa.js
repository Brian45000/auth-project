import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import "../../assets/formStyle.css";
import NavBar from "../../components/NavBar";
import { useCookies } from "react-cookie";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Enable2faForm() {
  const navigate = useNavigate();
  // Utilisez useLocation pour obtenir l'objet location
  const location = useLocation();

  // Utilisez location.search pour obtenir la chaîne de requête (ex: "?param1=valeur1&param2=valeur2")
  const searchParams = new URLSearchParams(location.search);

  // Utilisez get pour récupérer la valeur d'un paramètre spécifique
  const emailUser = searchParams.get("email");
  const [cookies, setCookie] = useCookies(["tokenJWT"]);

  const [code, setCode] = useState("");
  const [imageQRCode, setImageQRCode] = useState("");
  const [secretKey, setsecretKey] = useState("");

  useEffect(() => {
    try {
      const tokenJWT = searchParams.get("tokenJWT");
      if (tokenJWT) {
        setCookie("tokenJWT", tokenJWT, { path: "/" });
      }
    } catch (error) {
      console.log(error);
    }

    const getQrCode = async () => {
      await axios
        .get(`http://localhost:5000/qrcode/${emailUser}`)
        .then((res) => {
          if (res.data.status === "Error") {
            toast.error(res.data.message);
          } else {
            setsecretKey(res.data.secretKey);
            setImageQRCode(res.data.qrcode);
          }
        });
    };
    getQrCode();
  }, []);

  const handleCodeChange = (e) => {
    setCode(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sendLogin = async () => {
      const data = [code, emailUser, cookies, secretKey];
      const columnNames = ["token", "emailUser", "tokenJWT", "secretKey"];

      const jsonData = [
        data.reduce((obj, val, i) => {
          obj[columnNames[i]] = val;
          return obj;
        }, {}),
      ];

      await axios
        .post("http://localhost:5000/enable-2fa", JSON.stringify(jsonData), {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          if (res.data.status === "Error") {
            toast.error(res.data.message);
          } else {
            toast.success(res.data.message);
            navigate("/home");
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
          <label for="authCode">
            Voulez vous activer l'Authentification à Deux Facteurs:
          </label>

          {imageQRCode && (
            <div dangerouslySetInnerHTML={{ __html: imageQRCode }} />
          )}

          <label for="authCode">Saisir le code:</label>
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

export default Enable2faForm;
