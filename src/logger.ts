import { red } from "kleur";

export function logError(msg: string) {
	console.error(red("(!) Error: " + msg));
}

let shouldDebug = true;
export function setDebug(value: boolean): void {
	shouldDebug = value;
}

export function debug(...msgs: any[]): void {
	if (shouldDebug) {
		console.log(...msgs);
	}
}
