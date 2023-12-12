import React, { useState } from "react";
import axios from "axios";
import "../../assets/formStyle.css";

const UpdatePublicationForm = ({ publicationData, onUpdate }) => {
  const [title, setTitle] = useState(publicationData.title || "");
  const [date, setDate] = useState(publicationData.date || "");
  const [description, setDescription] = useState(
    publicationData.description || ""
  );

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="title">Titre de la Publication:</label>
      <input
        type="text"
        id="title"
        name="title"
        value={title}
        onChange={handleTitleChange}
        required
      />

      <label htmlFor="date">Date de la Publication:</label>
      <input
        type="datetime-local"
        id="date"
        name="date"
        value={date}
        onChange={handleDateChange}
        required
      />

      <label htmlFor="description">Description de la Publication:</label>
      <textarea
        id="description"
        name="description"
        value={description}
        onChange={handleDescriptionChange}
        required
      ></textarea>

      <button type="submit">Mettre à jour la Publication</button>
    </form>
  );
};

export default UpdatePublicationForm;
