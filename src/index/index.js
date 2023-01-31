"use strict";

import {searchToObj} from "./search.js";

// Load site configuration
let siteConf;

// Start MarkDown worker
let mdParser = new Worker("./worker.js");

// Store search state
let searchState = searchToObj(location.search);

// Store DOM target
let renderer;

// Store all parsed DOMs
let domParser = new DOMParser();
let parsedDoms = new Map();
let currentDom;
let waitDom;
let hasDom = function (path) {
	if (parsedDoms.has(path)) {
		return true;
	} else {
		mdParser.postMessage({id: path});
		return false;
	};
};
let finishDom = function (dom) {};
let renderDom = async function () {
	while (renderer.children.length > 0) {
		if (currentDom) {
			currentDom.body.appendChild(renderer.children[0]);
		} else {
			renderer.removeChild(renderer.children[0]);
		};
	};
	updateTitle();
	let length = currentDom.body.children.length,
	offset = 0;
	for (let i = 0; i < length; i ++) {
		let e = currentDom.body.children[offset];
		if (e.tagName == "H1" && !offset) {
			offset ++;
		} else {
			renderer.appendChild(currentDom.body.children[offset]);
		};
	};
};
let showDom = async function (path) {
	if (path.length) {} else {
		path = "index";
	};
	if (path.toLowerCase().indexOf(".md") < 0) {
		path += ".md";
	};
	if (hasDom(path)) {
		currentDom = parsedDoms.get(path);
		renderDom();
	} else {
		waitDom = path;
	};
};
mdParser.addEventListener("message", (ev) => {
	let msg = ev.data;
	if (msg.ok) {
		let dom = domParser.parseFromString(msg.data, "text/html");
		parsedDoms.set(msg.id, dom);
		if (waitDom == msg.id) {
			currentDom = dom;
			renderDom();
		};
	} else if (waitDom == msg.id) {
		// Show error page
	};
});
self.parsedDoms = parsedDoms;

// Achieving better minification
const tabDoc = document;

// Global link override
let linkCapturer = function (ev) {
};

// State reassurance
let updateTitle = async function () {
	if (currentDom) {
		self.currentDom = currentDom;
		tabDoc.title = `${currentDom.querySelector("h1")?.innerText || "Untitled"} - ${siteConf?.site?.name || "Parchment"}`;
	} else {
		tabDoc.title = `Loading - ${siteConf?.site?.name || "Parchment"}`;
	};
};

// State changes
tabDoc.addEventListener("readystatechange", function () {
	switch (this.readyState) {
		case "interactive": {
			renderer = tabDoc.querySelector("main.container");
			updateTitle();
			showDom(searchState.get("path") || "");
			break;
		};
		case "loaded": {
			updateTitle();
			break;
		};
	};
});

// Config loading
fetch("./conf.json").then((e) => {
	return e.json();
}).then((data) => {
	siteConf = data;
	updateTitle();
});
