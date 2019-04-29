// Stolen from https://github.com/marvinhagemeister/changelogged/blob/master/src/api.ts :P

import fetch from "isomorphic-unfetch";

/**
 * Create an easy to use Promise-based function to query the backend
 * @param token GitHub app token
 * @param repo Name of the repository
 */
export const createFetch = (token: string) => (query: string) => {
	return fetch("https://api.github.com/graphql", {
		method: "post",
		headers: {
			Authorization: "bearer " + token,
			"Content-Type": "application/json",
			"User-Agent": "git-pr-size-app"
		},
		body: JSON.stringify({
			query: query.replace(/[\n]/g, "")
		})
	}).then(async res => {
		const result = await res.json();
		if (result.errors) {
			const error = new Error(
				"Github returned errors: \n" +
					result.errors.map((e: any) => `  - ${e.message}\n`)
			);
			(error as any).errors = result.errors;
			throw error;
		}

		return result;
	});
};

export interface PRsRes {
	mergedAt: string;
	author: {
		login: string;
	};
	title: string;
	number: number;
}

export async function fetchPRs(
	request: (query: string) => any,
	repo: string,
	count: number
): Promise<PRsRes[]> {
	const [owner, name] = repo.split("/");

	// GitHub has a limit of 100 items per page
	if (count > 100) {
		throw new Error(
			"Support for fetching more than 100 PRs is currently not supported"
		);
	}
	const data = await request(`
		  {
			  repository(name: "${name}", owner: "${owner}") {
				  pullRequests(states: MERGED, last: ${count}, orderBy: {field: CREATED_AT, direction: ASC}) {
					  nodes {
						  mergedAt
						  author {
							  login
						  }
						  title
						  number
					  }
				  }
			  }
		  }
	`);

	console.log(data);

	return data.data.repository.pullRequests.nodes;
}
