interface Config {
	getCommits(): AsyncIterable<string>;
	getSize(commit: string): Promise<number>;
}

interface CommitSize {
	oid: string;
	size: number;
	sizeDiff: number;
}

export async function* determineSizes({
	getCommits,
	getSize
}: Config): AsyncIterable<CommitSize> {
	let prevSize: number | null = null;
	for await (let commit of getCommits()) {
		const size = await getSize(commit);
		yield ({
			oid: commit,
			size: size,
			sizeDiff: prevSize == null ? 0 : size - prevSize
		});

		prevSize = size;
	}
}
