"use strict";

// Failed attempt

// Import HTML Minifier from Terser
import {minify} from "https://cdn.jsdelivr.net/npm/html-minifier-terser@7.1.0/dist/htmlminifier.esm.bundle.min.js";

// Emit the result to stdout
console.info(minify(await Deno.readTextFile(Deno.args[0]), {
	removeComments: true,
	collapseBooleanAttributes: true
}));
