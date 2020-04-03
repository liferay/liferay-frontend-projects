/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const React = require('react');

module.exports = {
	usePrevious: value => {
		const ref = React.useRef();

		React.useEffect(() => {
			ref.current = value;
		});

		return ref.current;
	},
};
