import { determineSizes } from "../src";
import { getCommits } from "../src/git";

async function getCommitsTest() {
	const commits = await getCommits("-n 6 --first-parent -- ./src", {
		cwd: "D:/github/developit/preact"
	});
	console.log(commits);

	const getSize = () => Promise.resolve(Math.floor(Math.random() * 10 + 1));
	const sizes = await determineSizes(commits.map(c => c.oid), getSize);
	console.log(sizes);
}

getCommitsTest();
