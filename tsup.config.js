/** @type {import('tsup').Options} */
export default {
  entry: ["src/index.jsx"],
  format: ["esm", "cjs"],
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom"],
  target: "es2019",
  jsx: "automatic",
};
