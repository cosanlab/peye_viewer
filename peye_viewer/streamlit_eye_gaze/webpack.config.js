const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./frontend/src/Index.js",
  output: {
    path: path.resolve(__dirname, "frontend/build"),
    filename: "index.js",
    libraryTarget: "window",
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-react"],
          },
        },
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: "frontend/public/index.html", to: "index.html" }],
    }),
  ],
  externals: {
    react: "React",
    "react-dom": "ReactDOM",
    "streamlit-component-lib": "streamlit",
  },
};
