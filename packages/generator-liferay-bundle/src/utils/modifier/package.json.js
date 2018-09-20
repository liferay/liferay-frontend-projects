import {JsonModifier} from '..';

/**
 * A class to help modifying the package.json file.
 */
export default class extends JsonModifier {
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
