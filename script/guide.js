const CHEAT_SHEET_URL = "https://www.datamuse.com/words?ml=ringing+in+the+ears";

const guideContent = document.getElementById("guide-content");

this.onload = () => {
	loadCheatSheet();
};

function loadCheatSheet() {
	let request = new XMLHttpRequest();
	request.addEventListener("load", parseData);
	request.open("GET", "https://www.markdownguide.org/api/v1/cheat-sheet.json");
	request.send();
}

function parseData() {
	console.log(1);
}
