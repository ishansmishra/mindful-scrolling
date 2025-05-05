let pauseThreshold = 30;
let paused = false;
let nextPauseAt = pauseThreshold;
let popupCount = 0;
const seenTweetIds = new Set();

const createOverlay = () => {
  if (document.getElementById("mindful-overlay")) return;

  paused = true;
  popupCount++;

  const overlay = document.createElement("div");
  overlay.id = "mindful-overlay";
  overlay.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(10px);
    background: rgba(0, 0, 0, 0.4);
    z-index: 99999;
    color: #fff;
    font-family: sans-serif;
  `;

  const message = document.createElement("p");
  message.innerText = popupCount === 1
    ? "You've already scrolled a page. Want a quick breather?"
    : `You've already read ${popupCount} pages. Want a quick breather?`;
  message.style.cssText = "font-size: 20px; margin-bottom: 20px; text-align: center;";

  const button = document.createElement("button");
  button.innerText = "Continue Scrolling";
  button.style.cssText = `
    padding: 12px 24px;
    font-size: 16px;
    background: #1da1f2;
    color: #fff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  `;
  button.onclick = () => {
    paused = false;
    nextPauseAt = seenTweetIds.size + pauseThreshold;
    overlay.remove();
  };

  overlay.append(message, button);
  document.body.appendChild(overlay);
};

const checkTweets = () => {
  if (paused) return;

  const tweets = document.querySelectorAll('article[data-testid="tweet"], div[data-testid="tweet"]');
  tweets.forEach(tweet => {
    const id = tweet.getAttribute("data-tweet-id") ||
      tweet.querySelector('a[href*="/status/"]')?.href ||
      tweet.textContent;
    if (id) seenTweetIds.add(id);
  });

  if (seenTweetIds.size >= nextPauseAt) {
    createOverlay();
  }
};

// ✅ Load threshold, then start script
chrome.storage.sync.get(['pauseThreshold'], (data) => {
  pauseThreshold = data.pauseThreshold || 30;
  nextPauseAt = pauseThreshold;

  console.log(`Pause threshold loaded: ${pauseThreshold}`);

  // Start observing tweets after threshold is ready
  const observer = new MutationObserver((mutations) => {
    if (mutations.some(m => m.addedNodes.length > 0)) checkTweets();
  });

  observer.observe(document.body, { childList: true, subtree: true });
  checkTweets();
});
