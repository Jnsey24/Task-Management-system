import React, { useState } from "react";
import Dashboard from "./dashboard";

const Home = () => {
  console.log("entered HOME")
    const [colorno, setColor] = useState(0);
    const changecolor = () => {
        setColor((prev) => !prev);
      };
    
      const bodycolor = {
        backgroundColor: colorno ? "black" : "#f1f4dc",
        color: colorno ? "white" : "black",
        height: "100vh",
      };
    
  return (
    <div style={bodycolor} className="container">
    <Dashboard oncolor={changecolor} colorno={colorno} />
      <h1>Home Page</h1>
      <p>Welcome to the Home Page</p>
    </div>
  );
};

export default Home;
