import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  BrowserRouter,
} from "react-router-dom";
import React, { useState, useEffect } from "react";
import Register from "./components/register";
import Login from "./components/login";
import Home from "./components/home";
import Blogs from "./components/blogs";
function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Home />} />
          {/*<Route path="/blogs" element={<Blogs />} />*/}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
