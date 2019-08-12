"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var glob = require("glob");
// get all the
var getAllScss = function (patterns) {
    if (patterns === void 0) { patterns = ['./']; }
    patterns.map(function (pattern) {
        glob.sync(pattern);
    });
};
var scssEntries = glob.sync('./**/*Spec.js');
var AssetMapPlugin = /** @class */ (function () {
    function AssetMapPlugin() {
    }
    AssetMapPlugin.prototype.generateChunkMap = function (chunk) {
        var name = chunk.name;
        var Dependencies = chunk.getModules();
    };
    AssetMapPlugin.prototype.apply = function (compiler) {
        compiler.hooks.emit.tapAsync('AssetMapPlugin', function (compilation, callback) {
            var assetMap = {};
            var flatAssetMap = {};
            var cssFile = /\.css$/;
            var jsFile = /\.js$/;
            compilation.chunks.forEach(function (chunk) {
                var id, outPutFile, hash;
                id = chunk.id;
                outPutFile = {};
                chunk.files.forEach(function (filename) {
                    if (jsFile.test(filename)) {
                        if (chunk.contentHash &&
                            chunk.contentHash.javascript) {
                            hash = chunk.contentHash.javascript;
                        }
                        else {
                            hash = chunk.hash;
                        }
                        outPutFile.js
                            ? outPutFile.js.push({ filename: filename, hash: hash })
                            : (outPutFile.js = [{ filename: filename, hash: hash }]);
                        flatAssetMap[filename] = hash;
                    }
                    if (cssFile.test(filename)) {
                        if (chunk.contentHash &&
                            chunk.contentHash['css/mini-extract']) {
                            hash = chunk.contentHash['css/mini-extract'];
                        }
                        else {
                            hash = chunk.hash;
                        }
                        var file = {
                            filename: filename,
                            hash: hash
                        };
                        outPutFile.css
                            ? outPutFile.css.push({ filename: filename, hash: hash })
                            : (outPutFile.css = [{ filename: filename, hash: hash }]);
                        flatAssetMap[filename] = hash;
                    }
                    assetMap[id] = outPutFile;
                    //   console.log(source);
                });
            });
            var assetHashMapSource = JSON.stringify(assetMap);
            var flatHashMapSource = JSON.stringify(flatAssetMap);
            compilation.assets['assetHashMap.json'] = {
                source: function () {
                    return assetHashMapSource;
                },
                size: function () {
                    return assetHashMapSource.length;
                }
            };
            compilation.assets['flatHashMap.json'] = {
                source: function () {
                    return flatHashMapSource;
                },
                size: function () {
                    return flatHashMapSource.length;
                }
            };
            callback();
        });
    };
    return AssetMapPlugin;
}());
exports.default = AssetMapPlugin;
var MiniCssExtractPluginCleanup = /** @class */ (function () {
    function MiniCssExtractPluginCleanup() {
    }
    MiniCssExtractPluginCleanup.prototype.apply = function (compiler) {
        compiler.hooks.emit.tapAsync('MiniCssExtractPluginCleanup', function (compilation, callback) {
            var jsFile = /\.js$/;
            var jsMapFile = /\.js.map$/;
            compilation.entrypoints.forEach(function (entrypoint) {
                entrypoint.chunks.forEach(function (chunk) {
                    if (chunk.files.length > 1) {
                        var notEmptyJsModules = chunk
                            .getModules()
                            .filter(function (module) {
                            return (module.constructor.name ===
                                'NormalModule' &&
                                module.originalSource().source() !==
                                    '// extracted by mini-css-extract-plugin');
                        });
                        if (notEmptyJsModules.length === 0) {
                            chunk.files = chunk.files.filter(function (file) {
                                if (jsFile.test(file) ||
                                    jsMapFile.test(file)) {
                                    delete chunk.files[file];
                                    delete compilation.assets[file];
                                    return false;
                                }
                                else
                                    return true;
                            });
                        }
                    }
                });
            });
            callback();
        });
    };
    return MiniCssExtractPluginCleanup;
}());
exports.MiniCssExtractPluginCleanup = MiniCssExtractPluginCleanup;
//# sourceMappingURL=index.js.map