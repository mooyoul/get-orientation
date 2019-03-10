const path = require("path");
const { expect } = intern.getPlugin("chai");
const { registerSuite } = intern.getInterface("object");

const { Orientation } = require("./base");

const bundled = [
  { filename: "corrupted.jpg", value: Orientation.TOP_LEFT },
  { filename: "landscape_1.jpg", value: Orientation.TOP_LEFT },
  { filename: "landscape_2.jpg", value: Orientation.TOP_RIGHT },
  { filename: "landscape_3.jpg", value: Orientation.BOTTOM_RIGHT },
  { filename: "landscape_4.jpg", value: Orientation.BOTTOM_LEFT },
  { filename: "landscape_5.jpg", value: Orientation.LEFT_TOP },
  { filename: "landscape_6.jpg", value: Orientation.RIGHT_TOP },
  { filename: "landscape_7.jpg", value: Orientation.RIGHT_BOTTOM },
  { filename: "landscape_8.jpg", value: Orientation.LEFT_BOTTOM },
  { filename: "mooyoul.jpg", value: Orientation.TOP_LEFT },
  { filename: "portrait_1.jpg", value: Orientation.TOP_LEFT },
  { filename: "portrait_2.jpg", value: Orientation.TOP_RIGHT },
  { filename: "portrait_3.jpg", value: Orientation.BOTTOM_RIGHT },
  { filename: "portrait_4.jpg", value: Orientation.BOTTOM_LEFT },
  { filename: "portrait_5.jpg", value: Orientation.LEFT_TOP },
  { filename: "portrait_6.jpg", value: Orientation.RIGHT_TOP },
  { filename: "portrait_7.jpg", value: Orientation.RIGHT_BOTTOM },
  { filename: "portrait_8.jpg", value: Orientation.LEFT_BOTTOM },
  { filename: "rgb.tiff", value: Orientation.TOP_LEFT },
  { filename: "tless0.tiff", value: Orientation.TOP_LEFT },
  { filename: "error-origin-connectivity.png", value: Orientation.TOP_LEFT },
];

const thirdParty = require("./fixtures/exif-examples.json");

registerSuite("get-image-orientation", {
  async "it should return orientation"() {
    for (const source of [...bundled, ...thirdParty]) {
      await this.remote
        .get("test.html")
        .findById("input")
        .type(path.join(__dirname, `fixtures/${source.filename}`))
        .end()
        .sleep(100);

      const result = await this.remote
        .findById("orientation")
        .getVisibleText();

      expect(result).to.be.eq(source.value.toString(), `File ${source.filename}`);
    }
  },
});
