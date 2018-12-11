## Initial

```json
{
	"scripts": {
		"build": "metalsoy --soyDeps \"node_modules/+(metal-progressbar|metal-tooltip|com.liferay.frontend.js.web)/**/*.soy\" && cross-env NODE_ENV=production babel --source-maps -d classes/META-INF/resources src/main/resources/META-INF/resources && liferay-npm-bundler && npm run cleanSoy",
		"csf": "csf src/**/*.js test/**/*.js",
		"format": "npm run csf -- -i",
		"test": "jest"
	}
}
```

## Using liferay-npm-scripts

### package.json

```json
{
	"scripts": {
		"build": "liferay-scripts build --soy",
		"csf": "liferay-scripts lint",
		"format": "liferay-scripts format",
		"test": "liferay-scripts test"
	}
}
```

### .liferaynpmscriptsrc

I'm hesitant to using an aditional since we already have so many.

```json
{
	"build": {
		"dependencies": [
			"metal-progressbar",
			"metal-tooltip",
			"com.liferay.frontend.js.web"
		]
	}
}
```
