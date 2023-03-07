const path = require("path");

module.exports = {
    //entry: "/src/reactTests/index.tsx",
    entry: "/src/Contracts/ContractsList/index.tsx",
    output: {
        //path: path.resolve(__dirname, "docs/reactTests"),
        path: path.resolve(__dirname, "docs/Contracts/ContractsList"),
        filename: "bundle.js",
        //publicPath: "/docs/reactTests/",
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"]
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            }
        ]
    },
    devServer: {
        port: 9000,
        hot: true,
        historyApiFallback: true,

        static: {
            directory: path.join(__dirname, '/'),
        }
    },
    devtool: "source-map",
    mode: 'development'
};
