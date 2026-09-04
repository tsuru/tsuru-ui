import fs from "fs";
import path from "path";
import ts from "typescript";

// public/config.js.example is the documentation for the deployment config: it
// is the only place the options are written out with values rather than as
// types. Documentation drifts, so this ties it to the Config type -- a new
// option has to be documented, and a typo'd key fails here rather than being
// silently ignored at boot.

const examplePath = path.join(__dirname, "..", "public", "config.js.example");
const configTypePath = path.join(__dirname, "types", "config.ts");

const parse = (file: string) =>
  ts.createSourceFile(
    file,
    fs.readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true
  );

const propertyName = (member: ts.TypeElement): string | null => {
  if (!member.name) return null;
  return ts.isIdentifier(member.name) || ts.isStringLiteral(member.name)
    ? member.name.text
    : null;
};

// The members of the Config type alias, with whether each one is optional.
const configMembers = (): Array<{ name: string; optional: boolean }> => {
  const source = parse(configTypePath);
  const members: Array<{ name: string; optional: boolean }> = [];

  source.forEachChild((node) => {
    if (!ts.isTypeAliasDeclaration(node) || node.name.text !== "Config") {
      return;
    }

    if (!ts.isTypeLiteralNode(node.type)) return;

    for (const member of node.type.members) {
      // Plain properties and the method-style declarations both appear here.
      if (!ts.isPropertySignature(member) && !ts.isMethodSignature(member)) {
        continue;
      }

      const name = propertyName(member);
      if (name) {
        members.push({ name, optional: Boolean(member.questionToken) });
      }
    }
  });

  return members;
};

// The top-level keys of the object the example default-exports.
const exampleKeys = (): Array<string> => {
  const source = parse(examplePath);
  const keys: Array<string> = [];

  const visit = (node: ts.Node) => {
    if (
      ts.isExportAssignment(node) &&
      ts.isObjectLiteralExpression(node.expression)
    ) {
      for (const prop of node.expression.properties) {
        if (prop.name && ts.isIdentifier(prop.name)) {
          keys.push(prop.name.text);
        }
      }

      return;
    }

    ts.forEachChild(node, visit);
  };

  visit(source);

  return keys;
};

test("the example config exists and is parseable", () => {
  expect(fs.existsSync(examplePath)).toBe(true);
  expect(exampleKeys().length).toBeGreaterThan(0);
});

test("every key in the example config is a real Config option", () => {
  const known = new Set(configMembers().map((m) => m.name));
  const unknown = exampleKeys().filter((key) => !known.has(key));

  expect(unknown).toEqual([]);
});

test("every Config option is documented in the example config", () => {
  const documented = new Set(exampleKeys());
  const undocumented = configMembers()
    .map((m) => m.name)
    .filter((name) => !documented.has(name));

  expect(undocumented).toEqual([]);
});

test("the example config sets the options that have no default", () => {
  const required = configMembers()
    .filter((m) => !m.optional)
    .map((m) => m.name);
  const documented = new Set(exampleKeys());

  expect(required.length).toBeGreaterThan(0);
  expect(required.filter((name) => !documented.has(name))).toEqual([]);
});
