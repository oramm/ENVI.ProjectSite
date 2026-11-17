import * as path from 'path';
import * as os from 'os';
import webpack from 'webpack';
import dotenv from 'dotenv';
dotenv.config();

let __dirname = path.dirname(new URL(import.meta.url).pathname);
if (os.platform() === 'win32') {
    __dirname = __dirname.slice(1);
}

export default (env = {}) => ({
    entry: './src/React/MainWindow/index.tsx',
    cache: {
        type: 'filesystem',
        name: env.WEBPACK_SERVE ? 'dev-server' : 'build',
        buildDependencies: { config: [path.resolve(__dirname, 'webpack.config.mjs')] },
    },
    output: {
        path: path.resolve(__dirname, 'docs'),
        filename: 'bundle.js',
        publicPath: '/docs/',
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],

    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: {
                    loader: 'ts-loader',
                    options: { transpileOnly: true, onlyCompileBundledFiles: true },
                },
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                exclude: /sbTailwind\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                // Tailwind v3 tylko dla okna Dostepy SB (patrz tailwind.config.cjs).
                test: /sbTailwind\.css$/,
                use: ['style-loader', 'css-loader', 'postcss-loader'],
            },
            //{ test: /\.(png|jp(e*)g|svg|gif)$/, use: ['file-loader'], }
            {
                test: /\.(png|jpe?g|gif|svg)$/i,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8192,
                            name: 'assets/images/[name].[ext]',
                        },
                    },
                ],
            }
        ],
    },
    devServer: {
        port: 9000,
        hot: true,
        historyApiFallback: true,
        headers: {
                'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
        },
        static: {
            directory: path.resolve(__dirname, 'src'),
            publicPath: '/docs/',
        },
        devMiddleware: {
            publicPath: '/docs/',
        },
    },
    devtool: env.WEBPACK_SERVE ? 'eval-cheap-module-source-map' : 'source-map',
    mode: 'development',
    experiments: {
        topLevelAwait: true
    },
});
