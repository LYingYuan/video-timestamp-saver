let videoStartTime = null;
let videoEndTime = null;

function getCurrentTimestamp() {
  let video;
  if (window.location.hostname.includes('youtube.com')) {
    video = document.querySelector('video');
  } else if (window.location.hostname.includes('bilibili.com')) {
    video = document.querySelector('#bilibili-player video');
  } else if (window.location.hostname.includes('plex.tv')) {
    video = document.querySelector('video');
  }
  
  if (video) {
    return Math.floor(video.currentTime);
  }
  return null;
}

function formatTimestamp(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m${remainingSeconds}s`;
}

function copyTimestampToClipboard(start, end) {
  let currentUrl = window.location.href.split('&t=')[0].split('&end=')[0];
  let separator = currentUrl.includes('?') ? '&' : '?';
  
  if (start !== null) {
    currentUrl += `${separator}t=${formatTimestamp(start)}`;
    separator = '&';
  }
  
  if (end !== null) {
    currentUrl += `${separator}end=${formatTimestamp(end)}`;
  }

  return new Promise((resolve) => {
    navigator.clipboard.writeText(currentUrl).then(() => {
      console.log('Timestamp URL copied to clipboard');
      resolve(true);
    }).catch(err => {
      console.error('Failed to copy: ', err);
      // 如果剪贴板 API 失败，尝试使用传统方法
      const textArea = document.createElement("textarea");
      textArea.value = currentUrl;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        console.log('Timestamp URL copied to clipboard (fallback method)');
        resolve(true);
      } catch (err) {
        console.error('Failed to copy (fallback method): ', err);
        resolve(false);
      }
      document.body.removeChild(textArea);
    });
  });
}

function setupVideoLoop() {
  const video = document.querySelector('video');
  if (!video) return;

  video.addEventListener('timeupdate', () => {
    if (videoEndTime !== null && video.currentTime >= videoEndTime) {
      video.pause();
      video.currentTime = videoStartTime;
    }
  });
}

function parseTimestamp(timestamp) {
  const match = timestamp.match(/(\d+)m(\d+)s/);
  if (match) {
    return parseInt(match[1]) * 60 + parseInt(match[2]);
  }
  return 0;
}

function initializeFromURL() {
  const url = new URL(window.location.href);
  const startParam = url.searchParams.get('t');
  const endParam = url.searchParams.get('end');

  if (startParam) {
    videoStartTime = parseTimestamp(startParam);
  }
  if (endParam) {
    videoEndTime = parseTimestamp(endParam);
  }

  if (videoStartTime !== null) {
    const video = document.querySelector('video');
    if (video) {
      video.currentTime = videoStartTime;
    }
  }

  setupVideoLoop();
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getTimestamp") {
    sendResponse({timestamp: getCurrentTimestamp()});
  } else if (request.action === "exportTimestamp") {
    copyTimestampToClipboard(request.start, request.end).then(success => {
      sendResponse({success: success});
    });
    return true; // Indicates that the response is sent asynchronously
  } else if (request.action === "seekTo") {
    const video = document.querySelector('video');
    if (video) {
      video.currentTime = request.time;
    }
  }
});

// Initialize when the script loads
initializeFromURL();

// Re-initialize when the URL changes (for single-page applications like YouTube)
let lastUrl = location.href; 
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    initializeFromURL();
  }
}).observe(document, {subtree: true, childList: true});