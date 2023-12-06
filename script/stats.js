const totalNotesValue = document.getElementById("total-notes-value");
const totalCharsValue = document.getElementById("total-chars-value");
const longestNoteLink = document.getElementById("longest-note-link");
const longestNoteValue = document.getElementById("longest-note-value");
const totalLinesValue = document.getElementById("total-lines-value");

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
	totalNotesValue.innerHTML = totalNotes;

	let totalChars = 0;
	totalChars = Object.values(notes).reduce((total, { markdown }) => {
		total += markdown.length;
		return total;
	}, 0);
	totalCharsValue.innerHTML = totalChars;

	let maxNoteName = "N/A";
	let maxNoteLength = 0;
	Object.entries(notes).map(([key, value]) => {
		if (value["markdown"].length > maxNoteLength) {
			maxNoteLength = value["markdown"].length;
			maxNoteName = key;
		}
	});
	longestNoteValue.innerHTML = maxNoteLength;
	longestNoteLink.innerHTML = maxNoteName;
	longestNoteLink.href = "editor.html?name=" + encodeURIComponent(maxNoteName);

	let totalLines = 0;
	totalLines = Object.values(notes).reduce((total, { markdown }) => {
		total += markdown.split("\n").length;
		return total;
	}, 0);
	totalLinesValue.innerHTML = totalLines;
}
