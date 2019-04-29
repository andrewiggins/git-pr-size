import { red } from "kleur";

export function logError(msg: string) {
	console.error(red("(!) Error: " + msg));
}
