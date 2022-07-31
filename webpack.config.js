const path = require("path");
const webpack = require("webpack");

const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const { extendDefaultPlugins } = require("svgo");

const IS_DEVELOPMENT = process.env.NODE.ENV === "dev";

const dirApp = path.join(__dirname, "app");
const dirAssets = path.join(__dirname, "assets");
const dirStyles = path.join(__dirname, "styles");
const dirShared = path.join(__dirname, "shared");
const dirImages = path.join(__dirname, "images");
const dirVideos = path.join(__dirname, "videos");

const dirNode = "node_modules";

module.exports = {
  entry: [path.join(dirApp, "index.js"), path.join(dirStyles, "index.scss")],

  // )
  resolve: {
    modules: [
      dirApp,
      dirAssets,
      dirStyles,
      dirNode,
      dirShared,
      dirImages,
      dirVideos,
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      IS_DEVELOPMENT,
    }),

    new CopyWebpackPlugin({
      patterns: [
        {
          from: "./shared",
          to: "",
        },
      ],
    }),

    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css",
    }),

    new CleanWebpackPlugin(),
  ],

  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
        },
      },

      {
        test: /\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: "",
            },
          },
          {
            loader: "css-loader",
          },
          {
            loader: "postcss-loader",
          },
          {
            loader: "sass-loader",
          },
        ],
      },
      {
        test: /\.(glsl|frag|vert)$/,
        loader: "raw-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(glsl|frag|vert)$/,
        loader: "glslify-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(jpe?g|png|gif|svg|woff2?|fnt|webp)$/,
        loader: "file-loader",
        options: {
          name(file) {
            return "[name].[hash].[ext]";
          },
        },
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/,
        type: "asset",
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      "...",
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            // Lossless optimization with custom option
            // Feel free to experiment with options for better result for you
            plugins: [
              ["gifsicle", { interlaced: true }],
              ["jpegtran", { progressive: true }],
              ["optipng", { optimizationLevel: 8 }],
              // Svgo configuration here https://github.com/svg/svgo#configuration
              [
                "svgo",
                {
                  plugins: {
                    name: "preset-default",
                    params: {
                      overrides: {
                        // customize plugin options
                        convertShapeToPath: {
                          convertArcs: true,
                        },
                        // disable plugins
                        convertPathData: false,
                      },
                    },
                  },
                },
              ],
            ],
          },
        },
      }),
      new TerserPlugin({
        test: /\.js(\?.*)?$/i,
      }),
    ],
  },
};
