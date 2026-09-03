const webpack = require('webpack');
const path = require('path')
module.exports = function override(config, env) {
    //do stuff with the webpack config...

    config.resolve.fallback = {
        url: require.resolve('url'),
        assert: require.resolve('assert'),
        crypto: require.resolve('crypto-browserify'),
        buffer: require.resolve('buffer/'),
        querystring: require.resolve("querystring-es3"),
        stream: require.resolve("stream-browserify"),
        "readable-stream": require.resolve("readable-stream"),
    };

    for (const plugin of config.resolve.plugins) {
        if (plugin.constructor.name === "ModuleScopePlugin") {
            plugin.allowedPaths.push(path.resolve('./node_modules/stream-browserify'))
            plugin.allowedPaths.push(path.resolve('./node_modules/readable-stream'))
        }
    }

    return config;
}