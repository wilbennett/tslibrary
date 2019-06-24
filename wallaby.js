module.exports = function (wallaby) {
    return {
        files: [
            'tsconfig.json',
            'jest.config.js',
            'src/**/*.ts',
            '!src/**/__tests__/*.ts'
        ],

        tests: [
            'src/**/__tests__/*.ts'
        ],

        env: {
            type: 'node',
            runner: 'node'
        },

        debug: true,
        testFramework: 'jest',

        preprocessors: {
            '**/*.js?(x)': file => require('@babel/core').transform(
                file.content,
                { sourceMap: true, filename: file.path, presets: [require('babel-preset-jest')] })
        }
    };
};
