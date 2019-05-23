import mri from "mri";
import { logError, debug, setDebug } from "./logger";
import { determineSizes } from "./size";
import { getCommits } from "./git";

interface CliArgs {
	_: string;
	help: boolean;
	version: boolean;
	cmd: string;
	revision: string;
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

	args.revision = args._;

	return args;
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
	} catch (error) {
		logError(error.message);
		process.exit(1);
	}
}

run();
