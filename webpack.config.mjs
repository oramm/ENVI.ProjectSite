import * as path from 'path';
import * as os from 'os';

let __dirname = path.dirname(new URL(import.meta.url).pathname);
if (os.platform() === 'win32') {
    __dirname = __dirname.slice(1);
}

export default {
    entry: '/src/React/index.tsx',
    output: {
        path: path.resolve(__dirname, 'docs/React'),
        filename: 'bundle.js',
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    devServer: {
        port: 9000,
        hot: true,
        historyApiFallback: true,

        static: {
            directory: path.join(__dirname, '/')
        }
    },
    devtool: 'source-map',
    mode: 'development',
    experiments: {
        topLevelAwait: true
    }
};