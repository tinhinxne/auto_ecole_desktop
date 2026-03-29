import React from "react";
import "../../styles/Button.css";

const AddButton = ({ text = "Ajouter", onClick }) => {
  return (
    <button className="add-btn" onClick={onClick}>
      <span className="icon">＋</span>
      {text}
    </button>
  );
};

export default AddButton;