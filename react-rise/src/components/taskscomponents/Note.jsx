import React from "react";

function Note(props) {
  function deletenote(event) {
    props.ondelete(props.id);
    event.preventDefault();
  }
  function checknote(event) {
    props.oncheck(props.id);
    event.preventDefault();
  }

  return (
    <div className="note">
      <h1>{props.title}</h1>
      <p>{props.alarm}</p>
      {!props.isFixed && <button onClick={deletenote}>DELETE</button>}
      <button onClick={checknote}>DONE</button>
    </div>
  );
}

export default Note;
