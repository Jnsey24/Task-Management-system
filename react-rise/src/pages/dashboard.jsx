import React,{useState,useEffect} from "react";
import { Link } from "react-router-dom";
import axios from 'axios';


function Dashboard(props) {

  const [isloggedin,setlog]=useState(false);
  const [user,setuser]=useState(null);
  
  const changetheme = () => {
    props.oncolor();
  };

  const buttonStyle = {
    backgroundColor: props.colorno ? "blue" : "#4caf50",
  };
 
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/check-auth');
        if (response.data.loggedIn) {
          console.log("hi i entered heree");
          setlog(true);
          setuser(response.data.user);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      }
    };
  
    checkAuth();
  }, []);
  

  return (
    <header>
      <h1>Rise Up</h1>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/task">Tasks</Link>
          </li>
          <li>
            <Link to="/shop">Shop</Link>
          </li>
          <li>
            <Link to="/profile">My Profile</Link>
          </li>
        </ul>
      </nav>
      <div className="header-right">
        <button
          style={buttonStyle}
          className="light-button"
          onClick={changetheme}
        >
          dark mode</button>
          {isloggedin ?(
            <div>
              <span className="nameclass">Welcome {user.name}</span>
              <Link to="/logout" className="login-button">Logout</Link>
            </div>
             
          ):(
            <div>
               <Link to="/login" className="login-button">Login</Link>
          
            </div>
           
          )}
       
      </div>
    </header>
  );
}

export default Dashboard;
