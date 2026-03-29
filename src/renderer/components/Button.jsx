import React from "react";

const Button = ({ 
  children, 
  onClick, 
  variant = "primary", 
  size = "medium",
  fullWidth = false,
  type = "button",
  disabled = false
}) => {
  const colors = {
    primary: {
      background: "#26957A",
      hover: "#1e7a63",
      color: "#fff",
    },
    secondary: {
      background: "#DC2626",
      hover: "#b91c1c",
      color: "#fff",
    },
    outline: {
      background: "transparent",
      hover: "#4E96E1",
      color: "#4E96E1",
      border: "1px solid #4E96E1",
    },
  };

  const sizes = {
    small: {
      padding: "6px 12px",
      fontSize: "12px",
    },
    medium: {
      padding: "10px 20px",
      fontSize: "14px",
    },
    large: {
      padding: "12px 24px",
      fontSize: "16px",
    },
  };

  const currentColor = colors[variant];
  const currentSize = sizes[size];

  const styles = {
    background: currentColor.background,
    color: currentColor.color,
    padding: currentSize.padding,
    fontSize: currentSize.fontSize,
    border: currentColor.border || "none",
    borderRadius: "8px",
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: "500",
    transition: "all 0.2s",
    width: fullWidth ? "100%" : "auto",
    opacity: disabled ? 0.6 : 1,
  };

  return (
    <button
      type={type}
      style={styles}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.target.style.background = currentColor.hover;
          if (variant === "outline") {
            e.target.style.color = "#fff";
            e.target.style.border = `1px solid ${currentColor.hover}`;
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.target.style.background = currentColor.background;
          if (variant === "outline") {
            e.target.style.color = currentColor.color;
            e.target.style.border = currentColor.border;
          }
        }
      }}
    >
      {children}
    </button>
  );
};

export default Button;
