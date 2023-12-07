const { homedir } = require('os');
const { join, sep } = require('path');

const { deleteExtensionArchive, extractExtension } = require('../extensions/extensions-extractor.js');

const API_URL = 'https://api.gologin.com';

const HOMEDIR = homedir();
const CHROME_EXT_DIR_NAME = 'chrome-extensions';
const EXTENSIONS_PATH = join(HOMEDIR, '.gologin', 'extensions');
const CHROME_EXTENSIONS_PATH = join(EXTENSIONS_PATH, CHROME_EXT_DIR_NAME);
const USER_EXTENSIONS_PATH = join(HOMEDIR, '.gologin', 'extensions', 'user-extensions');

const composeExtractionPromises = (filteredArchives, destPath = CHROME_EXTENSIONS_PATH) => (
  filteredArchives.map((extArchivePath) => {
    const [archiveName = ''] = extArchivePath.split(sep).reverse();
    const [destFolder] = archiveName.split('.');

    return extractExtension(extArchivePath, join(destPath, destFolder))
      .then(() => deleteExtensionArchive(extArchivePath));
  })
);

const _composeExtractionPromises = composeExtractionPromises;
exports.composeExtractionPromises = _composeExtractionPromises;
const _USER_EXTENSIONS_PATH = USER_EXTENSIONS_PATH;
exports.USER_EXTENSIONS_PATH = _USER_EXTENSIONS_PATH;
const _CHROME_EXTENSIONS_PATH = CHROME_EXTENSIONS_PATH;
exports.CHROME_EXTENSIONS_PATH = _CHROME_EXTENSIONS_PATH;
exports.API_URL = API_URL
