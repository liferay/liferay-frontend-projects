# liferay-npm-bundler-loader-css-loader  

A Liferay NPM Bundler loader that process CSS code to an AMD Javascript module

that can be loaded in runtime by Liferay AMD Loader.

## How to use

In order to use this loader you must declare a rule in your module's `.npmbundlerrc` file. Example:

    "/": {
	    "rules": [
		    {
			    "test": "src/**/*.css",
			    "exclude": [],
			    "extension": ".js",
			    "use": "css-loader"
		    }
	    ]
    },

 - **test**: Specify the blob expression for the files that the loader should process
 - **extension**: Specify a file extension to be appended to the resulting file
 - **use**: Specify the name of the loader to use. The Liferay NPM Bundler will look for a loader with the provided name prefixed with "**liferay-npm-bundler-loader-**".