#!/usr/bin/env node
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const logPath = path.resolve("/tmp/cost-mon-daemon.log");
fs.writeFileSync(logPath, `started ${new Date().toISOString()}\n`);

const out = fs.openSync(logPath, "a");
const child = spawn("npx", ["tsx", path.resolve("scripts/appraisal-cost-monitor-sequential.ts")], {
  detached: true,
  stdio: ["ignore", out, out],
  env: process.env,
});
child.unref();
fs.writeFileSync("/tmp/cost-mon-daemon.pid", String(child.pid));
console.log("daemon pid:", child.pid, "log:", logPath);
process.exit(0);
