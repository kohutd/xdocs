export function parseArgv() {
  let inputFolder;
  let outputFolder;
  let themeFolder;
  let gtag;

  const argv = process.argv.slice(2);

  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--вхід")) {
      inputFolder = argv[i].split("=")[1];
    } else if (argv[i].startsWith("--вихід")) {
      outputFolder = argv[i].split("=")[1];
    } else if (argv[i].startsWith("--вигляд")) {
      themeFolder = argv[i].split("=")[1];
    } else if (argv[i].startsWith("--ґтег")) {
      gtag = argv[i].split("=")[1];
    }
  }

  return { inputFolder, outputFolder, themeFolder, gtag };
}
