import { VM } from "vm2";
import { CapturingLogger } from "./CapturingLogger";

export const executeScript = (
  script: string,
  context?: Record<string, unknown>
): { output: string; error: string | undefined } => {
  let error: string | undefined;
  const capturingLogger = new CapturingLogger();
  const vm = new VM({
    timeout: 1000,
    sandbox: { console: capturingLogger, ...context },
  });

  // run() returns the evalued value of the last expression in the script
  let result: unknown;
  try {
    result = vm.run(script);
  } catch (e) {
    error = String(e);
  }
  let output = capturingLogger.getOutput();
  if (result !== undefined) {
    output += result + "\n";
  }
  return { output, error };
};
