// Stolen from https://github.com/marvinhagemeister/changelogged/blob/master/src/api.ts :P

import fetch from "isomorphic-unfetch";

export type Fetcher = (query: string, variables?: any) => Promise<any>;

export interface Commit {
	oid: string;
}

export interface PullRequest {
	mergedAt: string;
	author: {
		login: string;
	};
	title: string;
	number: number;
	mergeCommit: Commit;
}

const queries = {
	getPRs: `
		query ($name: String!, $owner: String!, $count: Int) {
			repository(name: $name, owner: $owner) {
				pullRequests(states: MERGED, last: $count, baseRefName: "master" orderBy: {field: CREATED_AT, direction: ASC}) {
					nodes {
						mergedAt
						author {
							login
						}
						title
						number
						mergeCommit {
							oid
						}
					}
				}
			}
		}`,
	getAssociatedPRs: `
		query ($name: String!, $owner: String!, $rev: String, $count: Int) {
			repository(name: $name, owner: $owner) {
				object(expression: $rev) {
					... on Commit {
						oid
						associatedPullRequests(last: $count, orderBy: {field: CREATED_AT, direction: ASC}) {
							totalCount
							nodes {
								mergedAt
								author {
									login
								}
								title
								number
								mergeCommit {
									oid
								}
							}
						}
					}
				}
			}
		}`
};

interface GetAssociatedPRsResult {
	data: {
		repository: {
			object: {
				oid: string;
				associatedPullRequests: {
					totalCount: number;
					nodes: PullRequest[];
				};
			};
		};
	};
}

/**
 * Create an easy to use Promise-based function to query the backend
 * @param token GitHub app token
 * @param repo Name of the repository
 */
export function createFetch(token: string): Fetcher {
	return (query: string, variables?: any) => {
		query = query.replace(/[\t]*\n[\t]*/g, " ");
		return fetch("https://api.github.com/graphql", {
			method: "post",
			headers: {
				Authorization: "bearer " + token,
				"Content-Type": "application/json",
				"User-Agent": "git-pr-size-app"
			},
			// body: query.replace(/[\n]/g, "")
			body: JSON.stringify({
				query: query,
				variables
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
}

export async function fetchMasterPRs(
	request: Fetcher,
	repo: string,
	count: number
): Promise<PullRequest[]> {
	// GitHub has a limit of 100 items per page
	if (count > 100) {
		throw new Error(
			"Support for fetching more than 100 PRs is currently not supported"
		);
	}

	const [owner, name] = repo.split("/");
	const data = await request(queries.getPRs, {
		owner,
		name,
		count
	});

	return data.data.repository.pullRequests.nodes;
}

export async function fetchAssociatedPRs(
	request: Fetcher,
	rev: string,
	repo: string,
	count: number = 1
): Promise<PullRequest[]> {
	// GitHub has a limit of 100 items per page
	if (count > 100) {
		throw new Error(
			"Support for fetching more than 100 PRs is currently not supported"
		);
	}

	const [owner, name] = repo.split("/");
	const data: GetAssociatedPRsResult = await request(queries.getAssociatedPRs, {
		rev,
		owner,
		name,
		count
	});

	return data.data.repository.object.associatedPullRequests.nodes;
}
