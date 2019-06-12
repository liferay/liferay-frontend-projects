/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import * as createReactApp from './create-react-app';

const msg = {
	unsupportedProjectType:
		'Your project type is not supported by Liferay JS Toolkit or cannot\n' +
		'cannot be autodetected.\n' +
		'\n' +
		'Please visit http://bit.ly/js-toolkit-wiki for the full list of\n' +
		'supported project types and how they are detected.\n',
};

export default function() {
	if (createReactApp.probe()) {
		createReactApp.run();
	} else {
		console.error(msg.unsupportedProjectType);
		process.exit(1);
	}
}
