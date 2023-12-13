import "./styles.css";
import { Link } from "react-router-dom";
import { user_info } from "../../store/selector";
import { useSelector } from "react-redux";
function NavBar() {
  let user = useSelector(user_info);
  return (
    <nav className="navbar">
      <ul>
        <li>
          <Link to={"/home"}>Accueil 🏠</Link>
        </li>
        <li>
          <Link to={"/login"}>Se connecter 🔑</Link>
        </li>
        <li className="dropdown">
          <button className="dropbtn">Mes espaces 👇</button>
          <div className="dropdown-content">
            <Link to={"/2fa"}>Créer un espace ➕</Link>
            <Link to={"/qrcode"}>Ajouter une publication ➕</Link>
            <Link to={"/logout"}>Modifier une publication ✏️</Link>
            <Link to={"/logout"}>Supprimer une publication ❌</Link>
          </div>
        </li>
        <li className="dropdown">
          <button className="dropbtn">Mon Compte 👇</button>
          <div className="dropdown-content">
            <Link to={"/verify"}>Activer mon accès 2FA 🔑</Link>
            <Link to={"/qrcode"}>Mon QRCode 🖼️</Link>
            <Link to={"/logout"}>Se déconnecter ❌</Link>
            <Link to={"/logoutAll"}>Se déconnecter de PARTOUT ❌</Link>
          </div>
        </li>
      </ul>
    </nav>
  );
}

export default NavBar;
