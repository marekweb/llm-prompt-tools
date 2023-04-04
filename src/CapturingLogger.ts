export class CapturingLogger {
  private output: string = "";
  log(...args: unknown[]) {
    this.output += args.join(" ") + "\n";
    return;
  }
  getOutput() {
    return this.output;
  }
  reset() {
    this.output = "";
  }
}
