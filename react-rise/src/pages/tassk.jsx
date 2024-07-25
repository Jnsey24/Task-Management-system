import React, { useState, useEffect } from "react";
import Dashboard from "./dashboard";
import Description from "../components/taskscomponents/Description";
import Note from "../components/taskscomponents/Note";
import Footer from "../components/taskscomponents/Footer";
import Task from "../components/taskscomponents/tasks";
import axios from 'axios';

function Tassk() {
  const [colorno, setColor] = useState(0);
  const [tasks, settasks] = useState([]);
  const [error, setError] = useState("");

  const changecolor = () => {
    setColor((prev) => !prev);
  };

  const bodycolor = {
    backgroundColor: colorno ? "black" : "#f1f4dc",
    color: colorno ? "white" : "black",
    height: "100vh",
  };
  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get('/api/tasks');
        settasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setError('Failed to fetch tasks.Please Login');
      }
    })();
  }, []);

  function addtask(task) {
    settasks((prev) => {return [...prev, { ...task, id: prev.length, isFixed: false }]});
  
    (async () => {
      try {
        const params = new URLSearchParams({
          title: task.title,
          alarm: task.alarm
        });
  
       await axios.post('/api/tasks', params);
      } catch (error) {
        console.error('Error adding task:', error);
      }
    })();
  }

  function handledelete(id) {
    settasks((prev) => {
      return prev.filter((item) => item.id !== id);
    });

  }

  async function deletepermanent(id) {
    try {
      await axios.delete('/api/tasks',{
        headers: {
        'Content-Type': 'application/json',
      },
      data: { id }
    });
      handledelete(id);
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task');
      setTimeout(() => setError(''), 3000); // Clear error message after 3 seconds
    }
  }

  function handledone(id) {
    const task = tasks.find((task) => task.id === id);
    const timeoftask = task.alarm;

    const date = new Date();
    const currentHours = date.getHours();
    const currentMinutes = date.getMinutes();

    const [taskTime, period] = timeoftask.split(" ");
    const [taskHours, taskMinutes] = taskTime.split(":").map(Number);

    let taskHours24 = taskHours;
    if (period.toLowerCase() === "pm" && taskHours < 12) {
      taskHours24 += 12;
    } else if (period.toLowerCase() === "am" && taskHours === 12) {
      taskHours24 = 0;
    }

    const currentTimeInMinutes = currentHours * 60 + currentMinutes;
    const taskTimeInMinutes = taskHours24 * 60 + taskMinutes;

    const timeDifference = currentTimeInMinutes - taskTimeInMinutes;

    if (timeDifference < 0) {
      setError("Sorry! Still time is there");
      setTimeout(() => setError(""), 3000); // Clear error message after 3 seconds
    } else if (timeDifference <= 10) {
      handledelete(id);
    } else {
      setError("Sorry! It's too late");
      setTimeout(() => setError(""), 3000); // Clear error message after 3 seconds
    }
  }

  return (
    <div style={bodycolor} className="container">
      <Dashboard oncolor={changecolor} colorno={colorno} />
      <Description />
      <Task addnew={addtask} />
      {tasks.map((item, index) => (
        <Note
          key={index}
          id={item.id}
          title={item.title}
          alarm={item.alarm}
          isFixed={item.isFixed}
          ondelete={deletepermanent}
          oncheck={handledone}
        />
      ))}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <Footer />
    </div>
  );
}

export default Tassk;
