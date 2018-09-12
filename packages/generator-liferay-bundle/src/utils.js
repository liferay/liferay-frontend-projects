import fs from 'fs';
import path from 'path';

/**
 * A class to help copying Yeoman templates.
 */
export class Copier {
	/**
	 * @param {Generator} generator a Yeoman generator
	 */
	constructor(generator) {
		this._generator = generator;
	}

	/**
	 * Instantiate a Yeoman template file.
	 * @param  {String} src path to template
	 * @param  {Object} context optional context object to use when
	 * 						instantiating the template (defaults to {})
	 * @param  {String} dest optional destination name (defaults to src)
	 */
	copyFile(src, {context = {}, dest} = {}) {
		const gen = this._generator;

		const fullContext = Object.assign({}, gen.answers);
		Object.assign(fullContext, context);

		dest = dest || src;

		gen.fs.copyTpl(
			gen.templatePath(src),
			gen.destinationPath(dest),
			fullContext
		);
	}

	/**
	 * Instantiate all Yeoman template files found in a directory tree.
	 * @param  {String} src path to template
	 * @param  {Object} context optional context object to use when
	 * 						instantiating the template (defaults to {})
	 */
	copyDir(src, {context = {}} = {}) {
		const gen = this._generator;
		const files = fs.readdirSync(gen.templatePath(src));

		files.forEach(file => {
			if (file === '.DS_Store') {
				return;
			}

			const filePath = path.join(src, file);

			if (fs.statSync(gen.templatePath(filePath)).isDirectory()) {
				this.copyDir(filePath, {context});
			} else {
				this.copyFile(filePath, {context});
			}
		});
	}
}

/**
 * A class to help modifying JSON files.
 */
export class JsonModifier {
	/**
	 * @param {Generator} generator a Yeoman generator
	 * @param {String} path path to file
	 */
	constructor(generator, path) {
		this._generator = generator;
		this._path = path;
	}

	/**
	 * Get the JSON object associated to this modifier
	 * @return {Object} a parsed JSON object
	 */
	get json() {
		return JSON.parse(this._generator.fs.read(this._path));
	}

	/**
	 * Modify an existing JSON file.
	 * @param {Function} modifier the code that modifies the JSON (it receives a
	 * 						single parameter with the JSON object)
	 */
	modifyJson(modifier) {
		const gen = this._generator;

		let json = this.json;

		modifier(json);

		gen.fs.write(this._path, JSON.stringify(json, null, '	'));
	}
}

/**
 * A class to help modifying the package.json file.
 */
export class PkgJsonModifier extends JsonModifier {
	/**
	 * @param {Generator} generator a Yeoman generator
	 */
	constructor(generator) {
		super(generator, 'package.json');
	}

	/**
	 * Set the main entry of the package.json file
	 * @param {string} module module name
	 */
	setMain(module) {
		this.modifyJson(json => {
			json.main = module;
		});
	}

	/**
	 * Add a devDependency to the pacakge.json file
	 * @param {String} name package name
	 * @param {String} semver semver constraints
	 */
	addDevDependency(name, semver) {
		this.modifyJson(json => {
			json.devDependencies = json.devDependencies || {};
			json.devDependencies[name] = semver;
		});
	}

	/**
	 * Add a dependency to the pacakge.json file
	 * @param {String} name package name
	 * @param {String} semver semver constraints
	 */
	addDependency(name, semver) {
		this.modifyJson(json => {
			json.dependencies = json.dependencies || {};
			json.dependencies[name] = semver;
		});
	}

	/**
	 * Merge all dependencies and devDependencies contained in a JSON object
	 * into the package.json file.
	 * @param {Object} dependencies an object with dependencies and
	 * 						devDependencies fields
	 */
	mergeDependencies(dependencies) {
		Object.entries(dependencies.dependencies).forEach(([name, semver]) =>
			this.addDependency(name, semver)
		);

		Object.entries(dependencies.devDependencies).forEach(([name, semver]) =>
			this.addDevDependency(name, semver)
		);
	}

	/**
	 * Prepend a build command to the build npm script of package.json
	 * @param {String} command the command to run
	 */
	addBuildStep(command) {
		this.modifyJson(json => {
			json.scripts = json.scripts || {};
			json.scripts.build = json.scripts.build || '';
			json.scripts.build = `${command} && ${json.scripts.build}`;
		});
	}

	/**
	 * Add a new npm script to package.json
	 * @param {String} name name of script
	 * @param {String} command command to run
	 */
	addScript(name, command) {
		this.modifyJson(json => {
			json.scripts = json.scripts || {};
			json.scripts[name] = command;
		});
	}
}

/**
 * A class to help modifying the .npmbundlerrc file.
 */
export class NpmbundlerrcModifier extends JsonModifier {
	/**
	 * @param {Generator} generator a Yeoman generator
	 */
	constructor(generator) {
		super(generator, '.npmbundlerrc');
	}

	/**
	 * Merge all imports contained in a JSON object into the .npmbundlerrc file.
	 * @param {Object} imports an object containing the config.imports section
	 */
	mergeImports(imports) {
		this.modifyJson(json => {
			json['config'] = json['config'] || {};
			json['config']['imports'] = json['config']['imports'] || {};

			Object.entries(imports).forEach(([provider, dependencies]) => {
				json['config']['imports'][provider] =
					json['config']['imports'][provider] || {};

				Object.entries(dependencies).forEach(([name, semver]) => {
					json['config']['imports'][provider][name] = semver;
				});
			});
		});
	}

	/**
	 * Add an exclusion to the .npmbundlerrc file.
	 * @param {string} name name of package
	 * @param {boolean} value true to exclude package
	 */
	addExclusion(name, value = true) {
		this.modifyJson(json => {
			json['exclude'] = json['exclude'] || {};
			json['exclude'][name] = value;
		});
	}
}

/**
 * A class to help modifying the webpack.rules.json file of the start script.
 */
export class ScriptsStartWebpackRulesJsonModifier extends JsonModifier {
	/**
	 * @param {Generator} generator a Yeoman generator
	 */
	constructor(generator) {
		super(generator, 'scripts/start/webpack.rules.json');
	}

	/**
	 * Add a rule to webpack.rules.json file.
	 * @param {RegExp} regex a regex expression to match files
	 * @param {string} loader the name of a webpack loader
	 */
	addRule(regex, loader) {
		this.modifyJson(json => {
			let test = regex.toString();

			test = test.substring(1, test.length - 1);

			json.push({
				test: test,
				use: loader,
			});
		});
	}
}

/**
 * A class to help modifying the styles.css file.
 */
export class StylesCssModifier {
	/**
	 * @param {Generator} generator a Yeoman generator
	 */
	constructor(generator) {
		this._generator = generator;
	}

	/**
	 * Add a CSS rule to styles.css file.
	 * @param {String} selector CSS selector
	 * @param {Array} values string list of CSS attributes
	 */
	addRule(selector, ...values) {
		const gen = this._generator;

		let css = gen.fs.read('css/styles.css');

		css += `${selector} {
${values.map(value => `	${value}`).join('\n')}
}\n\n`;

		gen.fs.write('css/styles.css', css);
	}
}
