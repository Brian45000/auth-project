import "./styles.css";
function Publication(props) {
  const { title, date_creation, description, user_fullname } = props;

  return (
    <div className="publication-card">
      <p className="publication-title">{title}</p>
      <p className="publication-created-by">Créé par : {user_fullname}</p>
      <p className="publication-created-by">Créé le : {date_creation}</p>
      <p className="publication-desc">{description}</p>
    </div>
  );
}

export default Publication;
