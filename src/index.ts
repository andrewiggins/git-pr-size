import { debug } from "./logger";
import { checkoutRef, getCurrentRef } from "./git";
import { ExecOptions, exec } from "child_process";

export interface CommitSize {
	oid: string;
	size: number;
	sizeDiff: number;
}

export async function* determineSizes(
	repoPath: string,
	commits: string[],
	getSize: (commit: string) => Promise<number>
): AsyncIterable<CommitSize> {
	const execOptions: ExecOptions = {
		cwd: repoPath
	};

	const initialRef = await getCurrentRef(execOptions);
	debug(`Initial ref: ${initialRef}`);

	try {
		let prevSize: number | null = null;
		for (let commit of commits) {
			await checkoutRef(commit, execOptions);

			const size = await getSize(commit);
			const result: CommitSize = {
				oid: commit,
				size: size,
				sizeDiff: prevSize == null ? 0 : size - prevSize
			};

			debug('Result:', result);
			yield result;

			prevSize = size;
		}
	} finally {
		debug(`Restoring initial ref...`);
		await checkoutRef(initialRef, execOptions);
	}
}
