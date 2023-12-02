const CHEAT_SHEET_URL = "https://corsproxy.io/?https://www.markdownguide.org/api/v1/cheat-sheet.json";

const guideContent = document.getElementById("guide-content");

this.onload = () => {
	loadCheatSheet();
};

function loadCheatSheet() {
	fetch(CHEAT_SHEET_URL)
		.then((res) => res.json())
		.then((data) => {
			console.log(parseCheatSheet(data["cheat_sheet"]));
		});
}

function parseCheatSheet(data) {
	guideContent.innerHTML = "";

	for (let sectionObject of data) {
		let sectionName = Object.keys(sectionObject)[0];
		let sectionItems = Object.values(sectionObject)[0];

		sectionName = sectionName.replace("_", " ");
		sectionName = sectionName
			.toLowerCase()
			.split(" ")
			.map((s) => s.charAt(0).toUpperCase() + s.substring(1))
			.join(" ");

		let sectionDiv = document.createElement("div");
		let header = document.createElement("h2");
		header.innerHTML = sectionName;
		sectionDiv.appendChild(header);

		let sectionContent = document.createElement("div");
		sectionContent.className = "section-content";
		sectionDiv.appendChild(sectionContent);

		console.log(sectionName);
		for (let item of sectionItems) {
			console.log(item);
			let title = document.createElement("h4");
			title.innerHTML = item["element"];

			let syntax = document.createElement("code");
			syntax.innerHTML = item["syntax"];

			sectionContent.appendChild(title);
			sectionContent.appendChild(syntax);
		}

		guideContent.appendChild(sectionDiv);
	}
}
