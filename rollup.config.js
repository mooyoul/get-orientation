import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript';

export default [{
  input: 'browser.ts',
  output: {
    format: 'umd',
    dir: '.',
    name: 'getOrientation',
    sourcemap: true,
  },
  plugins: [
    nodeResolve({ browser: true, preferBuiltins: false }),
    commonjs({ extensions: [".js", ".ts"]}),
    typescript({ tsconfig: 'tsconfig.browser.json' }),
  ],
}, {
  input: 'browser.es5.ts',
  output: {
    format: 'umd',
    dir: '.',
    name: 'getOrientation',
    sourcemap: true,
  },
  plugins: [
    nodeResolve({ browser: true, preferBuiltins: false }),
    commonjs({ extensions: [".js", ".ts"]}),
    typescript({ tsconfig: "tsconfig.browser.es5.json" }),
  ],
}];

