// Selected Elements
const startBtn = document.querySelector("#start-btn");
const stopBtn = document.querySelector("#stop-btn");
const saveBtn = document.querySelector("#save-btn");
const textPad = document.querySelector("#text-pad");
const notesContainer = document.querySelector("#notes-list");
const statusText = document.querySelector("#status");

// Array to store notes (State)
let notesArr = [];

// Setup Speech API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = true;
recognition.interimResults = true;

// 1. Init: Load Notes from Local Storage
function init() {
  const LSnotes = localStorage.getItem("mySpeechNotes");
  
  if (LSnotes !== null) {
    notesArr = JSON.parse(LSnotes); // Update our array with saved data
    
    // Create UI for each saved note
    notesArr.forEach(function (noteText) {
      generateNote(noteText);
    });
  }
}
init();

// 2. Speech Events (Listening)
recognition.addEventListener("result", function (e) {
  // Convert results to a string
  const transcript = Array.from(e.results)
    .map((result) => result[0])
    .map((result) => result.transcript)
    .join("");

  textPad.value = transcript;
});

// UI Feedback for Start/Stop
recognition.addEventListener("start", function () {
  statusText.innerText = "Listening... 🟢";
  textPad.style.borderColor = "lightgreen";
});

recognition.addEventListener("end", function () {
  statusText.innerText = "Click Start to speak";
  textPad.style.borderColor = "#ccc";
});

// 3. Button Events
startBtn.addEventListener("click", function () {
  recognition.start();
  startBtn.disabled = true;
  stopBtn.disabled = false;
});

stopBtn.addEventListener("click", function () {
  recognition.stop();
  startBtn.disabled = false;
  stopBtn.disabled = true;
});

// 4. Save Note Event
saveBtn.addEventListener("click", function () {
  const text = textPad.value;

  // Only save if text is not empty
  if (text.trim().length > 0) {
    
    // 1. Add to DOM
    generateNote(text);

    // 2. Add to Array
    notesArr.push(text);

    // 3. Save to Local Storage
    localStorage.setItem("mySpeechNotes", JSON.stringify(notesArr));

    // 4. Clear Input
    textPad.value = "";
  }
});

// 5. Generate Note Function (DOM Creation)
function generateNote(text) {
  const noteDiv = document.createElement("div");
  noteDiv.setAttribute("class", "note-item");

  // Simple HTML structure inside the note
  noteDiv.innerHTML = `
    <p class="note-text">${text}</p>
    <button class="delete-btn">Delete</button>
  `;

  notesContainer.appendChild(noteDiv);
}

// 6. Delete Logic (Event Delegation)
// We attach the listener to the container, not individual buttons
notesContainer.addEventListener("click", function (e) {
  
  if (e.target.classList.contains("delete-btn")) {
    const button = e.target;
    const noteDiv = button.parentElement;
    
    // Get text to remove it from Array/Storage
    const textToRemove = noteDiv.querySelector(".note-text").innerText;
    
    // Remove from DOM
    noteDiv.remove();

    // Remove from Array and Update Storage
    handleDeleteStorage(textToRemove);
  }
});

// Helper to update Local Storage after delete
function handleDeleteStorage(text) {
  const idx = notesArr.indexOf(text);
  
  if (idx > -1) {
    notesArr.splice(idx, 1); // Remove item from array
  }
  
  localStorage.setItem("mySpeechNotes", JSON.stringify(notesArr));
}