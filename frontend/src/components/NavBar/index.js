import "./styles.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { user_info } from "../../store/selector";
import { useSelector } from "react-redux";
import { useCookies } from "react-cookie";
import axios from "axios";

function NavBar() {
  let user = useSelector(user_info);
  const navigate = useNavigate();

  const [cookies, setCookie, removeCookie] = useCookies(["tokenJWT"]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [doubleAuth, setDoubleAuth] = useState(false);
  const [email, setEmail] = useState();

  useEffect(() => {
    const getInfoToken = async () => {
      const data = [cookies];
      const columnNames = ["tokenJWT"];

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
          setEmail(res.data.email);
          setLoggedIn(res.data.loggedIn);
          setDoubleAuth(res.data.doubleAuthent);
        });
    };
    getInfoToken();
  }, [cookies]);

  const handleLogout = (e) => {
    removeCookie(["tokenJWT"]);
  };

  return (
    <nav className="navbar">
      <ul>
        <li>
          <Link to={"/home"}>Accueil 🏠</Link>
        </li>
        {!loggedIn && (
          <li>
            <Link to={"/login"}>Se connecter 🔑</Link>
          </li>
        )}
        {loggedIn && doubleAuth && (
          <li className="dropdown">
            <button className="dropbtn">Mes espaces 👇</button>
            <div className="dropdown-content">
              <Link to={"/2fa"}>Créer un espace ➕</Link>
              <Link to={"/qrcode"}>Ajouter une publication ➕</Link>
              <Link to={"/logout"}>Modifier une publication ✏️</Link>
              <Link to={"/logout"}>Supprimer une publication ❌</Link>
            </div>
          </li>
        )}
        {loggedIn && (
          <li className="dropdown">
            <button className="dropbtn">Mon Compte 👇</button>
            <div className="dropdown-content">
              {!doubleAuth && (
                <>
                  <Link to={"/verify"}>Activer mon accès Admin 🔑</Link>
                  <Link to={"/qrcode/" + email}>Mon QRCode 🖼️</Link>
                </>
              )}
              <button className="btn-logout" onClick={() => handleLogout()}>
                Se déconnecter ❌
              </button>
              {doubleAuth && (
                <>
                  <Link to={"/dashboard"}>Espace Personnel 🔒</Link>
                  <Link to={"/logoutAll"}>Se déconnecter de PARTOUT ❌</Link>
                </>
              )}
            </div>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default NavBar;
