import "./styles.css";
import { Link } from "react-router-dom";
function Blog(props) {
  const { title, acces, user } = props;

  return (
    <div className="blog-card">
      <p className="blog-title">{title}</p>
      <p className="blog-access">Accès : {acces}</p>
      <p className="blog-created-by">Créé par : {user}</p>
    </div>
  );
}

export default Blog;
