import "./styles.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useCookies } from "react-cookie";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";

function NavBar() {
  const navigate = useNavigate();

  // on nomme nos Etats reacts
  const [cookies, setCookie, removeCookie] = useCookies(["tokenJWT"]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [doubleAuth, setDoubleAuth] = useState(false);
  const [email, setEmail] = useState();
  const [secretKeyExist, setSecretKeyExist] = useState();

  useEffect(() => {
    // on recupere le token JWT qui est stocké dans le cookie
    const getcheckToken = async () => {
      const data = [cookies];
      const columnNames = ["tokenJWT"];

      const jsonData = [
        data.reduce((obj, val, i) => {
          obj[columnNames[i]] = val;
          return obj;
        }, {}),
      ];
      await axios
        .post("http://localhost:5000/check-jwt", JSON.stringify(jsonData), {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((res) => {});
    };
    getcheckToken();

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
          setSecretKeyExist(res.data.secretKeyExist);
        });
    };
    getInfoToken();
  }, [cookies, removeCookie, navigate]);

  const handleLogout = async () => {
    const data = [cookies];
    const columnNames = ["tokenJWT"];

    const jsonData = [
      data.reduce((obj, val, i) => {
        obj[columnNames[i]] = val;
        return obj;
      }, {}),
    ];

    await axios
      .post("http://localhost:5000/logout", JSON.stringify(jsonData), {
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
          navigate("/home");
        }
      });
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
          <li>
            <Link to={"/dashboard"}>Espace Personnel 🔒</Link>
          </li>
        )}
        {loggedIn && (
          <li className="dropdown">
            <button className="dropbtn">Mon Compte 👇</button>
            <div className="dropdown-content">
              {!doubleAuth && (
                <>
                  {secretKeyExist && (
                    <Link to={"/verify"}>Activer mon accès Admin 🔑</Link>
                  )}

                  {!secretKeyExist && (
                    <>
                      <Link
                        to={
                          "/enable-2fa?email=" +
                          email +
                          "&tokenJWT=" +
                          cookies["tokenJWT"]
                        }
                      >
                        Mon QRCode 🖼️
                      </Link>
                    </>
                  )}
                </>
              )}
              <button className="btn-logout" onClick={() => handleLogout()}>
                Se déconnecter ❌
              </button>
              {doubleAuth && (
                <>
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
