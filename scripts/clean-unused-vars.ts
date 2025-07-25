import { Project } from "ts-morph";
import fs from "fs";

const project = new Project({
  tsConfigFilePath: "tsconfig.json",
});

const sourceFiles = project.getSourceFiles("src/**/*.tsx");

sourceFiles.forEach((file) => {
  const filePath = file.getFilePath();

  // גיבוי
  const original = file.getFullText();
  fs.writeFileSync(filePath + ".bak", original);

  const variables = file.getVariableDeclarations();

  variables.forEach((v) => {
    const refs = v.findReferences();
    const totalRefs = refs.flatMap(r => r.getReferences()).filter(r => !r.isDefinition());

    if (totalRefs.length === 0) {
      console.log(`🗑 Removing unused variable '${v.getName()}' in ${filePath}`);
      v.remove();
    }
  });

  file.saveSync();
});
