import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  BrowserRouter,
} from "react-router-dom";
import React, { useState, useEffect } from "react";
import Register from "./pages/Login/register";
import Login from "./pages/Login/login";
import Home from "./pages/home";
import { Provider } from "react-redux";
import { CookiesProvider } from "react-cookie";
import store from "./store/store";
import TfaForm from "./pages/Login/tfaForm";
import Enable2faForm from "./pages/Login/enable-2fa";
import Dashboard from "./pages/Dashboard/dashboard";
//import Blog from "./components/blog";
import DetailBlog from "./pages/blog/DetailBlog";
function App() {
  return (
    <>
      <Provider store={store}>
        <CookiesProvider>
          <BrowserRouter>
            <Routes>
              <Route path="*" element={<Home />} />
              {/* CONNEXION */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* VERIFICATION COMPTE */}
              <Route path="/verify" element={<TfaForm />} />
              <Route path="/2fa" element={<TfaForm />} />

              {/* ACTIVER 2FA */}
              <Route path="enable-2fa" element={<Enable2faForm />} />

              {/* ESPACE PERSONNEL */}
              <Route path="/dashboard" element={<Dashboard />} />

              {/* ACCES PUBLICATION D'UN BLOG */}
              <Route path="/blog" element={<DetailBlog />} />
            </Routes>
          </BrowserRouter>
        </CookiesProvider>
      </Provider>
    </>
  );
}

export default App;
