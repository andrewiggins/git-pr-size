import * as path from "path";
import { readFileSync } from "fs";
import { createFetch, fetchMasterPRs, fetchAssociatedPRs } from "./github";
import { getCommits } from "./git";
import { determineSizes } from "./size";

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
	const commits = await getCommits("-n 6 --first-parent -- ./src", {
		cwd: "D:/github/developit/preact"
	});
	console.log(commits);

	const fetch = createFetch(access_token);
	const prs = await Promise.all(
		commits.map(
			async commit =>
				(await fetchAssociatedPRs(fetch, commit.oid, "developit/preact", 1))[0]
		)
	);

	console.log(prs);

	for (let i = 0; i < commits.length; i++) {
		let commit = commits[i];
		let prCommit = prs[i].mergeCommit;
		console.log(commit.oid == prCommit.oid, commit.oid, prCommit.oid);
	}

	const iter = determineSizes({
		getCommits: async function*() {
			yield* (await getCommits()).map(commit => commit.oid);
		},
		async getSize() {
			return Promise.resolve(Math.floor(Math.random() * 10 + 1));
		}
	});

	for await (const sizeInfo of iter) {
		console.log(sizeInfo);
	}
}

// getPRs();
getCommitsTest();
