/**
 * Utility functions for the Grocery List application
 */

/**
 * Clean an ingredient name by removing quantity suffixes and extra whitespace
 * @param {string} ingredient - The ingredient name to clean
 * @returns {string} Cleaned ingredient name
 */
function cleanIngredientName(ingredient) {
  if (!ingredient) return '';
  
  // Remove quantity suffix (e.g., "Eggs 2x" -> "Eggs")
  return ingredient.trim().replace(/\s+\d+x$/, '');
}

/**
 * Save data to localStorage with error handling
 * @param {string} key - Storage key
 * @param {any} data - Data to store (will be JSON stringified)
 * @returns {boolean} True if successful, false if error occurred
 */
function saveToLocalStorage(key, data) {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error(`Failed to save to localStorage: ${error}`);
    return false;
  }
}

/**
 * Load data from localStorage with error handling
 * @param {string} key - Storage key to retrieve
 * @param {any} defaultValue - Default value if key doesn't exist or error occurs
 * @returns {any} Retrieved value or defaultValue
 */
function loadFromLocalStorage(key, defaultValue = null) {
  try {
    const serialized = localStorage.getItem(key);
    if (serialized === null) return defaultValue;
    return JSON.parse(serialized);
  } catch (error) {
    console.error(`Failed to load from localStorage: ${error}`);
    return defaultValue;
  }
}

/**
 * Show a temporary message/notification to the user
 * @param {string} message - Message to display
 * @param {string} type - Message type (success, error, info)
 * @param {number} duration - Time in ms to show message
 */
function showNotification(message, type = 'info', duration = 3000) {
  // Check if notification container exists
  let container = document.getElementById('notification-container');
  
  // Create it if it doesn't exist
  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-container';
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.right = '20px';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `alert alert-${type} notification`;
  notification.innerHTML = message;
  notification.style.marginBottom = '10px';
  notification.style.transition = 'opacity 0.5s';
  
  // Add to container
  container.appendChild(notification);
  
  // Fade out and remove
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      container.removeChild(notification);
    }, 500);
  }, duration);
}