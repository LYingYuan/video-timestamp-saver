let startTimestamp = null;
let endTimestamp = null;

document.addEventListener("DOMContentLoaded", function () {
  const startBtn = document.getElementById("startBtn");
  const endBtn = document.getElementById("endBtn");
  const exportBtn = document.getElementById("exportBtn");

  startBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "getTimestamp" }, function (response) {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          return;
        }
        if (response && response.timestamp !== null) {
          startTimestamp = response.timestamp;
          endBtn.disabled = false;
          exportBtn.disabled = false;
          startBtn.disabled = true;
        } else {
          console.error("Invalid response:", response);
        }
      });
    });
  });

  endBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "getTimestamp" }, function (response) {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          return;
        }
        if (response && response.timestamp !== null) {
          endTimestamp = response.timestamp;
          endBtn.disabled = true;
        } else {
          console.error("Invalid response:", response);
        }
      });
    });
  });

  exportBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        {
          action: "exportTimestamp",
          start: startTimestamp,
          end: endTimestamp,
        },
        function (response) {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            return;
          }
          if (response && response.success) {
            startTimestamp = null;
            endTimestamp = null;
            startBtn.disabled = false;
            endBtn.disabled = true;
            exportBtn.disabled = true;
          } else {
            console.error("Export failed:", response);
          }
        }
      );
    });
  });
});
