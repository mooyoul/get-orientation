import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'browser.ts',
  output: {
    format: 'umd',
    file: 'browser.js',
    name: 'getOrientation',
    sourcemap: true,
  },
  plugins: [
    typescript({ tsconfig: "tsconfig.browser.json" }),
  ],
};
