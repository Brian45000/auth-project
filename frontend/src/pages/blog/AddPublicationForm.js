import React, { useState } from "react";
import axios from "axios";
import "../../assets/formStyle.css";

const AddPublicationForm = () => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

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
    <form class="centered-form" onSubmit={handleSubmit}>
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

      <button type="submit">Ajouter la Publication</button>
    </form>
  );
};

export default AddPublicationForm;
