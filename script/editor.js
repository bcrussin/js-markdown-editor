const SAVE_DELAY = 2000;
const RENDER_DELAY = 1000;
const CONSOLE_DELAY = 3000;
const TAB_SPACING = 4;

const LIST_SYMBOLS = ["-", ">"];

//const console = document.getElementById("console-text");
const title = document.getElementById("title");
const editor = document.getElementById("editor");
const preview = document.getElementById("preview");
const dialog = document.getElementById("guide-dialog");
const dialogBackdrop = document.getElementById("dialog-backdrop");

let noteName;
let isNew = true;
let titleTimer;
let editorTimer;
let consoleTimer;
let notes;

let selectionStart;
let selectionEnd;
let autoAddedText;
let preventKeyup = false;

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
	let code = editor.value;
	let html = md.makeHtml(code);
	preview.innerHTML = html;
}

function updateNote(key, value) {
	if (key === "title") {
		if (value !== noteName) {
			notes[value] = notes[noteName];
			delete notes[noteName];
			noteName = value;
			redirectURL();
		}
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

function insertText(text, updateCursor = true) {
	let oldPos = editor.selectionEnd;
	let before = editor.value.slice(0, editor.selectionStart);
	let after = editor.value.slice(editor.selectionEnd, editor.value.length);

	editor.value = before + text + after;

	editor.selectionEnd = oldPos;
	if (updateCursor) moveCursor(text.length);
}

function setText(text) {
	let oldPos = editor.selectionEnd;
	editor.value = text;
	editor.selectionEnd = oldPos;
}

function moveCursor(delta, keepSelection = false) {
	editor.selectionEnd += delta;

	if (keepSelection) editor.selectionStart += delta;
	else editor.selectionStart = editor.selectionEnd;
}

function setCursor(pos) {
	editor.selectionStart = pos;
	editor.selectionEnd = pos;
}

function cursorPosInLine() {
	let before = editor.value.substring(0, editor.selectionStart);
	let startPos = Math.max(before.lastIndexOf("\n") + 1, 0);

	return editor.selectionEnd - startPos;
}

function startOfLinePos() {
	let before = editor.value.substring(0, editor.selectionStart);
	let startPos = Math.max(before.lastIndexOf("\n") + 1, 0);

	return startPos;
}

function currLineIsList() {
	let line = getCurrentLine();
	let checkOrderedList = line.match("^[0-9]+\\.+\\s");
	if (!!checkOrderedList) {
		checkOrderedList = checkOrderedList[0];
		let num = parseInt(checkOrderedList.replace(".", "")) + 1;
		return num + ". ";
	} else {
		for (let symbol of LIST_SYMBOLS) {
			if (line.startsWith(symbol + " ")) {
				return symbol + " ";
			}
		}
	}
}

function keydownEditor(e) {
	if (e.key === "Enter") {
		let line = getCurrentLine();
		let fromEnd = editor.value.length - editor.selectionEnd;

		let listSymbol = currLineIsList();
		if (!!listSymbol) autoAddedText = listSymbol;

		if (!e.shiftKey && !!autoAddedText) {
			let afterSymbol = line.slice(autoAddedText.length, line.length);

			if (afterSymbol.trim().length === 0) {
				let before = editor.value.slice(0, editor.selectionStart - cursorPosInLine());
				let after = editor.value.slice(editor.selectionEnd, editor.value.length);

				setText(before + after);
				moveCursor(Math.max(-fromEnd, -line.length));

				e.preventDefault();
				preventKeyup = true;
				autoAddedText = null;
			}
		}
	} else if (e.key === "Tab") {
		if (currLineIsList()) {
			let oldPos = cursorPosInLine();
			moveCursor(-oldPos);
			insertText(" ".repeat(TAB_SPACING));
			moveCursor(oldPos);
		} else {
			insertText(" ".repeat(TAB_SPACING));
		}

		e.preventDefault();
	}
}

function keyupEditor(e) {
	if (preventKeyup) {
		e.preventDefault();
	}
	preventKeyup = false;

	if (!!autoAddedText) {
		let oldPos = editor.selectionEnd;

		insertText(autoAddedText);
	}
	autoAddedText = null;

	setEditorTimer();
}

function setEditorTimer() {
	if (editorTimer == null) {
		editorTimer = setTimeout(() => {
			editorTimer = null;
			updateMarkdown();
		}, RENDER_DELAY);
	}
}

function updateMarkdown() {
	let code = editor.value;
	updateNote("markdown", code ?? "");

	renderPreview();
}

editor.addEventListener("selectionchange", () => {
	selectionStart = editor.selectionStart;
	selectionEnd = editor.selectionEnd;
});

function exportMD() {
	let fileName = noteName + ".md";
	let fileBlob = new Blob([editor.value], { type: "text/plain" });

	window.URL = window.URL || window.webkitURL;

	let element = document.createElement("a");
	element.href = window.URL.createObjectURL(fileBlob);
	element.setAttribute("download", fileName);
	element.click();
	document.removeChild(element);
}

function clickGuideDialog(e) {
	if (e.target.tagName !== "DIALOG") return;

	const rect = e.target.getBoundingClientRect();

	let dialogClicked =
		e.clientX >= rect.left &&
		e.clientX <= rect.left + rect.width &&
		e.clientY >= rect.top &&
		e.clientY <= rect.top + rect.height;

	if (!dialogClicked) {
		closeGuideDialog();
	}
}

function openGuideDialog() {
	dialog.showModal();
	dialogBackdrop.classList.add("open");
}

function closeGuideDialog() {
	dialog.close();
	dialogBackdrop.classList.remove("open");
}

function showConsoleMessage(message) {
	console.innerHTML = message;
	console.className = "visible";

	consoleTimer = setTimeout(() => {
		console.className = "";
	}, CONSOLE_DELAY);
}

function getCurrentLine() {
	if (editor.selectionStart == null) return;

	let text = editor.value;
	let before = text.substring(0, editor.selectionStart);
	let after = text.substring(editor.selectionEnd, text.length);

	let startPos = Math.max(before.lastIndexOf("\n") + 1, 0);
	let endPos = after.indexOf("\n") >= 0 ? after.indexOf("\n") + editor.selectionEnd : text.length;

	return text.slice(startPos, endPos);
}

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

		// Remove previx and suffix
		before = editor.value.slice(0, selectionStart - prefix.length);
		after = editor.value.slice(selectionEnd + suffix.length, editor.value.length);
		middle = editor.value.slice(selectionStart, selectionEnd);

		setText(before + middle + after);
		moveCursor(-suffix.length);
	} else if (startsWithPrefix && endsWithSuffix) {
		// ___ Selected text starts with prefix and ends with suffix ___

		before = editor.value.slice(0, selectionStart);
		after = editor.value.slice(selectionEnd, editor.value.length);
		middle = editor.value.slice(selectionStart + prefix.length, selectionEnd - suffix.length);

		setText(before + middle + after);
		moveCursor(-prefix.length - suffix.length);
	} else {
		if (selectionStart == selectionEnd) {
			// ___ No text selected, add prefix and suffix ___

			insertText(prefix + suffix);
			moveCursor(-2);
		} else {
			// ___ Wrap selected text with prefix and suffix ___

			insertText(prefix + editor.value.slice(selectionStart, selectionEnd) + suffix, false);
			moveCursor(prefix.length + suffix.length);
		}
	}

	renderPreview();
	saveNotes();
}
