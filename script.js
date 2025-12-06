const startBtn = document.querySelector("#start-btn");
const stopBtn = document.querySelector("#stop-btn");
const saveBtn = document.querySelector("#save-btn");
const textPad = document.querySelector("#text-pad");
const notesContainer = document.querySelector("#notes-list");
const statusText = document.querySelector("#status");
const contextMenu = document.getElementById("context-menu");
const ctxCopyBtn = document.getElementById("ctx-copy");
const ctxPasteBtn = document.getElementById("ctx-paste");

let notesArr = [];
let targetNoteText = "";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = true;
recognition.interimResults = true;

function init() {
  const LSnotes = localStorage.getItem("mySpeechNotes");
  
  if (LSnotes !== null) {
    let rawNotes = JSON.parse(LSnotes);
    
    notesArr = rawNotes.map(item => {
        if (typeof item === 'string') {
            return { id: Date.now() + Math.random(), text: item };
        }
        return item;
    });

    localStorage.setItem("mySpeechNotes", JSON.stringify(notesArr));

    notesArr.forEach(function (noteObj) {
      generateNote(noteObj);
    });
  }
}
init();

recognition.addEventListener("result", function (e) {
  const transcript = Array.from(e.results)
    .map((result) => result[0])
    .map((result) => result.transcript)
    .join("");

  textPad.value = transcript;
});

recognition.addEventListener("start", function () {
  statusText.innerText = "Listening... 🟢";
  textPad.style.borderColor = "#667eea";
  textPad.style.backgroundColor = "#fff";
});

recognition.addEventListener("end", function () {
  statusText.innerText = "Click Start to speak";
  textPad.style.borderColor = "#e2e8f0";
  textPad.style.backgroundColor = "#f7fafc";
});

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

saveBtn.addEventListener("click", function () {
  const text = textPad.value.trim();

  if (text.length > 0) {
    const noteObj = {
        id: Date.now(),
        text: text
    };

    generateNote(noteObj);
    notesArr.push(noteObj);
    localStorage.setItem("mySpeechNotes", JSON.stringify(notesArr));
    textPad.value = "";
  }
});

function generateNote(noteObj) {
  const noteDiv = document.createElement("div");
  noteDiv.setAttribute("class", "note-item");
  noteDiv.setAttribute("data-id", noteObj.id);

  noteDiv.innerHTML = `
    <p class="note-text">${noteObj.text}</p>
    <button class="delete-btn">✕</button> 
  `;

  notesContainer.prepend(noteDiv); 
}

notesContainer.addEventListener("click", function (e) {
  if (e.target.classList.contains("delete-btn")) {
    const button = e.target;
    const noteDiv = button.parentElement;
    const idToDelete = parseFloat(noteDiv.getAttribute("data-id"));
    
    noteDiv.remove();
    
    notesArr = notesArr.filter(note => note.id !== idToDelete);
    localStorage.setItem("mySpeechNotes", JSON.stringify(notesArr));
  }
});

notesContainer.addEventListener("contextmenu", function(e) {
    const noteItem = e.target.closest(".note-item");

    if (noteItem) {
        e.preventDefault(); 
        
        targetNoteText = noteItem.querySelector(".note-text").textContent;
        ctxCopyBtn.style.display = "block";
        ctxPasteBtn.style.display = "none";
        
        showMenu(e.pageX, e.pageY);
    }
});

textPad.addEventListener("contextmenu", function(e) {
    e.preventDefault();

    ctxCopyBtn.style.display = "none";
    ctxPasteBtn.style.display = "block";

    showMenu(e.pageX, e.pageY);
});

function showMenu(x, y) {
    contextMenu.style.top = `${y}px`;
    contextMenu.style.left = `${x}px`;
    contextMenu.style.display = "block";
}

document.addEventListener("click", function() {
    contextMenu.style.display = "none";
});

ctxCopyBtn.addEventListener("click", function() {
    if (targetNoteText) {
        navigator.clipboard.writeText(targetNoteText).then(() => {
            const originalText = ctxCopyBtn.innerText;
            ctxCopyBtn.innerText = "✅ Copied!";
            setTimeout(() => {
                ctxCopyBtn.innerText = "📄 Copy Text";
                contextMenu.style.display = "none";
            }, 700);
        });
    }
});

ctxPasteBtn.addEventListener("click", async function() {
    try {
        const clipText = await navigator.clipboard.readText();
        
        const cursorPosition = textPad.selectionStart;
        const textBefore = textPad.value.substring(0, cursorPosition);
        const textAfter  = textPad.value.substring(textPad.selectionEnd);

        textPad.value = textBefore + clipText + textAfter;
        
        textPad.selectionStart = textPad.selectionEnd = cursorPosition + clipText.length;
        textPad.focus();

        contextMenu.style.display = "none";
    } catch (err) {
        alert("Please allow clipboard permissions to use Paste.");
    }
});
