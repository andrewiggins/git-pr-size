import { ExecOptions } from 'child_process';
import { execAsync } from './cmd';

export interface Commit {
	/** The object id (i.e. hash or sha1) of the commit */
	oid: string;

	/** The subject of the commit */
	subject: string;
}

const logFormat = ' --pretty="format:%H %s" --first-parent ';
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
			const i = line.indexOf(" ");
			return {
				oid: line.slice(0, i),
				subject: line.slice(i + 1)
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
