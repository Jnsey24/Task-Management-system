import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email,setemail]=useState('');
  const [name, setname] = useState('');
  const [wakeuptime, setwakeuptime] = useState('');
  const [sleeptime, setsleeptime] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/register', new URLSearchParams({ name, username,email, password, wakeuptime, sleeptime }));
      if (response.status === 200) {
        window.location.href = '/';
      } else {
        alert('Registration failed');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      alert('Registration failed');
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = '/auth/google';
  };

  const validateWakeUpTime = (time) => {
    const [hour, minute] = time.split(':').map(Number);
    return hour >= 3 && hour <= 7;
  };
  const validatesleeptime = (time) => {
    const [hour, minute] = time.split(':').map(Number);
    return  hour>=21 && hour <= 22 ;
  };

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
        <input
          type="text"
          value={name}
          onChange={(e) => setname(e.target.value)}
          placeholder="Name"
        />
        </label>
        
        <label>
          UserName:
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />
        </label>
      {
        /*  <label>
          Email ID:
        <input
          type="email"
          value={email}
          onChange={(e) => setemail(e.target.value)}
          placeholder="Email"
        />
        </label>*/
      }  
       

        <label>
          Password:
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        </label>
     {/*  
       <label>
          Wake Up Time (between 3:00 AM and 7:00 AM):
          <input
            type="time"
            value={wakeuptime}
            onChange={(e) => {
              if (validateWakeUpTime(e.target.value)) {
                setwakeuptime(e.target.value);
              } else {
                alert('Wake up Early :)');
              }
            }}
          />
        </label>
        <label>
        Sleep Time(between 9:00PM and 11:00PM):
        <input
          type="time"
          value={sleeptime}
          onChange={(e) => {
            if(validatesleeptime(e.target.value)){
              setsleeptime(e.target.value);
            }
            else{
              alert(' Your Sleep Time is Not Acceptable :)');
            }
           
          }}
        />
        </label>
       */} 
        <button type="submit">Register</button>
      </form>
      <button onClick={handleGoogleSignIn} className="googlebutton" style={{ marginTop: '10px' }}>
        Sign in with Google
      </button>
    </div>
  );
};

export default Register;
