import * as path from "path";
import { readFile, writeFile } from "fs";
import { promisify } from "util";
import { determineSizes } from "../src";
import { getCommits } from "../src/git";
import { execAsync } from "../src/cmd";

const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);

const cwd = "D:/github/preactjs/preact";
const execOptions = { cwd };

async function getSize() {
	await execAsync("npm run build:core", execOptions);

	const preactjs = path.join(cwd, "./dist/preact.js");
	const contents = await readFileAsync(preactjs, "utf8");
	await writeFileAsync(
		preactjs,
		contents
			.split("\n")
			.filter(line => !line.startsWith("//# sourceMappingURL"))
			.join("\n"),
		"utf8"
	);

	const { stdout } = await execAsync(
		"gzip-size.cmd --raw ./dist/preact.js --raw",
		execOptions
	);
	return parseInt(stdout.toString().trim(), 10);
}

async function getCommitsTest() {
	const commits = await getCommits("-n 3 --first-parent -- ./src", execOptions);
	console.log(commits);

	const asyncIter = determineSizes(
		cwd,
		commits.reverse().map(c => c.oid),
		getSize
	);

	for await (let result of asyncIter) {
		console.log(result);
	}
}

getCommitsTest();
