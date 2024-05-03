/**
 * SPDX-FileCopyrightText: © 2014 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const {run} = require('./util');

run.withEnv({...process.env, flavor: 'debug'}, 'webpack');
run.withEnv({...process.env, flavor: 'prod'}, 'webpack');
run.withEnv({...process.env, flavor: 'min'}, 'webpack');
