// vue.config.js
let CopyWebpackPlugin = require('copy-webpack-plugin')
let FileManagerPlugin = require('filemanager-webpack-plugin');
let path = require('path')
let fs = require('fs');

const getVersion = () => {
    const pkgPath = path.join(__dirname, './package.json');
    let pkg = fs.readFileSync(pkgPath);
    pkg = JSON.parse(pkg);
    return pkg.version;
}

module.exports = {
    publicPath: '/fiflow',
    outputDir: 'dist',
    assetsDir: 'static',
    chainWebpack: (config) => {
        if (process.env.NODE_ENV === 'production') {
            config.plugin('compress').use(FileManagerPlugin, [{
                onEnd: {
                    copy: [
                        { source: 'node_modules/monaco-editor/dev/vs', destination: `./dist/static/vs` },
                        { source: './config.sh', destination: `./dist` },
                        { source: './install.sh', destination: `./dist` }
                    ],
                    // 先删除根目录下的zip包
                    delete: [`./fiflow-ui-${getVersion()}-dist.zip`],
                    // 将dist文件夹下的文件进行打包
                    archive: [
                        { source: './dist', destination: `./fiflow-ui-${getVersion()}-dist.zip` },
                    ]
                },
            }])
        }
    },
    devServer: {
        port: 8080,
        open: true,
        overlay: {
            warnings: false,
            errors: true
        },
        proxy: {
            // change xxx-api/login => mock/login
            // detail: https://cli.vuejs.org/config/#devserver-proxy
            "/fiflow": {
                target: `http://127.0.0.1:9090`,
                changeOrigin: true,
            }
        }
    },

    configureWebpack: {
        resolve: {
            alias: {
                'vue$': 'vue/dist/vue.esm.js',
                '@': path.resolve(__dirname, './src'),
                '@js': path.resolve(__dirname, './src/js'),
                '@assets': path.resolve(__dirname, './src/assets')
            }
        },
        plugins: [
            new CopyWebpackPlugin([{
                from: 'node_modules/monaco-editor/dev/vs',
                to: 'static/vs',
            }]),
        ]
    },
    // 选项...
    pluginOptions: {
        mock: {
            entry: 'mock.js',
            power: false
        }
    }
}
