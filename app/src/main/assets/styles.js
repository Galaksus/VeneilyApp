const svgButtons = document.querySelectorAll(".svg-button");
const switchContainer = document.querySelector(".switch-container");

svgButtons.forEach(button => {
  // Mouseover event for desktop

  // Touchstart event for mobile
  button.addEventListener("touchstart", (event) => {
  // button.style.background = "linear-gradient(to bottom, rgba(52,152,219, 0.8), rgba(19, 82, 219, 1))";
   button.style.background = "linear-gradient(to bottom, rgba(148, 148, 148, 0.4), rgba(148, 148, 148, 0.5))";

  });

  // Touchend event for mobile
  button.addEventListener("touchend", () => {
    // Revert the touch styles
    button.style.background = ""; // Reset to default
    button.style.border = ""; // Reset to default
  });
});