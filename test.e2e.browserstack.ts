import { expect } from "chai";

import { Orientation } from "./base";

import * as webdriver from "selenium-webdriver";
import { FileDetector } from "selenium-webdriver/remote";

const TARGET_BROWSERS = [
  { name: "IE", version: "11.0" },
  { name: "Firefox" },
  { name: "Chrome" },
];

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

const FIXTURES = [...bundled];

describe("get-image-orientation", () => {
  TARGET_BROWSERS.forEach((browser) => {
    let driver: webdriver.WebDriver;

    context(`on ${browser.name} ${browser.version || "latest"}`, () => {
      before(async () => {
        driver = new webdriver.Builder()
          .usingServer("http://hub-cloud.browserstack.com/wd/hub")
          .withCapabilities({
            "browserName": browser.name,
            "browser_version": browser.version,
            "resolution" : "1024x768",
            "browserstack.local" : "true",
            "browserstack.user" : process.env.BROWSERSTACK_USERNAME,
            "browserstack.key" : process.env.BROWSERSTACK_ACCESS_KEY,
          })
          .build();

        driver.setFileDetector(new FileDetector());

        await driver.get("http://127.0.0.1:8080/test.es5.html");
      });

      after(async () => {
        await driver.quit();
      });

      FIXTURES.forEach((fixture) => {
        it(`should return orientation of ${fixture.filename}`, async () => {
          await driver.findElement(webdriver.By.id("input")).sendKeys(`fixtures/${fixture.filename}`);
          await new Promise((resolve) => setTimeout(resolve, 100));
          const result = await driver.findElement(webdriver.By.id("orientation")).getText();

          expect(result).to.be.eq(fixture.value.toString());
        });
      });
    });
  });
});
