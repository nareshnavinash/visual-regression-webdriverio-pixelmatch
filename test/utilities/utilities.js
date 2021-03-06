const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const NodeRSA = require('node-rsa');

class Utilities {
  static getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  /**
   * a method to take screenshot and attach to allure
   * @param {string} name Name of the screenshot
   * @param {boolean} failure To mention whether the screenshot is because of failure
   * @return {void} returns nothing
   */
  static takeScreenshot(name, failure=false) {
    if (!name) name = moment().format('YYYY-MM-DDTH:mm:ss');
    const path = './reports/screenshot/';
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }

    if (failure) {
      name = name + '_fail';
    }
    name = name.replace(/ /g, '_') + '.png';
    browser.saveScreenshot( path + name);
    const data = fs.readFileSync(`${path}/${name}`);
    allure.addAttachment(name, data, 'image/png');
  }

  /**
   * a method to return the public key path
   * @return {string} returns the path of the public key
   */
  static getPublicKeyPath() {
    return './secret_keys/public.key';
  }

  /**
   * a method to return the private key path
   * @return {string} returns the path of the private key
   */
  static getPrivateKeyPath() {
    const path = './secret_keys/private.key';
    if (fs.existsSync(path)) {
      return path;
    } else {
      fs.writeFileSync(path, process.env.privatekey);
      return path;
    }
  }

  /**
   * a method to generate the public and private key
   * @param {string} key String that is used to create the public key and private key
   * @return {void} returns nothing
   */
  static generatePublicAndPrivateKeys(key) {
    const examplekey = new NodeRSA(key);
    fs.writeFileSync(Utilities.getPrivateKeyPath(), examplekey.exportKey('pkcs8-private'));
    fs.writeFileSync(Utilities.getPublicKeyPath(), examplekey.exportKey('pkcs8-public'));
  }

  /**
   * a method to create the secret key for a normal string
   * @param {string} value Gets the string which needs to be encrypted
   * @return {string} returns the encrypted key
   */
  static createSecrets(value) {
    const configToStore = value;
    const publickey = new NodeRSA();
    const jsonConfig = { 'value': configToStore };
    publickey.importKey(fs.readFileSync(Utilities.getPublicKeyPath(), 'utf8'));
    const key = (publickey.encrypt(jsonConfig, 'base64'), 'utf8');
    return key;
  }

  /**
   * a method to decrypt the secret key to a normal string
   * @param {string} secret Gets the encrypted string which needs to be decrypted
   * @return {string} returns the decrypted string
   */
  static readSecrets(secret) {
    if (secret.includes('utf8')) {
      const privatekey = new NodeRSA();
      privatekey.importKey(fs.readFileSync(Utilities.getPrivateKeyPath(), 'utf8'));
      const config = privatekey.decrypt(secret, 'json');
      return config.value;
    } else {
      return secret;
    }
  }

  /**
   * a method to clear the files from the reports directory
   * @param {string} directory Gets the path from which the files needs to be removed
   * @return {void} returns nothing
   */
  static removeDirectory(directory) {
    try {
      fs.readdir(directory, (err, files) => {
        if (err) throw err;
        console.log('Removing files from: ' + directory);
        for (const file of files) {
          if (file != '.keep') {
            fs.unlink(path.join(directory, file), (err) => {
              if (err) {
                console.log('Cannot clear the files from the directory using rimraf');
                rimraf(directory + '/*', function() {console.log('done');});
              }
            });
          }
        }
      });
    }
    catch (e) {
      console.log('Cannot clear the files from the directory using rimraf');
      rimraf(directory + '/*', function() {console.log('done');});
    }
  }

  static generateReportHTML(directory='../../reports/visual-regression/') {
    // eslint-disable-next-line no-multi-str
    const block = '<tr> \
              <td> \
                  <div class="img-comp-container"> \
                      <div class="img-comp-img"> \
                      <img src="CURRENT.png" width="640" height="360"> \
                      </div> \
                      <div class="img-comp-img img-comp-overlay">  \
                      <img src="DIFF.png" width="640" height="360"> \
                      </div> \
                  </div> \
              </td> \
              <td> \
                  <div class="img-comp-container"> \
                      <div class="img-comp-img"> \
                      <img src="REFERENCE.png" width="640" height="360"> \
                      </div> \
                      <div class="img-comp-img img-comp-overlay"> \
                      <img src="DIFF.png" width="640" height="360"> \
                      </div> \
                  </div> \
              </td> \
            </tr> \
            ';
    let insertBlock = '';
    try {
      fs.readdir(directory, (err, files) => {
        if (err) throw err;
        const processedFiles = [];
        for (const file of files) {
          console.warn(file);
          const rootFile = file.split('-')[0];
          if (processedFiles.indexOf(rootFile) == -1) {
            processedFiles.push(rootFile);
            const tempBlock = block;
            let modifiedBlock = tempBlock.replace('CURRENT.png', rootFile + '-CURRENT.png');
            modifiedBlock = modifiedBlock.replace('REFERENCE.png', rootFile + '-REFERENCE.png');
            modifiedBlock = modifiedBlock.split('DIFF.png').join(rootFile + '-DIFF.png');
            insertBlock = insertBlock + modifiedBlock;
          }
        }
        const fileref = path.resolve(__dirname, './refIndex.html');
        fs.readFile(fileref, 'utf8', function(err, data) {
          if (err) {
            return console.log(err);
          }
          const result = data.replace('insert_the_block_here', insertBlock);
          fs.open(directory + 'index.html', 'w', function(err, file) {
            if (err) throw err;
            console.log('Saved!');
          });
          fs.writeFile(directory + 'index.html', result, 'utf8', function(err) {
            if (err) return console.log(err);
          });
        });
      });
    }
    catch (e) {
      console.log('Cannot clear the files from the directory using rimraf');
      rimraf(directory + '/*', function() {console.log('done');});
    }
  }
}

module.exports = Utilities;
