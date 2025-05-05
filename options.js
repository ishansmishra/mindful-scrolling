const input = document.getElementById("threshold");
const saveBtn = document.getElementById("save");

// Load existing setting
chrome.storage.sync.get(['pauseThreshold'], (data) => {
  input.value = data.pauseThreshold || 30;
});

saveBtn.addEventListener("click", () => {
  const value = parseInt(input.value, 10);
  chrome.storage.sync.set({ pauseThreshold: value }, () => {
    alert("Saved!");
  });
});
