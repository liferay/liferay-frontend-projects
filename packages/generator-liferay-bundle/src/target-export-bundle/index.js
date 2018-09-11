import Generator from 'yeoman-generator';

/**
 * Generator for export bundles.
 */
export default class extends Generator {
	/**
	 * Standard Yeoman initialization function
	 */
	initializing() {
		this.composeWith(require.resolve('../facet-project'));
		this.composeWith(require.resolve('../facet-deploy'));
		this.composeWith(require.resolve('./export-bundle'));
	}

	/**
	 * Standard Yeoman dependencies installation function
	 */
	install() {
		this.installDependencies({
			bower: false,
		});
	}
}
