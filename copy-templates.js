const fs = require('fs-extra');
const path = require('path');

const sourceDir = './src/helpers/Email/template';
const destDir = './build/helpers/Email/template';

fs.readdirSync(sourceDir).forEach((subDir) => {
 const sourceSubDir = path.join(sourceDir, subDir);
 const destSubDir = path.join(destDir, subDir);

 fs.copy(sourceSubDir, destSubDir)
   .then(() => console.log(` templates copied successfully!`))
   .catch(err => console.error(err));
});