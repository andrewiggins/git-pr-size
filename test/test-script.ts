import * as path from "path";
import { readFile, writeFile } from "fs";
import { promisify } from "util";
import { determineSizes } from "../src";
import { getCommits, Commit } from "../src/git";
import { execAsync } from "../src/cmd";
import { logResult } from "../src/logger";

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
	const commits = (await getCommits(
        // "50f7f7..HEAD -- ./src",
		// "master~2..HEAD -- ./src",
		"-n 6 -- ./src",
		execOptions
	)).reverse();
	console.log(commits);

	const commitMap: Record<string, Commit> = {};
	for (let commit of commits) {
		commitMap[commit.oid] = commit;
	}

	const asyncIter = determineSizes(cwd, commits.map(c => c.oid), getSize);

	const results = [];
	for await (let result of asyncIter) {
		results.push(result);
	}

	// Log all commits at the end
	for (let result of results) {
		logResult(commitMap[result.oid], result);
	}
}

getCommitsTest();
