import React, { useState } from "react";
import Dashboard from "./dashboard";

const Profile = () => {
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
    <div style={bodycolor} >
    <Dashboard oncolor={changecolor} className="container" colorno={colorno} />
      <h1>Profile Page</h1>
      <p>Welcome to your Profile Page</p>
    </div>
  );
};

export default Profile;
