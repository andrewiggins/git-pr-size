import { getCommits } from "./git";
import { determineSizes } from "./size";
import { debug } from "./logger";

async function getCommitsTest() {
	const commits = await getCommits("-n 6 --first-parent -- ./src", {
		cwd: "D:/github/developit/preact"
	});
	debug(commits);

	const getSize = () => Promise.resolve(Math.floor(Math.random() * 10 + 1));
	const sizes = await determineSizes(commits.map(c => c.oid), getSize);
	debug(sizes);
}

// getPRs();
getCommitsTest();
