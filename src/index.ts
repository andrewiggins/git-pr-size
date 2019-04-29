import * as path from 'path';
import { readFileSync } from 'fs';
import { createFetch, fetchPRs } from './github';

const access_token = readFileSync(path.join(__dirname, '.access_token'), 'utf8').trim();

async function run() {
	const fetch = createFetch(access_token);
	const prs = await fetchPRs(fetch, 'developit/preact', 10);

	console.log(prs);
}

run();
