const path = require(`path`);
const fs = require('fs');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');

class ImageUtils {
  imagePath({ base, name, suffix = `` }) {
    return path.resolve(base, `${name.replace(/ /g, `-`)}${suffix}.png`);
  }

  createReport(currentImage, diff, name, referenceImage ) {
    const reportCurrentImage = this.imagePath({ base: reportsDirectory, name, suffix: `-CURRENT` });
    const reportReferenceImage = this.imagePath({ base: reportsDirectory, name, suffix: `-REFERENCE` });
    const reportDiffImage = this.imagePath({ base: reportsDirectory, name, suffix: `-DIFF` });

    if (!fs.existsSync(reportsDirectory)) {
      fs.mkdirSync(reportsDirectory);
    }

    fs.createReadStream(currentImage).pipe(fs.createWriteStream(reportCurrentImage));
    fs.createReadStream(referenceImage).pipe(fs.createWriteStream(reportReferenceImage));
    fs.writeFileSync(reportDiffImage, PNG.sync.write(diff));

    return reportDiffImage;
  }

  compare(name, thresholdValue=0.1) {
    const currentImage = this.imagePath({ base: currentDirectory, name });
    const referenceImage = this.imagePath({ base: referenceDirectory, name });
    if (snap || !fs.existsSync(referenceImage)) {
      // eslint-disable-next-line no-console
      console.info(`INFO: Reference image successfully created: ${referenceImage}`);
      browser.saveDocumentScreenshot(referenceImage);
    } else {
      browser.saveDocumentScreenshot(currentImage);
      const refImg = PNG.sync.read(fs.readFileSync(referenceImage));
      const curImg = PNG.sync.read(fs.readFileSync(currentImage));
      const { width, height } = refImg;
      const diffImg = new PNG({ width, height });
      const imageMismatch = pixelmatch(refImg.data, curImg.data, diffImg.data, width, height, { threshold: thresholdValue });

      if (imageMismatch) {
        console.warn('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
        console.warn(imageMismatch);
        this.createReport(currentImage, diffImg, name, referenceImage);
      }
    }
  }
}

module.exports = new ImageUtils();
