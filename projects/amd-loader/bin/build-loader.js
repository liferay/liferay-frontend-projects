/**
 * SPDX-FileCopyrightText: © 2014 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const {run} = require('./util');

run.withEnv({flavor: 'debug'}, 'webpack');
run.withEnv({flavor: 'prod'}, 'webpack');
run.withEnv({flavor: 'min'}, 'webpack');
