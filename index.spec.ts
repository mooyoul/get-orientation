import { expect } from "chai";

import * as fs from "fs";
import * as path from "path";

import { getOrientation, Orientation } from "./index";

interface Source {
  filename: string;
  value: Orientation;
}

describe("#getImageOrientation", () => {
  const bundled: Source[] = [
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
  const thirdParty: Source[] = require("./fixtures/exif-examples.json"); // tslint:disable-line

  context("with Buffer", () => {
    it("should return Orientation value", async () => {
      for (const source of bundled) {
        const buf = await new Promise<Buffer>((resolve, reject) => {
          fs.readFile(path.join(__dirname, `fixtures/${source.filename}`), (e, data) => {
            if (e) { return reject(e); }

            resolve(data);
          });
        });

        const val = await getOrientation(buf);

        expect(val).to.be.eq(source.value, `Buffer of ${source.filename}`);
      }
    });
  });

  context("with ReadableStream", () => {
    it("should return Orientation value", async () => {
      for (const source of [...bundled, ...thirdParty]) {
        const stream = fs.createReadStream(path.join(__dirname, `fixtures/${source.filename}`));
        const val = await getOrientation(stream);

        expect(val).to.be.eq(source.value, `ReadableStream of ${source.filename}`);
      }
    });
  });
});
