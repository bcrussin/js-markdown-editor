const SAVE_DELAY = 2000;
const RENDER_DELAY = 1000;
const CONSOLE_DELAY = 3000;

//const console = document.getElementById("console-text");
const title = document.getElementById("title");
const editor = document.getElementById("editor");
const preview = document.getElementById("preview");

let noteName;
let isNew = true;
let titleTimer;
let editorTimer;
let consoleTimer;
let notes;

let selectionStart;
let selectionEnd;

window.onload = () => {
	const urlParams = new URLSearchParams(window.location.search);
	noteName = urlParams.get("name");

	if (noteName == undefined) {
		checkLocalStorage();
		createNewNote();
	} else {
		isNew = false;
		fetchNoteData();
	}
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

function createNewNote() {
	let noteId = Object.keys(notes).length;

	noteName = "Untitled Note " + noteId;
	title.value = noteName;
	editor.value = "";

	notes[noteName] = {
		markdown: "",
	};

	saveNotes();
	redirectURL();
}

function saveNotes() {
	localStorage.setItem("notes", JSON.stringify(notes));
}

function fetchNoteData() {
	notes = JSON.parse(localStorage.getItem("notes"));

	title.value = noteName;
	editor.value = notes[noteName].markdown ?? "";

	renderPreview();
}

function renderPreview() {
	code = editor.value;
	html = md.makeHtml(code);

	preview.innerHTML = html;
}

function updateNote(key, value) {
	if (key === "title") {
		notes[value] = notes[noteName];
		delete notes[noteName];
		noteName = value;
		redirectURL();
	} else if (key === "body") {
		notes[noteName][key] = value ?? "";
	} else {
		notes[noteName][key] = value;
	}

	if (isNew) {
		redirectURL();
		isNew = false;
	}

	saveNotes();
}

function redirectURL() {
	let url = new URL(window.location.href);
	url.searchParams.set("name", noteName);
	window.history.pushState(null, "", url.toString());
}

function keyupTitle() {
	clearTimeout(titleTimer);
	titleTimer = setTimeout(() => updateTitle(), SAVE_DELAY);
}

function updateTitle() {
	let title = document.getElementById("title").value;

	updateNote("title", title ?? "");
}

function updateMarkdown() {
	console.log(editorTimer);
	if (editorTimer == null) {
		editorTimer = setTimeout(() => {
			let code = document.getElementById("editor").value;
			updateNote("markdown", code ?? "");
			renderPreview();
			editorTimer = null;
		}, RENDER_DELAY);
	}
}

editor.addEventListener("selectionchange", () => {
	selectionStart = editor.selectionStart;
	selectionEnd = editor.selectionEnd;
});

function insertStyle(style) {
	let prefix;
	let suffix;

	switch (style) {
		case "bold":
			prefix = "**";
			suffix = "**";
			break;
		case "italic":
			prefix = "_";
			suffix = "_";
			break;
		case "monospace":
			prefix = "`";
			suffix = "`";
			break;
	}

	let hasPrefix = editor.value.slice(selectionStart - prefix.length, selectionStart) == prefix;
	let hasSuffix = editor.value.slice(selectionEnd, selectionEnd + suffix.length) == suffix;

	let startsWithPrefix = editor.value.slice(selectionStart, selectionEnd).startsWith(prefix);
	let endsWithSuffix = editor.value.slice(selectionStart, selectionEnd).endsWith(suffix);

	let before;
	let after;
	let middle;

	editor.focus();

	if (hasPrefix && hasSuffix) {
		// ___ Selected text is surrounded by prefix and suffix ___

		let oldPos = selectionEnd;

		// Remove previx and suffix
		before = editor.value.slice(0, selectionStart - prefix.length);
		after = editor.value.slice(selectionEnd + suffix.length, editor.value.length);
		middle = editor.value.slice(selectionStart, selectionEnd);

		editor.value = before + middle + after;
		editor.selectionEnd = oldPos - suffix.length;
	} else if (startsWithPrefix && endsWithSuffix) {
		// ___ Selected text starts with prefix and ends with suffix ___

		before = editor.value.slice(0, selectionStart);
		after = editor.value.slice(selectionEnd, editor.value.length);
		middle = editor.value.slice(selectionStart + prefix.length, selectionEnd - suffix.length);

		editor.value = before + middle + after;
	} else {
		if (selectionStart == selectionEnd) {
			// ___ No text selected, add prefix and suffix ___

			before = editor.value.slice(0, selectionStart);
			after = editor.value.slice(selectionEnd, editor.value.length);

			editor.value = before + prefix + suffix + after;
			editor.selectionEnd -= suffix.length;
		} else {
			// ___ Wrap selected text with prefix and suffix ___

			let oldPos = selectionEnd;

			before = editor.value.slice(0, selectionStart);
			after = editor.value.slice(selectionEnd, editor.value.length);
			middle = prefix + editor.value.slice(selectionStart, selectionEnd) + suffix;

			editor.value = before + middle + after;
			editor.selectionEnd = oldPos + prefix.length + suffix.length;
		}
	}

	renderPreview();
	saveNotes();
}

function showConsoleMessage(message) {
	console.innerHTML = message;
	console.className = "visible";

	consoleTimer = setTimeout(() => {
		console.className = "";
	}, CONSOLE_DELAY);
}
