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

        testFramework: 'jest'
    };
};