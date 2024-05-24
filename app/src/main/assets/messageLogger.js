const messageContainer = document.getElementById('messages');
const messagesButton = document.getElementById('messages-button');
const messageDialog = document.getElementById('message-dialog');
const placeholder = document.getElementById('placeholder-message');
const messagesIcon = document.getElementById('messages-button-src');

messagesButton.addEventListener("click", function () {
    messageDialog.style.display = "block";
    messagesIcon.src = 'icons/message-icon.svg';
});

function toggleOverflow(messageElement) {
    messageElement.classList.toggle('overflow');
}

function getCurrentTimestamp() {
    const now = new Date();
    const timestamp = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    return timestamp;
}

function logMessage(message, severity) {
    severity = severity.toLowerCase();

    const timestamp = getCurrentTimestamp();
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${severity}`;
    messageElement.onclick = () => toggleOverflow(messageElement);
    
    const messageText = document.createElement('span');
    messageText.className = 'message-text';
    messageText.textContent = message;
            
    const timestampSpan = document.createElement('span');
    timestampSpan.className = 'timestamp';
    timestampSpan.textContent = timestamp;
    
    const closeButton = document.createElement('span');
    closeButton.className = 'close-btn';
    closeButton.innerHTML = '&#10006;';
    closeButton.onclick = (event) => {
        event.stopPropagation();
        messageElement.remove();
       // updatePlaceholder();
    };
    
    // Add touch event listeners to the close button
    closeButton.addEventListener("touchstart", function(event) {
        closeButton.style.color = "black";
    });

    closeButton.addEventListener("touchend", () => {
        closeButton.style.color = ""; // Reset to default
    });
    
    messageElement.appendChild(messageText);
    messageElement.appendChild(timestampSpan);
    messageElement.appendChild(closeButton);
    
    // Insert the new message element at the top of the container
    if (messageContainer.firstChild) {
        messageContainer.insertBefore(messageElement, messageContainer.firstChild);
    } else {
        messageContainer.appendChild(messageElement);
    }
    
    updatePlaceholder();
}


function filterMessages() {
    const filterValue = document.getElementById('filter').value;
    const messages = document.querySelectorAll('.message');
    messages.forEach(message => {
        if (filterValue === 'all' || message.classList.contains(filterValue)) {
            message.style.display = '';
        } else {
            message.style.display = 'none';
        }
    });
}

function clearMessages() {
    messageContainer.innerHTML = '';
    updatePlaceholder();
}

function updatePlaceholder() {
    if (messageContainer.children.length === 0) {
        placeholder.style.display = 'block';
        messagesIcon.src = 'icons/message-icon.svg'; // Change to no messages icon
    } else {
        placeholder.style.display = 'none';
        messagesIcon.src = 'icons/message-alert-icon.svg'; // Change to messages icon
    }
}

// Example usage
logMessage('This is an info message that is particularly long and should not overflow the container.', 'info');
logMessage('This is a warning message', 'warning');
logMessage('This is an error message', 'error');
