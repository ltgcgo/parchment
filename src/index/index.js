"use strict";

import {searchToObj} from "./search.js";
import {$e, $a} from "../../libs/lightfelt@ltgcgo/main/quickPath.js";

// Load site configuration
let siteConf;

// Start MarkDown worker
let mdParser = new Worker("./worker.js");

// Store search state
let searchState = searchToObj(location.search);

// Store DOM target
let renderer;
let rendered = false;

// Achieving better minification
const tabDoc = document,
tabRoot = tabDoc.children[0];

// Global link override
let linkCapturer = function (ev) {
	ev.preventDefault();
	ev.stopPropagation();
	console.debug(this.getAttribute("parchment"));
};

// Custom header actions
let jumpToHx = function () {
	location.hash = `#${this.id || ""}`;
};

let getPath = function (path) {
	if (path?.length) {
	} else if (path?.length == 0) {
		path = "index";
	} else {
		path = searchState.get("p") || "index";
	};
	if (path.toLowerCase().indexOf(".md") < 0) {
		return path + ".md";
	} else {
		return path;
	};
};

let storeScroll = function () {
	let stateStore = history.state || {};
	stateStore[getPath()] = {sX: tabRoot.scrollLeft, sY: tabRoot.scrollTop};
	history.replaceState(stateStore, "");
};

// DOM preprocessing
let domPreprocess = function (doc) {
	// Make tables look nicer
	$a("table", doc).forEach((e) => {
		e.setAttribute("role", "grid");
	});
	// Defer all image loads
	$a("img", doc).forEach((e) => {
		e.setAttribute("decoding", "async");
		e.setAttribute("loading", "lazy");
	});
	// Add custom action to all heads
	$a("h1, h2, h3, h4, h5, h6", doc).forEach((e) => {
		e.addEventListener("click", jumpToHx);
	});
	// Alter all anchors
	$a("a", doc).forEach((e) => {
		let href = e.getAttribute("href"),
		idxColon = href.indexOf(":"),
		idxSlash = href.indexOf("/");
		if (idxColon > -1 && idxColon < 6 && idxSlash < 8) {
			e.setAttribute("target", "_blank");
		} else if (href[0] == "#") {} else {
			e.setAttribute("parchment", href);
			e.href = `?p=${href}`;
		};
		e.addEventListener("click", linkCapturer);
	});
};

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
	rendered = true;
	if (location.hash) {
		location.hash = location.hash;
	};
	if (history.state && history.state[getPath()]) {
		tabRoot.scrollTop = history.state[getPath()].sY || 0;
		tabRoot.scrollLeft = history.state[getPath()].sX || 0;
	};
};
let showDom = async function (path) {
	rendered = false;
	path = getPath(path);
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
		domPreprocess(dom);
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

// State reassurance
let updateTitle = async function () {
	if (currentDom) {
		self.currentDom = currentDom;
		tabDoc.title = `${$e("h1", currentDom)?.innerText || "Untitled"} - ${siteConf?.site?.name || "Parchment"}`;
	} else {
		tabDoc.title = `Loading - ${siteConf?.site?.name || "Parchment"}`;
	};
};

// State changes
tabDoc.addEventListener("readystatechange", function () {
	switch (this.readyState) {
		case "interactive": {
			renderer = $e("main.container");
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

// Save scrolling state
addEventListener("beforeunload", () => {
	if (rendered) {
		storeScroll();
	};
});
