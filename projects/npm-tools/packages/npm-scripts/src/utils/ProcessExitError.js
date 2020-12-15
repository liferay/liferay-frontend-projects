/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * Error subclass that subroutines can use to indicate to the `main()`
 * entry point that they would like the process to exit with the
 * specified `status`.
 */
class ProcessExitError extends Error {
	constructor(status) {
		super('ProcessExit');

		this.status = status;
	}
}

module.exports = ProcessExitError;
