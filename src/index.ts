/*
 * @Author: Zhou Fang
 * @Date: 2019-08-1 22:02:09
 * @Last Modified by: Zhou Fang
 * @Last Modified time: 2019-08-12 13:56:57
 */
import { compilation } from 'webpack';
import * as glob from 'glob';
import * as path from 'path';

interface CssEntryOption {
    pattern: string;
    ignore: string[];
    outPutFolder?: string;
    globOption?: glob.IOptions;
}
/**
 * @description : Creating wildcarded entry point and dynamically named outputs base on the entry name
 * @default  pattern:  pattern: `**bundle.scss`,ignore: ['/node_modules'], outPutFolderName: 'css', globOption: {}
 * @param {*} options:{pattern:string, ignore : string[], outPutFolder?:string, globOption?:Object }
 */
export const getScssEntry = (options: CssEntryOption) => {
    const defaultOption = {
        pattern: `**/**bundle.scss`,
        ignore: ['/node_modules'],
        outPutFolderName: 'css',
        globOption: {}
    };
    if (options === undefined) {
    }
    let { pattern, ignore, outPutFolderName, globOption } = Object.assign(
        {},
        defaultOption,
        options
    );
    globOption = {
        ignore: [...ignore]
    };
    const fileList = glob.sync(pattern, globOption);
    console.log(fileList);
    const entryPoint = {};
    if (fileList.length > 0) {
        fileList.forEach(filePath => {
            const fileName = path.basename(filePath, path.extname(filePath));
            let subFolder;
            if (fileName.indexOf('.cb2') > 0) {
                subFolder = 'cb2';
            } else if (fileName.indexOf('.crate') > 0) {
                subFolder = 'crate';
            } else {
                subFolder = 'common';
            }
            const outPutPath = `${outPutFolderName}/${subFolder}/${fileName}`;
            entryPoint[outPutPath] = filePath;
        });
    }
    return entryPoint;
};

/**
 * @description Generate the map json file with content hash for the assets
 * @export
 * @class AssetMapPlugin
 */
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

/**
 * @description Clean the empty js caused by pure css/scss entry
 * @export
 * @class MiniCssExtractPluginCleanup
 */
export class MiniCssExtractPluginCleanup {
    apply(compiler) {
        compiler.hooks.emit.tapAsync(
            'MiniCssExtractPluginCleanup',
            (compilation: compilation.Compilation, callback) => {
                let jsFile: RegExp = /\.js$/;
                let jsMapFile: RegExp = /\.js.map$/;

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
