import * as fs from 'fs-extra';
import * as path from 'path';

const sourceDir: string = './src/helpers/Email/template';
const destDir: string = './build/helpers/Email/template';

//This file is used to copy and paste email templates, because typescript can not automatically include handlebars files.
function copyTemplates(): void {
  fs.readdirSync(sourceDir).forEach((subDir: string) => {
    const sourceSubDir: string = path.join(sourceDir, subDir);
    const destSubDir: string = path.join(destDir, subDir);

    fs.copy(sourceSubDir, destSubDir)
      .then(() => console.log(`${subDir} templates copied successfully!`))
      .catch((err: Error) => console.error(err));
  });
}

copyTemplates()