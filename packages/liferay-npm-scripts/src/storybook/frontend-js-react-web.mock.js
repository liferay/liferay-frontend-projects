/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const react = require('react');

module.exports = {
	usePrevious: value => {
		const ref = react.useRef();
		react.useEffect(() => {
			ref.current = value;
		});

		return ref.current;
	},
};
