import "./styles.css";
import { Link } from "react-router-dom";
function NavBar() {
  return (
    <nav class="navbar">
      <ul>
        <li>
          <Link to={"/home"}> Accueil</Link>
        </li>
        <li>
          <a href="#">Mon espace</a>
        </li>
        <li>
          <Link to={"/login"}> Se connecter </Link>
        </li>
        <li>
          <Link to={"/logout"}>Se déconnecter</Link>
        </li>
      </ul>
    </nav>
  );
}

export default NavBar;
