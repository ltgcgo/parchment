#!/bin/bash
mkdir -p build
#mkdir -p proxy
# Remove the dev files
rm -rv build/*.js
rm -rv build/*.map
# Using esbuild to build all JS files
#esbuild --bundle src/index.js --outfile=build/index.js --minify --sourcemap
#esbuild --bundle src/index.js --target=es6 --outfile=build/index.es6.js --minify --sourcemap
ls -1 src | while IFS= read -r dir ; do
	if [ -e "src/${dir}/index.js" ] ; then
		shx live $dir --minify > /dev/null
	fi
	if [ -e "src/${dir}/index.mjs" ] ; then
		shx live $dir --minify > /dev/null
	fi
	if [ -e "src/${dir}/index.css" ] ; then
		shx live $dir --minify > /dev/null
	fi
done
#rm -rv proxy/*.map
# Finalizing most builds
#ls -1 src | while IFS= read -r dir ; do
	#if [ -e "src/${dir}/prefixer.js" ] ; then
		#cat src/${dir}/prefixer.js > build/${dir}.js
	#fi
	#if [ -e "proxy/${dir}.js" ] ; then
		#cat proxy/${dir}.js >> build/${dir}.js
	#fi
#done
# Node specific
#mkdir -p proxy/node
#mv build/node.js proxy/node/index.js
#rm proxy/node.js
exit
