const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      title: "KNOUX FINDR",
    }),
    new webpack.DefinePlugin({
      "process.env.REACT_APP_AUTH_SERVER_URL": JSON.stringify(
        process.env.REACT_APP_AUTH_SERVER_URL || "",
      ),
      "process.env.REACT_APP_API_BASE_URL": JSON.stringify(
        process.env.REACT_APP_API_BASE_URL || "",
      ),
    }),
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
  ],
  resolve: {
    extensions: [".js", ".jsx"],
    fallback: {
      process: require.resolve("process/browser"),
      buffer: require.resolve("buffer"),
    },
  },
  devtool: "source-map",
};
