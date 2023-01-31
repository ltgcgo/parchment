"use strict";

let searchToObj = function (string, seperator = "&", assigner = "=") {
	let decoded = new Map();
	string.length && string.slice(1).split(seperator).forEach((e) => {
		let text = decodeURIComponent(e), split = text.indexOf(assigner);
		if (split >= 0) {
			decoded.set(text.slice(0, split), text.slice(split + assigner.length));
		} else {
			decoded.set(text, null);
		};
	});
	return decoded;
};
let objToSearch = function (map) {};

export {
	searchToObj,
	objToSearch
};
