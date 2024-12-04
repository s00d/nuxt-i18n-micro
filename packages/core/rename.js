const fs = require('fs');
const path = require('path');

const cjsDir = path.join(__dirname, 'dist', 'cjs');
const esmDir = path.join(__dirname, 'dist', 'esm');

function renameFiles(dir, ext) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    const newFilePath = path.join(dir, file.replace(/\.js$/, ext));
    fs.renameSync(filePath, newFilePath);
  });
}

renameFiles(cjsDir, '.cjs');
renameFiles(esmDir, '.mjs');
