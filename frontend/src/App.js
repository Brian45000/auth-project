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
import { Provider } from "react-redux";
import { CookiesProvider } from "react-cookie";
import store from "./store/store";
import TfaForm from "./components/Login/tfaForm";
import Enable2faForm from "./components/Login/enable-2fa";

function App() {
  return (
    <>
      <Provider store={store}>
        <CookiesProvider>
          <BrowserRouter>
            <Routes>
              <Route path="*" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify" element={<TfaForm />} />
              <Route path="/2fa" element={<TfaForm />} />
              <Route path="enable-2fa" element={<Enable2faForm />} />
            </Routes>
          </BrowserRouter>
        </CookiesProvider>
      </Provider>
    </>
  );
}

export default App;
