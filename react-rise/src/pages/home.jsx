import React, { useState } from "react";
import Dashboard from "./dashboard";

const Home = () => {
  const [colorno, setColor] = useState(0);
  
  const changecolor = () => {
    setColor((prev) => !prev);
  };

  const bodycolor = {
    backgroundColor: colorno ? "black" : "#f1f4dc",
    color: colorno ? "white" : "black",
    height: "100vh",
    transition: "background-color 0.5s, color 0.5s"
  };

  return (
    <div style={bodycolor} >
      <Dashboard oncolor={changecolor} className="container" colorno={colorno} />
      <section className="description">
        <h2>About Rise Up</h2>
        <div className="description-box">
          <p>Rise Up is your personal task management platform.</p>
        </div>
        <div className="description-box">
          <p>Complete your daily tasks and earn coins!</p>
        </div>
        <div className="description-box">
          <p>Use your coins in our shop platform to get exciting rewards.</p>
        </div>
        <div className="description-box">
          <p>Stay productive and rise up to the challenges every day!</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
