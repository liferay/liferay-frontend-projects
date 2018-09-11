import os from 'os';
import path from 'path';
import readJsonSync from 'read-json-sync';

let cfg = {};

try {
	cfg = readJsonSync(
		path.join(os.homedir(), '.generator-liferay-bundle.json')
	);
} catch (err) {
	if (err.code !== 'ENOENT') {
		throw err;
	}
}

cfg.defaultDeployDir = cfg.defaultDeployDir || '/liferay';
cfg.defaultDeployDir = path.resolve(cfg.defaultDeployDir);

/**
 * Get the default absolute path to deploy directory as configured by the user.
 * @return {String}
 */
export function getDefaultDeployDir() {
	return cfg.defaultDeployDir;
}
