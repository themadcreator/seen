const withCss = require('@zeit/next-css');

module.exports = withCss({
    pageExtensions: ['md', 'mdx', 'js', 'jsx'],
    webpack: (config, { defaultLoaders }) => {
        config.module.rules.push({
            test: /\.mdx?$/,
            use: [
                defaultLoaders.babel,
                '@mdx-js/loader',
            ]
        });

        config.module.rules.push({
            test: /\.tsx?$/,
            use: [
                defaultLoaders.babel,
                'awesome-typescript-loader',
            ]
        });

        config.module.rules.push({
            test: /\.(ttf|eot|woff|woff2)$/,
            use: {
                loader: 'file-loader',
                options: {
                    publicPath: '/_next',
                    name: 'static/fonts/[name].[ext]',
                },
            },
        });

        return config;
    }
});
