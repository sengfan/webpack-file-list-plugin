import { Stats, compilation, NamedChunksPlugin } from 'webpack';
import * as util from 'util';
import * as fs from 'fs';
import * as NormalModule from 'webpack/lib/NormalModule';
import * as glob from 'glob';

// get all the
const getAllScss = (patterns: string[] = ['./']) => {
    patterns.map(pattern => {
        glob.sync(pattern);
    });
};
const scssEntries = glob.sync('./**/*Spec.js');

export default class AssetMapPlugin {
    constructor() {}
    generateChunkMap(chunk: compilation.Chunk) {
        const name = chunk.name;
        const Dependencies = chunk.getModules();
    }

    apply(compiler) {
        compiler.hooks.emit.tapAsync(
            'AssetMapPlugin',
            (compilation: compilation.Compilation, callback) => {
                const assetMap = {};
                const flatAssetMap = {};
                const cssFile = /\.css$/;
                const jsFile = /\.js$/;
                compilation.chunks.forEach((chunk: compilation.Chunk) => {
                    let id, outPutFile, hash;
                    id = chunk.id;
                    outPutFile = {};
                    chunk.files.forEach(filename => {
                        if (jsFile.test(filename)) {
                            if (
                                (<any>chunk).contentHash &&
                                (<any>chunk).contentHash.javascript
                            ) {
                                hash = (<any>chunk).contentHash.javascript;
                            } else {
                                hash = chunk.hash;
                            }
                            outPutFile.js
                                ? outPutFile.js.push({ filename, hash })
                                : (outPutFile.js = [{ filename, hash }]);
                            flatAssetMap[filename] = hash;
                        }

                        if (cssFile.test(filename)) {
                            if (
                                (<any>chunk).contentHash &&
                                (<any>chunk).contentHash['css/mini-extract']
                            ) {
                                hash = (<any>chunk).contentHash[
                                    'css/mini-extract'
                                ];
                            } else {
                                hash = chunk.hash;
                            }
                            const file = {
                                filename,
                                hash
                            };
                            outPutFile.css
                                ? outPutFile.css.push({ filename, hash })
                                : (outPutFile.css = [{ filename, hash }]);
                            flatAssetMap[filename] = hash;
                        }
                        assetMap[id] = outPutFile;
                        //   console.log(source);
                    });
                });

                const assetHashMapSource = JSON.stringify(assetMap);
                const flatHashMapSource = JSON.stringify(flatAssetMap);
                compilation.assets['assetHashMap.json'] = {
                    source: function() {
                        return assetHashMapSource;
                    },
                    size: function() {
                        return assetHashMapSource.length;
                    }
                };
                compilation.assets['flatHashMap.json'] = {
                    source: function() {
                        return flatHashMapSource;
                    },
                    size: function() {
                        return flatHashMapSource.length;
                    }
                };
                callback();
            }
        );
    }
}
export class MiniCssExtractPluginCleanup {
    apply(compiler) {
        compiler.hooks.emit.tapAsync(
            'MiniCssExtractPluginCleanup',
            (compilation, callback) => {
                let jsFile = /\.js$/;
                let jsMapFile = /\.js.map$/;

                compilation.entrypoints.forEach(entrypoint => {
                    entrypoint.chunks.forEach(chunk => {
                        if (chunk.files.length > 1) {
                            let notEmptyJsModules = chunk
                                .getModules()
                                .filter(module => {
                                    return (
                                        module.constructor.name ===
                                            'NormalModule' &&
                                        module.originalSource().source() !==
                                            '// extracted by mini-css-extract-plugin'
                                    );
                                });

                            if (notEmptyJsModules.length === 0) {
                                chunk.files = chunk.files.filter(file => {
                                    if (
                                        jsFile.test(file) ||
                                        jsMapFile.test(file)
                                    ) {
                                        delete chunk.files[file];
                                        delete compilation.assets[file];
                                        return false;
                                    } else return true;
                                });
                            }
                        }
                    });
                });

                callback();
            }
        );
    }
}
