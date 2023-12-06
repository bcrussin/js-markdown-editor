let notes;
let numCards = 0;

const search = document.getElementById("search-notes");
const notesContainer = document.getElementById("note-cards-container");

const deleteModal = new bootstrap.Modal(document.querySelector("#deleteModal"));
const deleteName = document.getElementById("delete-name");

const deleteAllModal = new bootstrap.Modal(document.querySelector("#deleteAllModal"));
const deleteAllConfirm = document.getElementById("delete-all-confirm");
const deleteAllSubmit = document.getElementById("delete-all-submit");

const exportModal = new bootstrap.Modal(document.querySelector("#exportModal"));

const importModal = new bootstrap.Modal(document.querySelector("#importModal"));
const importFiles = document.getElementById("importFiles");

const overwriteModal = new bootstrap.Modal(document.querySelector("#overwriteModal"));
const overwriteName = document.getElementById("overwrite-name");
const overwriteSubmit = document.getElementById("overwrite-submit");
let overwriteQueue = [];
let nameToOverwrite;

let noteToDelete;

window.onload = () => {
	search.value = "";

	try {
		notes = JSON.parse(localStorage.getItem("notes"));
	} catch {
		return;
	}

	addNoteCards();
};

function createNote() {
	window.location.href = "/editor.html";
}

function deleteNote(title, id) {
	delete notes[title];
	localStorage.setItem("notes", JSON.stringify(notes));
	removeNoteCard(id);
}

function searchNotes(query) {
	let filtered = {};
	Object.entries(notes).forEach(([key, value]) => {
		if (key.toLowerCase().includes(query.toLowerCase())) {
			filtered[key] = value;
		}
	});

	addNoteCards(filtered);
}

function addNoteCards(_notes) {
	notesContainer.innerHTML = "";

	_notes = _notes || notes;
	if (_notes != null && Object.keys(_notes).length > 0) {
		document.getElementById("notes-placeholder").style.display = "none";

		for (const [title, note] of Object.entries(_notes)) {
			addNoteCard(title, note);
		}
	} else {
		document.getElementById("notes-placeholder").style.display = "block";
	}
}

function addNoteCard(title, note) {
	let id = numCards++;

	let card = document.createElement("div");
	card.className = "note-card";
	card.id = "note-" + id;
	card.addEventListener("click", () => {
		let href = "editor.html";
		if (!!title) href += "?name=" + encodeURIComponent(title);
		window.location.href = href;
	});

	let cardContent = document.createElement("div");
	cardContent.className = "note-card-content";

	let deleteButton = document.createElement("button");
	deleteButton.className = "delete-note";
	deleteButton.innerHTML = "&#x2715;";
	deleteButton.addEventListener("click", (e) => {
		e.stopPropagation();
		//deleteNote(title, id);
		noteToDelete = [title, id];
		deleteName.innerHTML = title;
		deleteModal.show();
	});

	let titleHeader = document.createElement("h2");
	titleHeader.innerHTML = title;
	titleHeader.className = "note-title";

	let preview = document.createElement("div");
	preview.className = "note-preview";
	//html = md.makeHtml(note.markdown);
	html = md.makeHtml(note.markdown);

	preview.innerHTML = html;

	cardContent.appendChild(titleHeader);
	cardContent.appendChild(preview);

	card.appendChild(cardContent);
	card.appendChild(deleteButton);
	notesContainer.appendChild(card);
}

function removeNoteCard(id) {
	let noteCard = document.getElementById("note-" + id);
	noteCard.remove();
}

function deleteModalSubmit() {
	deleteNote(noteToDelete[0], noteToDelete[1]);
	noteToDelete = null;
	deleteModal.hide();
}

function saveNotes() {
	console.log(notes);
	localStorage.setItem("notes", JSON.stringify(notes));
}

function openExportDialog() {
	exportModal.show();
}

function exportNotesToJson() {
	exportModal.hide();

	let date = new Date();
	let year = date.getFullYear();
	let month = date.getMonth();
	month = "0".repeat(2 - month.toString().length) + month;
	let day = date.getDate();
	day = "0".repeat(2 - day.toString().length) + day;
	let hours = date.getHours();
	hours = "0".repeat(2 - hours.toString().length) + hours;
	let minutes = date.getMinutes();
	minutes = "0".repeat(2 - minutes.toString().length) + minutes;
	let seconds = date.getSeconds();
	seconds = "0".repeat(2 - seconds.toString().length) + seconds;

	let fullDate = `${year}-${month}-${day}_${hours}h-${minutes}m-${seconds}s`;

	let fileName = `notes_${fullDate}.json`;
	let fileBlob = new Blob([JSON.stringify(notes)], { type: "application/json" });

	window.URL = window.URL || window.webkitURL;

	let element = document.createElement("a");
	element.href = window.URL.createObjectURL(fileBlob);
	element.setAttribute("download", fileName);
	element.click();
}

function openImportDialog() {
	importFiles.value = null;
	importModal.show();
}

async function importNotes() {
	let files = importFiles.files;

	for (let file of files) {
		if (file.name.endsWith(".md")) {
			//console.log("Markdown file: " + file.name);
			await uploadMdFile(file);
		} else if (file.name.endsWith(".json")) {
			await uploadJsonFile(file);
		}
	}

	checkOverwriteDialogQueue();
	importModal.hide();
}

async function uploadMdFile(file) {
	return new Promise((resolve, reject) => {
		const fileReader = new FileReader();

		// Remove only the .md at the end
		let parts = file.name.split(".md");
		parts.pop();
		let title = parts.join(".md");

		fileReader.onload = (event) => {
			let markdown = event.target.result;

			if (title in notes) {
				overwriteQueue.push([title, markdown]);
			} else {
				notes[title] = {
					markdown: markdown,
					created: new Date(),
				};
			}

			resolve();
		};
		fileReader.readAsText(file);
	});
}

async function uploadJsonFile(file) {
	return new Promise((resolve, reject) => {
		const fileReader = new FileReader();
		fileReader.onload = (event) => {
			let data = JSON.parse(event.target.result);
			Object.entries(data).forEach(([key, value]) => {
				console.log(key);
				if (key in notes) {
					overwriteQueue.push([key, value]);
				} else {
					notes[key] = value;
				}
			});

			resolve();
		};
		fileReader.readAsText(file);
	});
}

async function checkOverwriteDialogQueue() {
	// Remove existing modal close listener
	$("#overwriteModal").off("hidden.bs.modal");

	// Check if there is another overwrite in the queue
	if (overwriteQueue.length > 0) {
		let note = overwriteQueue.shift();

		// Create a listener to perform the overwrite if the submit button is clicked
		overwriteSubmit.onclick = () => {
			if (typeof note[1] === "object") {
				notes[note[0]] = note[1];
			} else if (typeof note[1] === "string") {
				notes[note[0]] = {
					markdown: note[1],
					created: new Date(),
				};
			}

			closeOverwriteDialog();
		};

		// Open the confirmation dialog
		openOverwriteDialog(note[0]);
	} else {
		saveNotes();
		addNoteCards();
	}
}

function openOverwriteDialog(name) {
	nameToOverwrite = name;
	overwriteName.innerHTML = nameToOverwrite;
	overwriteModal.show();
}

function closeOverwriteDialog() {
	nameToOverwrite = null;

	// Remove the listener for performing the overwrite
	overwriteSubmit.onclick = null;

	// Check the overwrite queue again once the modal is finished closing
	$("#overwriteModal").on("hidden.bs.modal", function () {
		checkOverwriteDialogQueue();
	});

	overwriteModal.hide();
}

function openDeleteAllDialog() {
	deleteAllConfirm.value = "";
	deleteAllModal.show();
}

function checkCanDeleteAll() {
	if (deleteAllConfirm.value.toLowerCase() === "i understand") {
		deleteAllSubmit.disabled = false;
	} else {
		deleteAllSubmit.disabled = true;
	}
}

function deleteAllNotes() {
	notes = {};
	localStorage.removeItem("notes");
	saveNotes();
	deleteAllModal.hide();
	addNoteCards();
}
