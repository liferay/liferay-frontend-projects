/**
 * SPDX-FileCopyrightText: © 2014 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const {run} = require('./util');

run('webpack', '--env.flavor=debug');
run('webpack', '--env.flavor=prod');
run('webpack', '--env.flavor=min');
