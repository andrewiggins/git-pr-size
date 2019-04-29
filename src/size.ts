interface CommitSize {
	oid: string;
	size: number;
	sizeDiff: number;
}

export async function determineSizes(
	commits: string[],
	getSize: (commit: string) => Promise<number>
): Promise<CommitSize[]> {
	const result = [];

	let prevSize: number | null = null;
	for (let commit of commits) {
		const size = await getSize(commit);
		result.push({
			oid: commit,
			size: size,
			sizeDiff: prevSize == null ? 0 : size - prevSize
		});

		prevSize = size;
	}

	return result;
}
