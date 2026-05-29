export function parseArgv() {
  let input;
  let output;
  let themeFolder;
  let gtag;
  let domain;
  let title;
  let download;
  let github;
  let versionsUrl;

  const argv = process.argv.slice(2);

  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--вхід")) {
      input = argv[i].split("=")[1];
    } else if (argv[i].startsWith("--вихід")) {
      output = argv[i].split("=")[1];
    } else if (argv[i].startsWith("--вигляд")) {
      themeFolder = argv[i].split("=")[1];
    } else if (argv[i].startsWith("--ґтег")) {
      gtag = argv[i].split("=")[1];
    } else if (argv[i].startsWith("--домен")) {
      domain = argv[i].split("=")[1];
    } else if (argv[i].startsWith("--назва")) {
      title = argv[i].split("=")[1];
    } else if (argv[i].startsWith("--завантажити")) {
      download = argv[i].split("=")[1];
    } else if (argv[i].startsWith("--гітхаб")) {
      github = argv[i].split("=")[1];
    } else if (argv[i].startsWith("--версії")) {
      versionsUrl = argv[i].split("=")[1];
    }
  }

  return {
    input,
    output,
    themeFolder,
    gtag,
    domain,
    title,
    download,
    github,
    versionsUrl,
  };
}
