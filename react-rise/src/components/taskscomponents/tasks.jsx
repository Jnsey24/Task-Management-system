import React, { useState } from "react";
function Task(props) {
  const [task, settask] = useState({ title: "", alarm: "" });
  const [error, setError] = useState("");
  function handlechange(event) {
    const { name, value } = event.target;
    settask((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  }
  function validateTime(time) {
    const timePattern = /^(0?[1-9]|1[0-2]):[0-5][0-9] ?[APap][Mm]$/;
    return timePattern.test(time);
  }

  function submit(event) {
    event.preventDefault();
    if (!validateTime(task.alarm)) {
      setError("Invalid time format. Please use HH:MM AM/PM format.");
      return;
    }
    props.addnew(task);
    settask({ title: "", alarm: "" });
    setError("");
  }
  return (
    <div>
      <form onSubmit={submit}>
        <textarea
          placeholder="enter your task"
          onChange={handlechange}
          name="title"
          value={task.title}
          rows="2"
        />
        <input
          name="alarm"
          onChange={handlechange}
          value={task.alarm}
          placeholder="set your time (ex:6:30 AM)"
        />
        <button type="submit">Save</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
export default Task;
