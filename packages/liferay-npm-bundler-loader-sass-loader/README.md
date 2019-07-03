# liferay-npm-bundler-loader-css-loader  

A Liferay NPM Bundler loader that transforms SCSS into CSS.
This loader is based on Webpack sass-loader.

In order to import the resulting CSS in the browser you must use it with the `liferay-npm-bundler-loader-css-loader`.

## How to use

In order to use this loader you must declare a rule in your module's `.npmbundlerrc` file. Example:

    "/": {
	    "rules": [
		    {
			    "test": "src/**/@(*.sass|*.scss)",
				"extension": ".js",
				"use": [
					"css-loader",
					"sass-loader"
				]
		    }
	    ]
    },

 - **test**: Specify the blob expression for the files that the loader should process
 - **extension**: Specify a file extension to be appended to the resulting file
 - **use**: Specify the name of the loader to use. The Liferay NPM Bundler will look for a loader with the provided name prefixed with "**liferay-npm-bundler-loader-**".

As with Webpack sass-loader, this loader tries to use `node-sass` by default. You can change it by setting the `implementation` option in your loader rule.

    "/": {
	    "rules": [
		    {
			    "test": "src/**/@(*.sass|*.scss)",
				"extension": ".js",
				"use": [
					"css-loader",
					{ 
						"loader": "sass-loader",
						"options": {
							"implementation": "sass"
						}
					}
				]
		    }
	    ]
    },