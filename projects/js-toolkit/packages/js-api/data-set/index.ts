/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

export interface FDSCellRendererArgs {
	value: boolean | number | string | object | [];
}

export interface FDSCellRenderer {
	(args: FDSCellRendererArgs): HTMLElement;
}

export interface FDSFilterData {
	id: string;
	odataFilterString: string;
	selectedData: string;
}

export interface FDSFilterArgs {
	filter: FDSFilterData;
	setFilter: (val: Partial<FDSFilterData>) => void;
}

export interface FDSFilter {
	(args: FDSFilterArgs): HTMLElement;
}
