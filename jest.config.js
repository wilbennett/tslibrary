module.exports = {
    "roots": [
        "./src"
    ],
    "transform": {
        "^.+\\.tsx?$": "ts-jest"
    },
    "coverageReporters": [
        "html",
        "text"
    ],
    "setupFiles": [
        "./src/twod/canvas-context/__mocks__/setup.ts"
    ]
    // "automock": true
}