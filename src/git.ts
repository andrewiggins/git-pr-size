import { ExecOptions } from 'child_process';
import { execAsync } from './cmd';

export interface Commit {
	/** The object id (i.e. hash or sha1) of the commit */
	oid: string;

	/** The short version of the object id (i.e. hash or sha1) of the commit */
	shortOid: string;

	/** The subject of the commit */
	subject: string;
}

const logRegex = /(\w+) (\w+) (.*)/i

const logFormat = ' --pretty="format:%H %h %s" --first-parent ';
function getLogCommand(oldArgs = '') {
	const i = oldArgs.search(/(?:\W|^)--(?:\W|$)/);
	const cmd = "git log ";

	if (i == -1) {
		return cmd + oldArgs + logFormat;
	} else {
		return cmd + oldArgs.slice(0, i) + logFormat + oldArgs.slice(i);
	}
}

function parseLogOutput(stdout: string): Commit[] {
	return stdout
		.split("\n")
		.map(line => line.trim())
		.map(line => {
			const match = line.match(logRegex);
			if (match == null) {
				throw new Error('git log output did not match expected format.');
			}

			return {
				oid: match[1],
				shortOid: match[2],
				subject: match[3]
			};
		});
}

export async function getCommits(logArgs?: string, options?: ExecOptions): Promise<Commit[]> {
	const cmd = getLogCommand(logArgs);
	const { stdout } = await execAsync(cmd, options);
	return parseLogOutput(stdout.toString());
}

export async function getCurrentRef(options?: ExecOptions): Promise<string> {
	let output = await execAsync(`git symbolic-ref --short -q HEAD`, options);
	if (!output.stdout.toString().trim()) {
		output = await execAsync(`git rev-parse --short HEAD`, options);
	}

	return output.stdout.toString().trim();
}

export async function checkoutRef(ref: string, options?: ExecOptions): Promise<void> {
	await execAsync(`git checkout ${ref}`, options);
}
