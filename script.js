const startBtn = document.querySelector("#start-btn");
const stopBtn = document.querySelector("#stop-btn");
const saveBtn = document.querySelector("#save-btn");
const textPad = document.querySelector("#text-pad");
const notesList = document.querySelector("#notes-list");
const statusText = document.querySelector("#status");

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'en-US';

let finalTranscript = "";

function updateStorage() {
    localStorage.setItem("voiceNotesData", notesList.innerHTML);
}

if (localStorage.getItem("voiceNotesData")) {
    notesList.innerHTML = localStorage.getItem("voiceNotesData");
}

window.deleteNote = function(btn) {
    btn.parentElement.remove();
    updateStorage();
}

startBtn.addEventListener("click", () => {
    finalTranscript = "";
    textPad.value = "";
    recognition.start();
    startBtn.disabled = true;
    stopBtn.disabled = false;
    statusText.innerText = "Listening... 🟢";
});

stopBtn.addEventListener("click", () => {
    recognition.stop();
    startBtn.disabled = false;
    stopBtn.disabled = true;
    statusText.innerText = "Click Start to speak";
});

recognition.addEventListener("result", (e) => {
    let interim = "";
    const result = e.results[e.resultIndex];
    
    if (result.isFinal) {
        finalTranscript += result[0].transcript + " ";
    } else {
        interim = result[0].transcript;
    }
    textPad.value = finalTranscript + interim;
});

saveBtn.addEventListener("click", () => {
    if (textPad.value.trim() === "") return;

    const div = document.createElement("div");
    div.className = "note-item";
    
    div.innerHTML = `
        <p class="note-text">${textPad.value}</p>
        <button class="delete-btn" onclick="deleteNote(this)">✕</button>
    `;
    
    notesList.prepend(div);
    updateStorage();
    
    textPad.value = "";
    finalTranscript = "";
});
