#!/usr/bin/env node
const { spawnSync } = require("node:child_process");

const npmExecPath = process.env.npm_execpath;
const nodeBinary = process.execPath;

const targetVersion =
  process.env.NEWMAN_SQLITE_TARGET ?? process.versions.node;

const args = [
  npmExecPath ?? "npm",
  "rebuild",
  "better-sqlite3",
  "--build-from-source",
  `--target=${targetVersion}`,
  "--dist-url=https://nodejs.org/download/release",
];

const command = npmExecPath ? nodeBinary : args[0];
const finalArgs = npmExecPath ? args : args.slice(1);

const result = spawnSync(command, finalArgs, {
  stdio: "inherit",
  shell: npmExecPath ? false : true,
});

if (result.status !== 0) {
  console.error(
    `[NEWMAN] No se pudo recompilar better-sqlite3 para Node ${targetVersion}.`
  );
  if (result.error) {
    console.error(result.error);
  }
  process.exit(result.status ?? 1);
}
