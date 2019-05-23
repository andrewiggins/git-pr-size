// size.js for calculating size in preact repo

const path = require("path");
const { readFile, writeFile } = require("fs");
const { promisify } = require("util");
const { exec } = require("child_process");

const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);
const execAsync = promisify(exec);

const cwd = __dirname;
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
	return parseInt(stdout.trim(), 10);
}

getSize().then(size => console.log(size));
