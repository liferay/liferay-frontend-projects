import ResolvablePromise from './resolvable-promise';

/**
 * A module descriptor
 */
export default class Module {
	/**
	 * @param {string} name name of module
	 */
	constructor(name) {
		this._name = name;
		this._dependencies = undefined;
		this._factory = undefined;
		this._implementation = undefined;

		this._state = {
			_fetch: ResolvablePromise.new(),
			_define: ResolvablePromise.new(),
			_implement: ResolvablePromise.new(),
		};
	}

	/**
	 * Name of module
	 */
	get name() {
		return this._name;
	}

	/**
	 * Dependencies of module
	 */
	get dependencies() {
		return this._dependencies;
	}

	/**
	 * AMD factory function
	 */
	get factory() {
		return this._factory;
	}

	/**
	 * Result of factory invocation (module.exports)
	 */
	get implementation() {
		return this._implementation;
	}

	/**
	 * Get the fetch promise which is fulfilled when the script containing the
	 * module definition has been loaded/failed.
	 *
	 * Note that a module may be defined even if it is not yet fetched because
	 * define() gets called while the script is being loaded.
	 * @return {ResolvablePromise}
	 */
	get fetch() {
		return this._state._fetch;
	}

	/**
	 * Shorthand for this.fetch.resolved
	 */
	get fetched() {
		return this.fetch.resolved;
	}

	/**
	 * Get the define promise which if fulfilled when the script had been
	 * registered by the AMD define() function.
	 *
	 * Note that definition does not imply implementation.
	 *
	 * Also note that a module may be defined even if it is not yet fetched
	 * because define() gets called while the script is being loaded.
	 * @return {ResolvablePromise}
	 */
	get define() {
		return this._state._define;
	}

	/**
	 * Shorthand for this.define.resolved
	 */
	get defined() {
		return this.define.resolved;
	}

	/**
	 * Get the implement promise which if fulfilled when the module has been
	 * defined and its AMD factory function has been invoked successfully.
	 */
	get implement() {
		return this._state._implement;
	}

	/**
	 * Shorthand for this.implement.resolved
	 */
	get implemented() {
		return this.implement.resolved;
	}

	/**
	 * Name of module
	 * @param {string} name
	 */
	set name(name) {
		throw new Error(`Name of module ${this.name} is read-only`);
	}

	/**
	 * Dependencies of module
	 * @param {Array} dependencies
	 */
	set dependencies(dependencies) {
		if (this._dependencies) {
			throw new Error(`Dependencies of module ${this.name} already set`);
		}

		this._dependencies = dependencies;
	}

	/**
	 * AMD factory function
	 * @param {function} factory
	 */
	set factory(factory) {
		if (this._factory) {
			throw new Error(`Factory of module ${this.name} already set`);
		}

		this._factory = factory;
	}

	/**
	 * Result of factory invocation (module.exports)
	 * @param {*} implementation
	 */
	set implementation(implementation) {
		if (this._implementation) {
			throw new Error(
				`Implementation of module ${this.name} already set`
			);
		}

		this._implementation = implementation;
	}
}
