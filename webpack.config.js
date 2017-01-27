var Webpack = require("webpack");
var path = require("path");
var fs = require("fs");

var babelConfigFilePath = path.resolve(__dirname, ".babelrc");
var babelConfig = JSON.parse(fs.readFileSync(babelConfigFilePath));

babelConfig.cacheDirectory = true;

function getPluginConfig() {
    return [
        // new Webpack.optimize.DedupePlugin(),
        // new Webpack.optimize.AggressiveMergingPlugin(),
        new Webpack.optimize.UglifyJsPlugin({
            sourceMap: false,
            compress: {
                sequences: true,
                dead_code: true,
                conditionals: true,
                booleans: true,
                unused: true,
                if_return: true,
                join_vars: true,
                // drop_console: true
            },
            output: {
                comments: false
            }
        })
    ];
}

var moduleConfig = {
    loaders: [
        {
            test: /\.(js)$/,
            loader: "babel-loader",
            query: babelConfig
        }
    ]
};

module.exports = [
    {
        name: "all",
        entry: "./src/force.js",
        output: {
            path: "./dist",
            filename: "force.all.js",
            library: "force",
            libraryTarget: "umd"
        },
        module: moduleConfig,
        plugins: getPluginConfig()
    },
    {
        name: "oauth",
        entry: "./src/oauth.js",
        output: {
            path: "./dist",
            filename: "force.oauth.js",
            library: ["force", "OAuth"],
            libraryTarget: "umd"
        },
        module: moduleConfig,
        plugins: getPluginConfig()
    },
    {
        name: "dataservice",
        entry: "./src/data-service.js",
        output: {
            path: "./dist",
            filename: "force.data-service.js",
            library: ["force", "DataService"],
            libraryTarget: "umd"
        },
        module: moduleConfig,
        plugins: getPluginConfig()
    }
];