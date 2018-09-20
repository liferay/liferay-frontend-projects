import fs from 'fs-extra';
import {ncp} from 'ncp';

/**
 *
 */
export default function() {
	fs.mkdirpSync('build');

	ncp(
		'assets',
		'build',
		{
			filter: function(path) {
				return !/\/\.placeholder$/.test(path);
			},
		},
		function(err) {
			if (err) {
				console.error(err);
				process.exit(1);
			} else {
				console.log('Project assets copied.');
			}
		}
	);
}
