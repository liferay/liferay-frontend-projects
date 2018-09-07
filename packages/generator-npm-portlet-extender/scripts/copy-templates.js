const fs = require('fs');
const ncp = require('ncp').ncp;

const generators = fs
	.readdirSync('src')
	.filter(file => fs.statSync(`src/${file}`).isDirectory());

generators.forEach(generator => {
	if (!fs.existsSync(`src/${generator}/templates`)) {
		return;
	}

	mkdir('generators');
	mkdir(`generators/${generator}`);
	mkdir(`generators/${generator}/templates`);

	ncp(
		`src/${generator}/templates`,
		`generators/${generator}/templates`,
		err => {
			if (err) {
				console.error(err);
				process.exit(1);
			} else {
				console.log(`Templates for generator '${generator}' copied OK`);
			}
		}
	);
});

/**
 * Fail safe mkdir
 * @param  {String} dir directory name
 */
function mkdir(dir) {
	try {
		fs.mkdirSync(dir);
	} catch (err) {}
}
