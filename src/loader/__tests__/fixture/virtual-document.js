import fs from 'fs';

/**
 *
 */
class Script {
	/**
	 *
	 * @return {void}
	 */
	load() {
		try {
			let content = fs.readFileSync(this.src, 'utf-8');

			eval(content);

			this.onload();
		} catch (error) {
			if (this.onerror) {
				this.onerror(error);
			}
		}
	}
}

const document = {
	head: {
		appendChild: function(script) {
			process.nextTick(function() {
				document.scripts.push(script);
				script.load();
			});
		},

		removeChild: function() {
			// Empty
		},
	},

	scripts: [],

	createElement: function() {
		return new Script();
	},
};

export default document;
