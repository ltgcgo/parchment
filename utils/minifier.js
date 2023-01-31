"use strict";

import {minifyHTML} from "https://deno.land/x/minifier/mod.ts";

console.info(minifyHTML(await Deno.readTextFile(Deno.args[0])));
