/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {withA11y} from '@storybook/addon-a11y';
import {withKnobs} from '@storybook/addon-knobs';
import {addDecorator, configure} from '@storybook/react';

function loadStories() {

	// Don't use path.join here or webpack will complain with:
	// "Critical dependency: the request of a dependency is an expression"

	// eslint-disable-next-line @liferay/no-dynamic-require
	require(process.env.STORYBOOK_CWD + '/test/stories/index.js');

	addDecorator(withA11y);
	addDecorator(withKnobs);
}

configure(loadStories, module);
