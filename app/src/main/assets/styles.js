const svgButtons = document.querySelectorAll(".svg-button");
const switchContainer = document.querySelector(".switch-container");
const buttonsClass = document.querySelectorAll(".button-class");
const dialogOkCancelButtons = document.querySelectorAll(".dialog-ok-cancel-buttons");
const closeDialogButton = document.querySelectorAll(".close-dialog-button");
const rangeSliders = document.querySelectorAll(".range-slider");
const minusButtons = document.querySelectorAll(".minus-svg-icon");
const plusButtons = document.querySelectorAll(".plus-svg-icon");

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

// This function makes buttons change color onClick and returns to normal color after 200ms
// Add a click event listener to each button
buttonsClass.forEach(function (button) {

  // Touchstart event for mobile
  button.addEventListener("touchstart", (event) => {
    if (!button.disabled)
      button.style.background = "linear-gradient(to bottom, rgba(52,152,219, 0.8), rgba(100, 175, 255, 1))";
    });

      // Touchend event for mobile
  button.addEventListener("touchend", () => {
    // Revert the touch styles
    button.style.background = ""; // Reset to default
    button.style.border = ""; // Reset to default
  });
}); 

dialogOkCancelButtons.forEach(button => {
  button.addEventListener("touchstart", function(event) {
      // Change the background color to black
      button.style.backgroundColor = "#d3d3d3";
  });
   // Touchend event for mobile
   button.addEventListener("touchend", () => {
    // Revert the touch styles
    button.style.backgroundColor = ""; // Reset to default
   // button.style.border = ""; // Reset to default
  });
});

closeDialogButton.forEach(button => {
  button.addEventListener("touchstart", function(event) {
      // Change the background color to black
      button.style.color = "black";
  });
   // Touchend event for mobile
   button.addEventListener("touchend", () => {
    // Revert the touch styles
    button.style.color = ""; // Reset to default
   // button.style.border = ""; // Reset to default
  });
});

rangeSliders.forEach(slider => { 

  slider.addEventListener("touchstart", function(event) {
    // Change the background color to black
    slider.style.opacity = "1";
});
slider.addEventListener("touchend", () => {
  // Revert the touch styles
  slider.style.opacity = "0.7";

});

});

plusButtons.forEach(button => {
  button.addEventListener("touchstart", function(event) {
    console.log("sf");
    console.log(button.src);
    button.src = 'icons/plus-icon-hover.svg';
    console.log(button.src);

  });
   button.addEventListener("touchend", () => {
    button.src = 'icons/plus-icon.svg';
  });
});

minusButtons.forEach(button => {
  button.addEventListener("touchstart", function(event) {
    button.src = 'icons/minus-icon-hover.svg';
  });
   button.addEventListener("touchend", () => {
    button.src = 'icons/minus-icon.svg';
  });
});