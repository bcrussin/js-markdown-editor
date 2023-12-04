const CHEAT_SHEET_URL = "https://corsproxy.io/?https://www.markdownguide.org/api/v1/cheat-sheet.json";
const BASIC_SYNTAX_URL = "https://corsproxy.io/?https://www.markdownguide.org/api/v1/basic-syntax.json";

const guideContent = document.getElementById("guide-content");

let cheatSheetData;
let basicSyntaxData;

this.onload = () => {
	loadCheatSheet();
};

function loadCheatSheet() {
	if (!!cheatSheetData) {
		parseCheatSheet(cheatSheetData);
	} else {
		fetch(CHEAT_SHEET_URL)
			.then((res) => res.json())
			.then((data) => {
				cheatSheetData = data["cheat_sheet"];
				parseCheatSheet(cheatSheetData);
			});
	}
}

function parseCheatSheet() {
	let data = cheatSheetData;
	guideContent.innerHTML = "";
	guideContent.scroll(0, 0);

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
		sectionDiv.className = "section";
		let header = document.createElement("h2");
		header.innerHTML = sectionName;
		sectionDiv.appendChild(header);

		let sectionContent = document.createElement("div");
		sectionContent.className = "section-content";
		sectionDiv.appendChild(sectionContent);

		//console.log(sectionName);
		for (let item of sectionItems) {
			//console.log(item);
			let title = document.createElement("h4");
			let titleLink = document.createElement("a");
			titleLink.innerHTML = item["element"];
			titleLink.onclick = () => parseBasicSyntax(titleLink.innerHTML);
			title.appendChild(titleLink);

			let syntaxContainer = document.createElement("div");
			syntaxContainer.className = "syntax";

			let syntax = document.createElement("code");
			syntax.innerHTML = item["syntax"];
			syntaxContainer.appendChild(syntax);

			sectionContent.appendChild(title);
			sectionContent.appendChild(syntaxContainer);
		}

		guideContent.appendChild(sectionDiv);
	}
}

async function loadBasicSyntax() {
	if (basicSyntaxData == null) {
		await fetch(BASIC_SYNTAX_URL)
			.then((res) => res.json())
			.then((data) => {
				basicSyntaxData = data["basic_syntax"];
			});
	}
}

async function parseBasicSyntax(name) {
	if (basicSyntaxData == null) {
		await loadBasicSyntax();
	}

	let data = Object.values(basicSyntaxData);
	guideContent.innerHTML = "";
	guideContent.scroll(0, 0);

	if (!!name) {
		data = data.filter((item) => item.name === name);
	}
	//sectionDiv.className = "section";
	let sectionDiv = document.createElement("div");

	let backButton = document.createElement("a");
	backButton.innerHTML = "&larr; Back";
	backButton.onclick = () => parseCheatSheet();
	sectionDiv.appendChild(backButton);

	for (let item of data) {
		let sectionContent = document.createElement("div");
		sectionContent.className = "section-content";

		let header = document.createElement("h2");
		header.innerHTML = item["name"];
		sectionDiv.appendChild(header);
		sectionDiv.appendChild(sectionContent);

		let title = document.createElement("h4");

		let description = document.createElement("p");
		let descriptionText = document.createTextNode(item["description"]);
		description.appendChild(descriptionText);

		let exampleHeader = document.createElement("h4");
		exampleHeader.innerHTML = "Examples:";
		let examplesContent = document.createElement("div");
		examplesContent.className = "section-content";

		for (let example of item["examples"]) {
			let exampleContainer = document.createElement("div");
			exampleContainer.className = "example";

			let exampleCode = document.createElement("code");
			let exampleText = document.createTextNode(example["markdown"]);
			exampleCode.appendChild(exampleText);
			exampleContainer.appendChild(exampleCode);

			let exampleDetails = document.createElement("details");
			let summary = document.createElement("summary");
			summary.innerHTML = "Output:";
			exampleDetails.appendChild(summary);

			let exampleHtml = document.createElement("div");
			exampleHtml.className = "section-content";
			exampleHtml.innerHTML = example["html"];
			exampleDetails.appendChild(exampleHtml);
			exampleContainer.appendChild(exampleDetails);

			examplesContent.appendChild(exampleContainer);
		}

		let examplesContainer = document.createElement("div");
		// additional_examples

		sectionContent.appendChild(title);
		sectionContent.appendChild(description);
		sectionContent.appendChild(exampleHeader);
		sectionContent.appendChild(examplesContent);
	}

	guideContent.appendChild(sectionDiv);
}
