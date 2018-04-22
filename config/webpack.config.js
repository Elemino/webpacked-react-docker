const pkg = require('../package');
const path = require('path');
const webpack = require('webpack');
const CaseSensitivePlugin = require('case-sensitive-paths-webpack-plugin');
const CleanPlugin = require('clean-webpack-plugin');
const Html5Plugin = require('html5-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const CompressionPlugin = require('compression-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const NotifierPlugin = require('webpack-notifier');
const OpenBrowserPlugin = require('open-browser-webpack-plugin');

module.exports = pkg.bundles.map(({ name, baseRoute, js, html, favicon, manifest }) => {
    const config = {
        profile: true,
        entry: {
            index: path.resolve(js),
        },
        output: {
            path: path.resolve('./dist', name),
            publicPath: '/dist/' + name,
            filename: '[name].js',
        },
        module: {
            rules: [{
                test: /\.(js|jsx|mjs)$/i,
                exclude: /node_modules\/(?!(graphjql|reax-helpers|reax-form|reax-cms|muicons)\/).*/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,
                    },
                }],
            },{
                test: /\.(woff|woff2|ttf|eot)$/i,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 8192,
                        name: '/assets/fonts/[name].[ext]?hash=[hash]',
                    },
                }],
            },{
                test: /\.(jpg|jpeg|png|gif|svg)$/i,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 8192,
                        name: '/assets/images/[name].[ext]?hash=[hash]',
                    },
                },{
                    loader: 'img-loader',
                    options: {
                        enabled: process.env.NODE_ENV !== 'development',
                        gifsicle: {
                            interlaced: false
                        },
                        mozjpeg: {
                            progressive: true,
                            arithmetic: false
                        },
                        optipng: false,
                        pngquant: {
                            quality: 80,
                        },
                        svgo: {
                            plugins: [
                                { removeTitle: true },
                                { convertPathData: false }
                            ],
                        },
                    },
                }]
            }],
        },
        plugins: [
            new CaseSensitivePlugin(),
            new CleanPlugin([name], {
                root: path.resolve('./dist'),
                verbose: true
            }),
            new webpack.EnvironmentPlugin(['NODE_ENV']),
            new Html5Plugin({
                title: pkg.name,
                input: path.resolve(html),
                // output: path.resolve('./dist/visitor/index.html'),
                favicon: path.resolve(favicon),
                manifest: manifest,
            }),
        ],
    };

    if(process.env.NODE_ENV === 'development') {
        config.devtool = 'eval-sourcemap';

        config.plugins = [
            ...config.plugins,
            new NotifierPlugin({
                title: pkg.name,
                alwaysNotify: true,
            }),
            new OpenBrowserPlugin({
                url: 'http://localhost:8080' + baseRoute,
            }),
        ];
    }
    else {
        config.devtool = 'source-map';

        config.optimization = {
            minimizer: [
                new UglifyJsPlugin({
                    sourceMap: true,
                    uglifyOptions: {
                        compress: {
                            inline: false,
                        },
                    },
                }),
            ],
        };

        config.plugins = [
            ...config.plugins,
            new CompressionPlugin(),
            new BundleAnalyzerPlugin({
                analyzerMode: 'static',
                openAnalyzer: process.env.NODE_ENV === 'production',
                defaultSizes: 'gzip',
            }),
        ];
    }

    return config;
});