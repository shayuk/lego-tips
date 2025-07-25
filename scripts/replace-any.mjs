/* eslint-env node */
/* eslint-disable no-undef */
import { Project, SyntaxKind } from 'ts-morph';
import fs from 'fs';

const project = new Project({ tsConfigFilePath: 'tsconfig.json' });
const sourceFiles = project.getSourceFiles(['components/**/*.{ts,tsx}', 'helpers/**/*.{ts,tsx}', 'src/**/*.{ts,tsx}']);

const summary = [];

function processVariable(decl, filePath) {
  const typeNode = decl.getTypeNode();
  if (typeNode && typeNode.getText() === 'any') {
    const initializer = decl.getInitializer();
    if (initializer) {
      decl.removeType();
      summary.push(`In ${filePath}: removed type 'any' from variable ${decl.getName()}`);
    } else {
      typeNode.replaceWithText('unknown');
      summary.push(`In ${filePath}: replaced type 'any' with 'unknown' for variable ${decl.getName()}`);
    }
  }
}

function processParameter(param, filePath) {
  const typeNode = param.getTypeNode();
  if (typeNode && typeNode.getText() === 'any') {
    const name = param.getName();
    if (/^(e|ev|evt|event)$/.test(name)) {
      typeNode.replaceWithText('React.SyntheticEvent');
      summary.push(`In ${filePath}: replaced parameter ${name}: any -> React.SyntheticEvent`);
    } else {
      typeNode.replaceWithText('unknown');
      summary.push(`In ${filePath}: replaced parameter ${name}: any -> unknown`);
    }
  }
}

function processReturnType(node, filePath) {
  const typeNode = node.getReturnTypeNode?.();
  if (typeNode && typeNode.getText() === 'any') {
    const body = node.getBody?.();
    if (body) {
      node.removeReturnType();
      summary.push(`In ${filePath}: removed 'any' return type from ${node.getSymbol?.()?.getName() || 'function'}`);
    } else {
      typeNode.replaceWithText('unknown');
      summary.push(`In ${filePath}: replaced 'any' return type with 'unknown' for ${node.getSymbol?.()?.getName() || 'function'}`);
    }
  }
}


for (const file of sourceFiles) {
  const filePath = file.getFilePath();
  const original = file.getFullText();

  file.getVariableDeclarations().forEach(v => processVariable(v, filePath));
  file.getFunctions().forEach(fn => {
    processReturnType(fn, filePath);
    fn.getParameters().forEach(p => processParameter(p, filePath));
  });
  file.getDescendantsOfKind(SyntaxKind.ArrowFunction).forEach(fn => {
    processReturnType(fn, filePath);
    fn.getParameters().forEach(p => processParameter(p, filePath));
  });
  file.getDescendantsOfKind(SyntaxKind.MethodDeclaration).forEach(method => {
    processReturnType(method, filePath);
    method.getParameters().forEach(p => processParameter(p, filePath));
  });

  if (file.getFullText() !== original) {
    fs.writeFileSync(filePath + '.bak', original);
    file.saveSync();
  }
}

fs.writeFileSync('replace-any.log', summary.join('\n'));
console.log(summary.join('\n'));
