'use strict';

const TESTERS = [ //TODO: add testers for eclipse and intelliJ configuration files
    {
        extensions: ['c', 'cpp', 'cs', 'java', 'go'],
        test: (keyword, patch) => patch.match(new RegExp(`.*${keyword}.*=.*"`, 'i')) ? true : false
    },
    {
        extensions: ['js', 'json', 'py', 'groovy', 'rb', 'php'],
        test: (keyword, patch) => patch.match(new RegExp(`.*${keyword}.*[=:].*['"]`, 'i'))  ? true : false
    },
    {
        extensions: ['xml'],
        test: (keyword, patch) => patch.match(new RegExp(`\<.*${keyword}.*\>.+\<\/.*${keyword}.*\>`, 'i')) ? true : false
    },
    {
        extensions: ['properties', 'ini', 'bat', 'sh'],
        test: (keyword, patch) => patch.match(new RegExp(`.*${keyword}.*=[\t\s]*`, 'i')) ? true : false
    }
];

module.exports = {
  testers: Object.freeze(TESTERS),
  collectTesters: filename => TESTERS.filter(tester => tester.extensions.includes(filename.match(/\.(.+)$/)[1]))
};

