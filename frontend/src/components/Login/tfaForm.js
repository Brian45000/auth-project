import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../assets/formStyle.css";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function TfaForm() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  const handleCodeChange = (e) => {
    setCode(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sendLogin = async () => {
      const data = [code];
      const columnNames = ["token"];

      const jsonData = [
        data.reduce((obj, val, i) => {
          obj[columnNames[i]] = val;
          return obj;
        }, {}),
      ];

      await axios
        .post("http://localhost:5000/verify", JSON.stringify(jsonData), {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          if (res.data.status === "Error") {
            toast.error(res.data.message);
          } else {
            toast.success(res.data.message);
            setTimeout(
              navigate("/home", { state: { doubleauth: "true" } }),
              5000
            );
          }
        });
    };
    sendLogin();
    try {
    } catch (e) {}
  };

  return (
    <>
      <aside>
        <ToastContainer />
      </aside>
      <div>
        <form
          class="centered-form"
          action="#"
          method="post"
          onSubmit={handleSubmit}
        >
          <label for="authCode">Code d'Authentification à Deux Facteurs:</label>
          <input
            type="text"
            id="authCode"
            name="authCode"
            value={code}
            onChange={handleCodeChange}
            required
          />

          <button type="submit">Valider le Code</button>
        </form>
      </div>
    </>
  );
}

export default TfaForm;
