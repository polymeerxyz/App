export function parseArguments() {
  const argv = process.argv.slice(2);
  const args: Record<string, string> = {};

  for (let index = 0; index < Math.floor(argv.length / 2); index++) {
    args[argv[index * 2].replace(/-/g, "")] = argv[index * 2 + 1];
  }

  return args;
}
