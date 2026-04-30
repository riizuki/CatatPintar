const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    filelist = fs.statSync(path.join(dir, file)).isDirectory()
      ? walkSync(path.join(dir, file), filelist)
      : filelist.concat(path.join(dir, file));
  });
  return filelist;
};

const files = walkSync('/Users/rizkyalfaridhafizh/CatatPintar/src/app/dashboard')
  .concat(walkSync('/Users/rizkyalfaridhafizh/CatatPintar/src/app/components/dashboard'))
  .filter(f => f.endsWith('.jsx') || f.endsWith('.js'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  content = content.replace(/bg-gradient-to-r from-\[\#00A2D8\] to-blue-600/g, 'bg-[#00A2D8] hover:bg-[#008EB2]');
  content = content.replace(/bg-gradient-to-r from-sky-400 to-sky-600/g, 'bg-sky-500 hover:bg-sky-600');
  content = content.replace(/bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-600 dark:to-gray-800/g, 'bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600');
  content = content.replace(/bg-gradient-to-r from-rose-500 to-red-600/g, 'bg-rose-600 hover:bg-rose-700');
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
