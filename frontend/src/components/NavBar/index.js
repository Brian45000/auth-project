import "./styles.css";
import { Link } from "react-router-dom";

function NavBar() {
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
            <Link to={"/2fa"}>TFA Form 🔑</Link>
            <Link to={"/qrcode"}>Mon QRCode 🖼️</Link>
            <Link to={"/logout"}>Se déconnecter ❌</Link>
          </div>
        </li>
      </ul>
    </nav>
  );
}

export default NavBar;
