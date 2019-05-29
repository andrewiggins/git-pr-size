import { red } from "kleur";
import { CommitSize } from "./index";
import { Commit } from "./git";

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

export function logResult(commit: Commit, sizeInfo: CommitSize) {
	const diff =
		sizeInfo.sizeDiff > 0
			? `+${sizeInfo.sizeDiff}`
			: sizeInfo.sizeDiff.toString();
	console.log(`${commit.shortOid}\t${sizeInfo.size}\t${diff}\t${commit.subject}`);
}
