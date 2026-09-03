import fs from "fs";
import path from "path";
import ts from "typescript";

// The config only exists after loadConfig() resolves at boot, so no module may
// read it while being imported -- an import-time read either throws or, worse,
// silently captures a value from before the deployment config was applied.
//
// This parses every module that imports the config and reports any use of it
// that is not inside a function body.

const srcDir = __dirname;

const walk = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return walk(full);
    }

    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)
      ? [full]
      : [];
  });

const isFunctionLike = (node: ts.Node) =>
  ts.isFunctionDeclaration(node) ||
  ts.isFunctionExpression(node) ||
  ts.isArrowFunction(node) ||
  ts.isMethodDeclaration(node) ||
  ts.isGetAccessor(node) ||
  ts.isSetAccessor(node) ||
  ts.isConstructorDeclaration(node);

// The name the default export of the config module was imported under, if this
// file imports it at all.
const configBinding = (source: ts.SourceFile): string | null => {
  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement)) continue;

    const specifier = statement.moduleSpecifier;
    if (!ts.isStringLiteral(specifier)) continue;
    if (!/(^|\/)config$/.test(specifier.text)) continue;

    const name = statement.importClause?.name;
    if (name) return name.text;
  }

  return null;
};

// Lines where the config is read outside of any function body.
const moduleScopeReads = (file: string): number[] => {
  const text = fs.readFileSync(file, "utf8");
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);

  const binding = configBinding(source);
  if (!binding) return [];

  const lines: number[] = [];

  const visit = (node: ts.Node) => {
    if (ts.isIdentifier(node) && node.text === binding) {
      const isTheImport = ts.isImportClause(node.parent);

      let insideFunction = false;
      for (let n: ts.Node | undefined = node.parent; n; n = n.parent) {
        if (isFunctionLike(n)) {
          insideFunction = true;
          break;
        }
      }

      if (!isTheImport && !insideFunction) {
        lines.push(source.getLineAndCharacterOfPosition(node.pos).line + 1);
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(source);

  return lines;
};

const modules = walk(srcDir).filter((f) => moduleScopeReads(f).length >= 0);

describe("no module reads the config at import time", () => {
  const offenders = modules
    .map((file) => ({ file, lines: moduleScopeReads(file) }))
    .filter(({ lines }) => lines.length > 0);

  it("scans the whole src tree", () => {
    expect(modules.length).toBeGreaterThan(20);
  });

  it("finds no config read outside a function body", () => {
    const report = offenders.map(
      ({ file, lines }) => `${path.relative(srcDir, file)}:${lines.join(",")}`
    );

    expect(report).toEqual([]);
  });
});
