"use strict";

import showdown from "../../libs/showdown@showdownjs/showdown.min.js";

let converter = new showdown.Converter({
	omitExtraWLInCodeBlocks: true,
	ghCompatibleHeaderId: true,
	parseImgDimensions: true,
	simplifiedAutoLink: true,
	excludeTrailingPunctuationFromURLs: true,
	strikethrough: true,
	tables: true,
	tablesHeaderId: true,
	tasklists: true,
	disableForced4SpacesIndentedSublists: true,
	simpleLineBreaks: true,
	requireSpaceBeforeHeadingText: true
});

// Offloading MarkDown parsing to the Worker
addEventListener("message", async function (ev) {
	let path = ev.data.id;
	let resp = await fetch(`site/${path}`);
	if (resp.status > 199 && resp.status < 400) {
		postMessage({id: path, ok: true, data: converter.makeHtml(await resp.text())});
	} else {
		postMessage({id: path, ok: false, data: resp.status});
	};
});
