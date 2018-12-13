const path = require('path');

const CWD = process.cwd();

module.exports = {
	build: {
		input: path.join(CWD, 'src/main/resources/META-INF/resources'),
		output: path.join(CWD, 'classes/META-INF/resources')
	}
};
