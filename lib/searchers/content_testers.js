'use strict';

const _ = require('lodash');
let SECRET_KEYWORDS = require('./constants').SECRET_KEYWORDS;

const LOCAL_ADDRESSES = [
    'localhost',
    '127.0.0.1'
];

const TESTERS = [ //TODO: add testers for eclipse and intelliJ configuration files
    buildTester({
        extensions: ['c', 'cpp', 'cs', 'java', 'go'],
        getVariableByNameKeyword: (keyword, content) => content.match(new RegExp(`.*(${keyword}).*=[ \t]*"(.+)"`, 'ig')) || content.match(new RegExp(`\\.[a-zA-Z]*(${keyword})\\("(.+)"\\)`, 'ig')),
        getVariableByValue: (value, content) => content.match(new RegExp(`.*".*${value}.*".*`, 'ig'))
    }),
    buildTester({
        extensions: ['js', 'json', 'py', 'groovy', 'rb', 'php'],
        getVariableByNameKeyword: (keyword, content) => content.match(new RegExp(`.*(${keyword}).*[=:][ \t]*['"](.+)['"]`, 'ig')),
        getVariableByValue: (value, content) => content.match(new RegExp(`.*['"].*${value}.*['"].*`, 'ig'))
    }),
    buildTester({
        extensions: ['xml'],
        getVariableByNameKeyword: (keyword, content) => content.match(new RegExp(`\\<.*(${keyword}).*\\>.+\\<\\/.*(${keyword}).*\\>`, 'ig')) || content.match(new RegExp(`.*(${keyword})[a-zA-Z_\\-]*=".+"`, 'ig')),
        getVariableByValue: (value, content) => content.match(new RegExp(`.*\\>.*${value}.*\\<.*`, 'ig')) || content.match(new RegExp(`.*".*${value}.*".*`, 'ig'))
    }),
    buildTester({
        extensions: ['properties', 'ini', 'bat', 'sh'],
        getVariableByNameKeyword: (keyword, content) => content.match(new RegExp(`.*(${keyword}).*=[ \t]*`, 'ig')),
        getVariableByValue: (value, content) => content.match(new RegExp(`=[ \t]*.*${value}.*`, 'ig'))
    })
];

const MAX_LINE_DISTANCE_TO_PAIR = 2;

function calculateLineDistance(content, passwordVariablePos, localhostPos) {
    return (content.substr(passwordVariablePos, localhostPos).match(/\n/g) || []).length;
}

function findMinimumLineDistance(content, passwordVariablePos, localhostPositions) {
    let min;
    localhostPositions.forEach(localhostPos => {
        const lineDistance = calculateLineDistance(content, passwordVariablePos, localhostPos.pos);
        if (!min || min.distance > lineDistance) {
            min = _.merge(localhostPos, {
                distance: lineDistance
            });
        }
    });
    return min ? min : MAX_LINE_DISTANCE_TO_PAIR + 1;
}

function findPasswordHostPairs(passwordVariables, localhosts, content) {
    const result = new Map();
    passwordVariables.forEach(passwordVariable => {
       const passwordVariablePos = content.indexOf(passwordVariable);
       const localhostPositions = localhosts.map((localhost, index) => ({index: index, line: localhost, pos: content.indexOf(localhost)}));
       if (_.isEmpty(localhostPositions)) {
           result.set(passwordVariable, null);
       } else {
           const minDistanceLocalhost = findMinimumLineDistance(content, passwordVariablePos, localhostPositions);
           if (minDistanceLocalhost.distance > MAX_LINE_DISTANCE_TO_PAIR) {
               result.set(passwordVariable, null);
           } else {
               result.set(passwordVariable, minDistanceLocalhost);
               localhosts.splice(minDistanceLocalhost.index, 1);
           }
       }
    });
    return result;
}

function enrichPasswordVariableResult(passwordVariables, content, data) {
    if (!passwordVariables) {
        return passwordVariables;
    }
    passwordVariables.excludeLocalPasswords = () => {
        const localhosts = _.flatten(LOCAL_ADDRESSES.map(addr => data.getVariableByValue(addr, content)).filter(value => value));
        const pairs = findPasswordHostPairs(passwordVariables, localhosts, content);
        return Array.from(pairs.entries())
            .filter(entry => !entry[1])
            .map(entry => entry[0]);
    };
    return passwordVariables;
}

function buildTester(data) {
    return {
        extensions: data.extensions,
        test: (content) => {
            const passwordVariables = data.getVariableByNameKeyword(`(${SECRET_KEYWORDS.join('|')})`, content);
            return enrichPasswordVariableResult(passwordVariables, content, data);
        }
    };
}

module.exports = {
  testers: Object.freeze(TESTERS),
  collectTesters: filename => TESTERS.filter(tester => tester.extensions.includes(filename.match(/\.(.+)$/)[1]))
};

