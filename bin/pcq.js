#!/usr/bin/env node
require("yargs")
  .scriptName("pcq")
  .usage("$0 <cmd> [args]")
  .command(
    "migrate [dir]",
    "Run migration scripts",
    (yargs) => {
      yargs.positional("dir", {
        type: "string",
        describe: "Directory for migration scripts",
      });
      yargs.demandOption("dir", "Migration directory is required");
    },
    (argv) => {
      console.log("migrate", argv.dir);
    }
  )
  .command(
    "run [script]",
    "Run a sql script",
    (yargs) => {
      yargs.positional("script", {
        type: "string",
        describe: "SQL script to run",
      });
      yargs.demandOption("script", "Script is required");
    },
    (argv) => {
      console.log("run", argv.script);
    }
  )
  .command(
    "query [query]",
    "Run a query",
    (yargs) => {
      yargs.positional("query", { type: "string", describe: "Query to run" });
      yargs.demandOption("query", "Query is required");
    },
    (argv) => {
      console.log("query", argv.query);
    }
  )
  .demandCommand()
  .help().argv;
