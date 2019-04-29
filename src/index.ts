import * as path from "path";
import { readFileSync } from "fs";
import { createFetch, fetchMasterPRs } from "./github";
import { getCommits } from "./git";

const access_token = readFileSync(
	path.join(__dirname, ".access_token"),
	"utf8"
).trim();

async function getPRs() {
	const fetch = createFetch(access_token);
	const prs = await fetchMasterPRs(fetch, "developit/preact", 10);

	console.log(prs);
}

async function getCommitsTest() {
	const commits = await getCommits('-n 6 -- ./src', { cwd: "D:/github/developit/preact" });
	console.log(commits);
}

// getPRs();
getCommitsTest();
