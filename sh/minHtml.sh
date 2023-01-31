#!/bin/bash
cd static
tree -ifl --noreport | grep .htm | while IFS= read -r file; do
	deno run --allow-read ../utils/minifier.js "$file" > "../build/${file/.\//}"
done
exit
