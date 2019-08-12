const glob = require('glob');
const path = require('path');

/**
 * @description
 * @param {*} options:{pattern:string, ignore : string[], outPutFolder?:string, globOption?:Object }
 */
const getScssEntry = (options = {}) => {
    const defaultOption = {
        pattern: `**/**bundle.scss`,
        ignore: ['/node_modules'],
        outPutFolderName: 'css',
        globOption: {}
    };
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
    console.log(entryPoint);
    return entryPoint;
};


getScssEntry();