/** @type {import('tsup').Options} */
export default {
  entry: ["src/index.js"],
  format: ["esm", "cjs"],
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom", "@react-spring/web"],
  target: "es2019",

  jsx: "transform",
  esbuildOptions(options) {
    options.loader = {
      ".jsx": "jsx",
      ".js": "jsx", // if any JSX slips into .js, handle it
      ...(options.loader || {}),
    };
    options.jsxFactory = "React.createElement";
    options.jsxFragment = "React.Fragment";
  },
};
