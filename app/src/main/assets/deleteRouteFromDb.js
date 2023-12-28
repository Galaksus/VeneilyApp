deleteButton.addEventListener('click', function() {
    const routesSelectElement = document.getElementById("routes");
    const selectedOption = routesSelectElement.options[routesSelectElement.selectedIndex];
    const optionName = selectedOption.text;

    const selectedIndex = routesSelectElement.selectedIndex;

    // refresh select element
    refreshSelectElement(true);

    // Delete the row from database
    window.Android.deleteRowFromDb(selectedIndex);
    // Send a toast to Android about it
    window.Android.toastMessageFromJS("Route: '" + optionName + "' was deleted");

    // TODO tähän joku dialogi josta checkki että haluaako varmasti poistaa? Älä käytä prompt("") näytti aivan paskalta Androidilla
});

function refreshSelectElement(mapWillBeCleared) {
  deleteButton.style.display = "none";
  // Refreshes select element by creating it again
  var script = document.createElement('script');
  script.src = 'readDb.js';
  document.head.appendChild(script);
  var oldScript = document.querySelector('script[src="readDb.js"]');
  oldScript.parentNode.removeChild(oldScript);

  // Call clear map, called from route.js file
  if (mapWillBeCleared) {
      window.clearMap();
  }
}