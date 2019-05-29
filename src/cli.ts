import mri from "mri";
import { logError, debug, setDebug } from "./logger";
import { determineSizes, CommitSize } from "./index";
import { getCommits, Commit } from "./git";
import { execAsync } from "./cmd";

interface CliArgs {
	_: string;
	help: boolean;
	version: boolean;
	cmd: string;
	rev: string;
	debug: boolean;
}

const help = `
🔍 Output the size difference of commits in the current branch

Usage:
  $ git-size-change [options] <range>

Options:
  --help, -h      Show usage information and the options listed here
  --version, -v   Show version information
  --cmd           The command to run to determine the size
  --debug         Output debug information to stdout

Examples:
  Get all sizes of commits made starting from a git tag
  $ git-size-change --cmd 'npm run size' v1.2.0..HEAD

  Get all sizes of commits since commit "abc"
  $ git-size-change --cmd 'npm run size' abc..HEAD
`;

function parseArgs(argv: string[]): CliArgs {
	const args: CliArgs = mri(argv, {
		boolean: ["help", "version", "debug"],
		string: ["cmd"],
		alias: {
			h: "help",
			v: "version"
		}
	}) as any;

	if (!args.help && !args.version) {
		if (!args._.length) {
			throw new Error(
				"Please specify a valid commit range in the form of mytag..HEAD"
			);
		}

		if (!args.cmd) {
			throw new Error("Please specify a command to determine the current size");
		}
	}

	args.rev = Array.isArray(args._) ? args._[0] : args._;

	return args;
}

const getSize = (args: CliArgs) => async () => {
	const { stdout } = await execAsync(args.cmd);
	return parseInt(stdout.toString().trim(), 10);
};

function logResult(args: CliArgs, commit: Commit, sizeInfo: CommitSize) {
	const diff =
		sizeInfo.sizeDiff > 0
			? `+${sizeInfo.sizeDiff}`
			: sizeInfo.sizeDiff.toString();
	console.log(`${sizeInfo.size}\t${diff}\t${commit.subject}`);
}

async function run() {
	try {
		const args = parseArgs(process.argv.slice(2));
		if (args.help) {
			console.log(help);
			return;
		} else if (args.version) {
			console.log(require("../package.json").version);
			return;
		}

		setDebug(args.debug);
		debug(args);

		const commits = (await getCommits(args.rev)).reverse();
		debug("Commits:", commits);

		const commitMap: Record<string, Commit> = {};
		for (let commit of commits) {
			commitMap[commit.oid] = commit;
		}

		const asyncIter = determineSizes(
			process.cwd(),
			commits.map(c => c.oid),
			getSize(args)
		);

		const results = [];
		for await (const result of asyncIter) {
			logResult(args, commitMap[result.oid], result);
		}
	} catch (error) {
		logError(error.stack);
		process.exit(1);
	}
}

run();
