import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
<<<<<<< HEAD
import Policy from './pages/Policy';
import Template from './pages/Template';
=======
>>>>>>> 7226f8fdb8c3381e63b5683512ae74c7108e34d8

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/about" element={<About />} />
<<<<<<< HEAD
         <Route path="/policy" element={<Policy />} />
        <Route path="/template" element={<Template />} />
       
        

=======
>>>>>>> 7226f8fdb8c3381e63b5683512ae74c7108e34d8
      </Routes>
    </Router>
  );
};

export default App;
