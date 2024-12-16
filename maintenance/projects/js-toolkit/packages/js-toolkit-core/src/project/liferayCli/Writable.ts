/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/* eslint-disable @liferay/no-dynamic-require */
/* eslint-disable @typescript-eslint/no-explicit-any */

export type Writable<T> = {-readonly [P in keyof T]: T[P]};
