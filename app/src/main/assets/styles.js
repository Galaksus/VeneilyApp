const svgButtons = document.querySelectorAll(".svg-button");
const switchContainer = document.querySelector(".switch-container");

svgButtons.forEach(button => {
  // Mouseover event for desktop

  // Touchstart event for mobile
  button.addEventListener("touchstart", (event) => {
   button.style.background = "linear-gradient(to bottom, rgba(52,152,219, 0.8), rgba(19, 82, 219, 1))";
  });

  // Touchend event for mobile
  button.addEventListener("touchend", () => {
    // Revert the touch styles
    button.style.background = ""; // Reset to default
    button.style.border = ""; // Reset to default
  });
});

// Touchstart event for switch container
switchContainer.addEventListener("touchstart", (event) => {
    switchContainer.style.background = "linear-gradient(to bottom, rgba(52,152,219, 0.8), rgba(19, 82, 219, 1))";
    
    // Add touch styles for the switch container here
  });
  
  // Touchend event for switch container
  switchContainer.addEventListener("touchend", () => {
    // Revert the touch styles for the switch container here
    switchContainer.style.background = ""; // Reset to default
    switchContainer.style.border = ""; // Reset to default
  });