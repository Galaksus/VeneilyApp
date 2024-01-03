deleteButton.addEventListener('click', function() {

    // refresh select element
    //refreshSelectElement(true);

    // Delete the row from database
    window.Android.deleteRowFromDb(currentIndex);
    refreshSelectElement(true);

    // Send a toast to Android about it
    window.Android.toastMessageFromJS("Route deleted successfully");

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