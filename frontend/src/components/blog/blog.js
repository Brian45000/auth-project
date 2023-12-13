import "./styles.css";
import { Link } from "react-router-dom";

function Blog(props) {
  const { id, title, access, user, numPublications, name, nb_publi } = props;

  return (
    <div className="blog-card">
      <p className="blog-title">{title}</p>
      <p className="blog-access">Accès : {access}</p>
      <p className="blog-created-by">Créé par : {name}</p>
      <p className="num-publications">Publications : {nb_publi}</p>
      <Link to={`/blog/${id}`}>
        <button className="detail-button">Parcourir</button>
      </Link>
    </div>
  );
}

export default Blog;
