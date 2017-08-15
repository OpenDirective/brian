const path = require('path')
const webpack = require('webpack')
const Dotenv = require('dotenv-webpack')

const appPath = (...names) => path.join(process.cwd(), ...names)

//This will be merged with the config from the flavor
module.exports = {
    entry: {
        main: [appPath('src', 'index.ts'), appPath('src', 'css', 'styles.scss')]
    },
    output: {
        filename: 'bundle.[hash].js',
        path: appPath('build')
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
        }),
        new Dotenv()
    ]
}
