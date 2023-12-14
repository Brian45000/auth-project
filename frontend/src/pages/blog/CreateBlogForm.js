import React, { useState } from "react";
import axios from "axios";
import "../../assets/formStyle.css";

const CreateBlogForm = () => {
  const [title, setTitle] = useState("");
  const [access, setAccess] = useState("Public"); // Default to Public access

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleAccessChange = (e) => {
    setAccess(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Ajouter le lien avec le BackEnd
  };

  return (
    <form class="centered-form" onSubmit={handleSubmit}>
      <label htmlFor="title">Titre du Blog:</label>
      <input
        type="text"
        id="title"
        name="title"
        value={title}
        onChange={handleTitleChange}
        required
      />

      <label htmlFor="access">Accès du Blog:</label>
      <select
        id="access"
        name="access"
        value={access}
        onChange={handleAccessChange}
      >
        <option value="Public">Public</option>
        <option value="Private">Privé</option>
      </select>

      <button type="submit">Créer le Blog</button>
    </form>
  );
};

export default CreateBlogForm;
