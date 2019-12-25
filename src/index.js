#!/usr/bin/env node
require("dotenv").config();

const yargs = require("yargs");
const { Client } = require("pg");
const fs = require("fs");
const chalk = require("chalk");

const options = yargs
  .usage("Usage: $0 [options] <script> [args]")
  .demandCommand(1)
  .string("d")
  .alias("d", "databaseUrl")
  .describe("d", "Specify the database url").argv;

const script = options._[0];
const args = options._.slice(1);
const dbUrl = options.databaseUrl || process.env.DATABASE_URL;

const scripts = [script];

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  client.connect(err => {
    if (err) {
      console.error(chalk.red("-- Error"), err.message);
      process.exit();
    }
  });

  let counter = 0;
  for (const file of scripts) {
    console.error(chalk.green("-- Start %s"), file);

    try {
      const query = fs.readFileSync(script, "utf8");
      const res = await client.query(query, args);

      if (res.rows) {
        console.log(JSON.stringify(res.rows, null, 2));
      }
      console.error(chalk.green("-- Finish"), script);
    } catch (err) {
      console.error(chalk.red("-- Error"), err.message);
      client.end();
      console.error(chalk.red("-- Exiting early due to error"));
      process.exit(1);
    }

    counter++;
  }

  client.end();
  console.error(
    chalk.green("-- Ran %s script%s"),
    counter,
    counter == 1 ? "" : "s"
  );
})();
