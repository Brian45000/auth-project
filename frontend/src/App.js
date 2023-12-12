import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  BrowserRouter,
} from "react-router-dom";
import React, { useState, useEffect } from "react";
import Register from "./components/Login/register";
import Login from "./components/Login/login";
import Home from "./components/home";

import TfaForm from "./components/Login/tfaForm";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<TfaForm />} />
          <Route path="/2fa" element={<TfaForm />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
