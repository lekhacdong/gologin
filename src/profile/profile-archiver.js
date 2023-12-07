const AdmZip = require('adm-zip');
const { promises: _promises } = require('fs');
const path = require('path');

const { getDirectoriesForArchiver } = require('./profile-directories-to-remove.js');

const { access } = _promises;

const archiveProfile = async (profileFolder = '', tryAgain = true) => {
  const folderExists = await access(profileFolder).then(() => true, () => false);
  if (!folderExists) {
    throw new Error('Invalid profile folder path: ' + profileFolder);
  }

  const archive = new AdmZip();
  archive.addLocalFolder(path.join(profileFolder, 'Default'), 'Default');
  try {
    archive.addLocalFile(path.join(profileFolder, 'First Run'));
  } catch (e) {
    archive.addFile('First Run', Buffer.from(''));
  }

  const dirsToRemove = getDirectoriesForArchiver();
  dirsToRemove.forEach(entry => archive.deleteFile(entry));

  const archiveIsValid = checkProfileArchiveIsValid(archive);
  if (tryAgain && !archiveIsValid) {
    await new Promise(r => setTimeout(() => r(), 300));

    return archiveProfile(profileFolder, false);
  }

  return new Promise((resolve, reject) => archive.toBuffer(resolve, reject));
};

const decompressProfile = async (zipPath = '', profileFolder = '') => {
  const zipExists = await access(zipPath).then(() => true, () => false);
  if (!zipExists) {
    throw new Error('Invalid zip path: ' + zipPath);
  }

  const archive = new AdmZip(zipPath);
  archive
    .getEntries()
    .forEach((elem) => {
      if (
        !elem.isDirectory &&
        (
          elem.entryName.includes('RunningChromeVersion') ||
          elem.entryName.includes('SingletonLock') ||
          elem.entryName.includes('SingletonSocket') ||
          elem.entryName.includes('SingletonCookie')
        )
      ) {
        archive.deleteFile(elem);
      }
    });

  archive.extractAllTo(profileFolder, true);
};

const checkProfileArchiveIsValid = (zipObject) => {
  if (!zipObject) {
    throw new Error('No zip object provided');
  }

  return zipObject
    .getEntries()
    .map(elem => {
      if (elem.isDirectory) {
        return false;
      }

      return elem.entryName.includes('Preferences') || elem.entryName.includes('Cookies');
    })
    .filter(Boolean)
    .length >= 2;
};

const flatArray = (array = []) => array.map((elem) => {
  if (Array.isArray(elem)) {
    return flatArray(elem).flat();
  }

  return elem;
}).flat().filter(Boolean);

module.exports = {
  archiveProfile,
  decompressProfile,
  checkProfileArchiveIsValid,
};