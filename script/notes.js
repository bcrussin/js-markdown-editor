let notes;
let numCards = 0;

window.onload = () => {
	try {
		notes = JSON.parse(localStorage.getItem("notes"));
	} catch {
		return;
	}

	if (Object.keys(notes).length > 0) {
		document.getElementById("notes-placeholder").remove();

		for (const [title, note] of Object.entries(notes)) {
			addNoteCard(title, note);
		}
	}
};

function deleteNote(title, id) {
	if (!confirm("Are you sure you would like to delete this note?")) {
		return;
	}

	delete notes[title];
	console.log(notes);
	localStorage.setItem("notes", JSON.stringify(notes));
	removeNoteCard(id);
}

function addNoteCard(title, note) {
	let id = numCards++;

	let card = document.createElement("div");
	card.className = "note-card";
	card.id = "note-" + id;
	card.addEventListener("click", () => {
		window.location.href = "./editor.html?name=" + title;
	});

	let cardContent = document.createElement("div");
	cardContent.className = "note-card-content";

	let deleteButton = document.createElement("button");
	deleteButton.className = "delete-note";
	deleteButton.innerHTML = "X";
	deleteButton.addEventListener("click", (e) => {
		e.stopPropagation();
		deleteNote(title, id);
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
	document.getElementById("note-cards-container").appendChild(card);
}

function removeNoteCard(id) {
	let noteCard = document.getElementById("note-" + id);
	noteCard.remove();
}
