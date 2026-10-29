document.addEventListener("DOMContentLoaded", () => {
  const switchContainer = document.getElementById("toggle-switch");
  const statusLabel = document.getElementById("status-label");

  function updateUI(enabled) {
    if (enabled) {
      switchContainer.classList.add("active");
      statusLabel.classList.add("active");
      statusLabel.textContent = "Protected";
    } else {
      switchContainer.classList.remove("active");
      statusLabel.classList.remove("active");
      statusLabel.textContent = "Paused";
    }
  }

  // Get status
  chrome.runtime.sendMessage({ type: "GET_STATUS" }, (response) => {
    if (response) {
      updateUI(response.enabled);
    }
  });

  // Toggle on click
  switchContainer.addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "TOGGLE_BLOCKING" }, (response) => {
      if (response) {
        updateUI(response.enabled);
      }
    });
  });
});
