deleteButton.addEventListener('click', function() {
  /*
  * Reveals the "are you sure" dialog
  */
    AreYouSureDialog.style.display = "block";
});

function OKClickOnAreYouSurePrompt() {
  /*
   * Performs the delete operation if OK is cliced on the Are you sure propmpt
   */
  AreYouSureDialog.style.display = "none";
  // Delete the row from database
  window.Android.deleteRowFromDb(currentIndex);
  refreshSelectElement(true);

  // Send a toast to Android about it
  window.Android.toastMessageFromJS("Route deleted successfully");
}

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