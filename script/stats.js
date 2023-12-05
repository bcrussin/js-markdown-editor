const totalNotesText = document.getElementById("total-notes-value");
const totalCharsText = document.getElementById("total-chars-value");
const longestNoteLink = document.getElementById("longest-note-link");
const longestNoteText = document.getElementById("longest-note-value");

let totalNotes = 0;
let totalChars = 0;

window.onload = () => {
	checkLocalStorage();
	getStats();
};

function checkLocalStorage() {
	notes = JSON.parse(localStorage.getItem("notes"));

	if (notes == undefined) {
		notes = {};
		saveNotes();
		editor.value = "";
		return;
	}
}

function getStats() {
	totalNotes = Object.keys(notes).length;
	totalNotesText.innerHTML = totalNotes;

	let maxChars = 0;
	totalChars = Object.values(notes).map((note) => {
		if (note["markdown"].length > maxChars) maxChars = note["markdown"].length;
	});
	totalCharsText.innerHTML = maxChars;

	let maxNoteName = "N/A";
	let maxNoteLength = 0;
	Object.entries(notes).map(([key, value]) => {
		if (value["markdown"].length > maxNoteLength) {
			maxNoteLength = value["markdown"].length;
			maxNoteName = key;
		}
	});
	longestNoteText.innerHTML = maxNoteLength;
	longestNoteLink.innerHTML = maxNoteName;
	longestNoteLink.href = "editor.html?name=" + encodeURIComponent(maxNoteName);
}
