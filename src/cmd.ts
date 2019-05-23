import { promisify } from "util";
import { exec, ExecOptions } from "child_process";
import { debug } from "./logger";

const _execAsync = promisify(exec);

export function execAsync(
	cmd: string,
	options?: ExecOptions
): ReturnType<typeof _execAsync> {
	debug(`Executing ${cmd}...`);
	return _execAsync(cmd, options);
}
