// Renders coverage/coverage-summary.json as a markdown table for the job summary.
import { readFileSync } from "node:fs";

const path = process.argv[2] ?? "coverage/coverage-summary.json";

let total;
try {
  total = JSON.parse(readFileSync(path, "utf8")).total;
} catch (err) {
  process.stdout.write(`## Coverage\n\nNo coverage report found at \`${path}\`.\n`);
  process.exit(0);
}

const rows = ["lines", "statements", "functions", "branches"].map((key) => {
  const { covered, total: n, pct } = total[key];
  const label = key[0].toUpperCase() + key.slice(1);
  return `| ${label} | ${covered} / ${n} | ${pct.toFixed(2)}% |`;
});

process.stdout.write(
  ["## Coverage", "", "| Metric | Covered | % |", "| --- | --- | --- |", ...rows, ""].join("\n")
);
