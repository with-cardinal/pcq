#!/usr/bin/env node
require("dotenv").config();

const yargs = require("yargs");
const { Client } = require("pg");
const fs = require("fs");

const options = yargs.usage("Usage: $0 <script> [args]").demandCommand(1).argv;
const script = options._[0];
const args = options._.slice(1);

const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect(err => {
  if (err) {
    console.error("Error", err.message);
    process.exit();
  }
});

var query = fs.readFileSync(script, "utf8");

client.query(query, args, (err, res) => {
  if (err) {
    console.error("Error", err.message);
  } else {
    console.log(JSON.stringify(res.rows, null, 2));
  }

  client.end();
});
