let endTime = null;

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url && (tab.url.includes("youtube.com/watch") || tab.url.includes("bilibili.com/video") || (tab.url.includes("plex.tv") && tab.url.includes("/watch")))) {
    const url = new URL(tab.url);
    const startTime = url.searchParams.get("t");
    endTime = url.searchParams.get("end");

    if (startTime) {
      const seconds = parseTimestamp(startTime);
      chrome.tabs.sendMessage(tabId, { action: "seekTo", time: seconds });
    }

    if (endTime) {
      endTime = parseTimestamp(endTime);
      // Start checking the timestamp
      setInterval(() => {
        chrome.tabs.sendMessage(tabId, { action: "checkTimestamp", endTime: endTime });
      }, 1000); // Check every second
    }
  }
});

function parseTimestamp(timestamp) {
  const match = timestamp.match(/(\d+)m(\d+)s/);
  if (match) {
    return parseInt(match[1]) * 60 + parseInt(match[2]);
  }
  return 0;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "timestampReached") {
    console.log("End timestamp reached, video paused");
    // You can add additional actions here if needed
  }
});
