const CHEAT_SHEET_URL = "https://corsproxy.io/?https://www.markdownguide.org/api/v1/cheat-sheet.json";
const BASIC_SYNTAX_URL = "https://corsproxy.io/?https://www.markdownguide.org/api/v1/basic-syntax.json";

const guideContent = document.getElementById("guide-content");
const searchForm = document.getElementById("search-form");
const search = document.getElementById("search");

let cheatSheetData;
let basicSyntaxData;

this.onload = () => {};

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

function parseCheatSheet(data) {
	searchForm.style.display = "block";

	guideContent.innerHTML = "";
	guideContent.scroll(0, 0);

	data = data || cheatSheetData;

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

		let sectionContent = document.createElement("div");
		sectionContent.className = "section-content";

		let header = document.createElement("h2");
		header.innerHTML = sectionName;
		header.className = "section-header";
		sectionDiv.appendChild(header);

		sectionDiv.appendChild(sectionContent);

		if (sectionItems.length > 0) {
			for (let item of sectionItems) {
				let element = document.createElement("div");
				element.className = "element";

				let title = document.createElement("h4");

				if (sectionName === "Basic Syntax") {
					let titleLink = document.createElement("a");
					titleLink.innerHTML = item["element"];
					titleLink.className = "element-title";
					element.onclick = () => parseBasicSyntax(titleLink.innerHTML);
					title.appendChild(titleLink);
				} else {
					title.innerHTML = item["element"];
					title.className = "element-title";
				}

				let syntaxContainer = document.createElement("div");
				syntaxContainer.className = "element-syntax";

				let syntax = document.createElement("code");
				syntax.innerHTML = item["syntax"];
				syntaxContainer.appendChild(syntax);

				element.appendChild(title);
				element.appendChild(syntaxContainer);
				sectionContent.appendChild(element);
			}
		} else {
			let placeholder = document.createElement("span");
			placeholder.className = "placeholder";
			placeholder.appendChild(document.createTextNode("No entries found"));

			sectionContent.appendChild(placeholder);
		}

		guideContent.appendChild(sectionDiv);
	}
}

function searchCheatSheet(query) {
	let filtered = structuredClone(cheatSheetData);

	for (const [sectionName, _section] of Object.entries(filtered)) {
		Object.keys(_section).forEach((item) => {
			let section = Object.values(_section)[0];
			section = section.filter((item) => item["element"].toLowerCase().includes(query.toLowerCase()));
			_section[item] = section;
		});

		filtered[sectionName] = _section;
	}

	parseCheatSheet(filtered);
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

	searchForm.style.display = "none";
	search.value = "";

	let data = Object.values(basicSyntaxData);
	guideContent.innerHTML = "";
	guideContent.scroll(0, 0);

	if (!!name) {
		data = data.filter((item) => item.name === name);
	}
	//sectionDiv.className = "section";
	let sectionDiv = document.createElement("div");

	let backButton = document.createElement("a");
	backButton.setAttribute("class", "btn btn-outline-secondary back-button");
	backButton.innerHTML = "&larr; Back";
	backButton.onclick = () => parseCheatSheet();
	sectionDiv.appendChild(backButton);

	for (let item of data) {
		let sectionContent = document.createElement("div");
		sectionContent.style.maxWidth = "600px";

		let header = document.createElement("h2");
		header.innerHTML = item["name"];
		sectionDiv.appendChild(header);
		sectionDiv.appendChild(sectionContent);

		let description = document.createElement("p");
		let descriptionText = document.createTextNode(item["description"]);
		description.appendChild(descriptionText);

		let exampleHeader = document.createElement("h4");
		exampleHeader.innerHTML = "Examples:";
		let examplesContent = document.createElement("div");

		for (let example of item["examples"]) {
			let exampleContainer = document.createElement("div");
			exampleContainer.className = "example";

			let codeContainer = document.createElement("div");
			codeContainer.className = "example-syntax";
			let exampleCode = document.createElement("code");
			let exampleText = document.createTextNode(example["markdown"]);
			exampleCode.appendChild(exampleText);
			codeContainer.appendChild(exampleCode);
			exampleContainer.appendChild(codeContainer);

			let exampleDetails = document.createElement("details");
			let summary = document.createElement("summary");
			summary.innerHTML = "Output:";
			exampleDetails.appendChild(summary);

			let exampleHtml = document.createElement("div");
			exampleHtml.innerHTML = example["html"];
			exampleDetails.appendChild(exampleHtml);
			exampleContainer.appendChild(exampleDetails);

			examplesContent.appendChild(exampleContainer);
		}

		let examplesContainer = document.createElement("div");
		// additional_examples

		sectionContent.appendChild(description);
		sectionContent.appendChild(exampleHeader);
		sectionContent.appendChild(examplesContent);
	}

	guideContent.appendChild(sectionDiv);
}
