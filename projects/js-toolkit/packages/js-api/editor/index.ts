/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * Editor Transformer
 *
 * For CKEditor 4, see config API:
 * https://ckeditor.com/docs/ckeditor4/latest/api/CKEDITOR_config.html
 */

export interface EditorConfigTransformer<T> {
	(args: T): T;
}

export interface EditorTransformer<T> {
	editorConfigTransformer: EditorConfigTransformer<T>;
	foo: string;
}
