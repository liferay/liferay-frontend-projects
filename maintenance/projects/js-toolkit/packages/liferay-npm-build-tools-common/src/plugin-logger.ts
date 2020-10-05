/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * A message descriptor
 */
export interface Message {
	source: string;
	level: 'info' | 'warn' | 'error';
	things: any[];
	link?: string;
}

class MessageTweaker {
	constructor(msg: Message) {
		this._msg = msg;
	}

	linkTo(link: string): MessageTweaker {
		this._msg.link = link;
		return this;
	}

	linkToCode(code: number): MessageTweaker {
		let strCode: string = code.toString();

		while (strCode.length < 4) {
			strCode = `0${strCode}`;
		}

		this._msg.link = `https://github.com/liferay/liferay-js-toolkit/wiki/Report-messages#${strCode}`;

		return this;
	}

	linkToIssue(issueNumber: number): MessageTweaker {
		this._msg.link = `https://github.com/liferay/liferay-js-toolkit/issues/${issueNumber}`;

		return this;
	}

	private _msg: Message;
}

/**
 * An object to hold plugin messages.
 */
export default class PluginLogger {
	constructor() {
		this._msgs = [];
	}

	/**
	 * Log an informational message
	 * @param source the identifier for the source of the message
	 * @param things the objects or strings to print
	 */
	info(source: string, ...things: any[]): MessageTweaker {
		const msg: Message = {
			source,
			level: 'info',
			things,
		};

		this._msgs.push(msg);

		return new MessageTweaker(msg);
	}

	/**
	 * Log a warn message
	 * @param source the identifier for the source of the message
	 * @param things the objects or strings to print
	 */
	warn(source: string, ...things: any[]): MessageTweaker {
		const msg: Message = {
			source,
			level: 'warn',
			things,
		};

		this._msgs.push(msg);

		return new MessageTweaker(msg);
	}

	/**
	 * Log an error message
	 * @param source the identifier for the source of the message
	 * @param things the objects or strings to print
	 */
	error(source: string, ...things: any[]): MessageTweaker {
		const msg: Message = {
			source,
			level: 'error',
			things,
		};

		this._msgs.push(msg);

		return new MessageTweaker(msg);
	}

	/**
	 * Get the list of messages
	 */
	get messages(): Message[] {
		return this._msgs;
	}

	/**
	 * Test if there are warn messages.
	 * @return true if at least one warn message is registered in the logger
	 */
	get warnsPresent(): boolean {
		return this._msgs.filter(msg => msg.level === 'warn').length > 0;
	}

	/**
	 * Test if there are error messages.
	 * @return true if at least one error message is registered in the logger
	 */
	get errorsPresent(): boolean {
		return this._msgs.filter(msg => msg.level === 'error').length > 0;
	}

	/**
	 * Return a printable string representation of the messages logged till now
	 */
	toString(): string {
		return this._msgs.reduce(
			(str, {level, source, things}) =>
				`${str}${source}:${level}: ${things.join(' ')}\n`,
			''
		);
	}

	/**
	 * Return an HTML string representation of the messages logged till now
	 * containing one line (<br> separated) per message
	 */
	toHtml(): string {
		return this._msgs.reduce((str, {level, source, things, link}) => {
			let html = `${str}${source}:${level}: ${things.join(' ')}<br>`;

			if (link) {
				html += ` <a href='${link}' title='Detailed information'>🛈🔗</a>`;
			}

			return html;
		}, '');
	}

	private _msgs: Message[];
}
