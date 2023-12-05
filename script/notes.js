let notes;
let numCards = 0;

const search = document.getElementById("search");
const notesContainer = document.getElementById("note-cards-container");

const deleteModal = new bootstrap.Modal(document.querySelector("#deleteModal"));
const deleteName = document.getElementById("delete-name");

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
	if (Object.keys(_notes).length > 0) {
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
