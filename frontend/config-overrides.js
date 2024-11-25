const CompressionPlugin = require('compression-webpack-plugin');

module.exports = function override(config, env) {
  if (env === 'production') {
    // Remover console.logs na produção
    if (!config.optimization.minimizer) {
      config.optimization.minimizer = [];
    }

    // Adicionar compressão gzip
    config.plugins.push(
      new CompressionPlugin({
        algorithm: 'gzip',
        test: /\.js$|\.css$|\.html$/,
        threshold: 10240,
        minRatio: 0.8,
      })
    );

    // Otimizações adicionais
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
      runtimeChunk: 'single',
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: Infinity,
        minSize: 0,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const packageName = module.context.match(
                /[\\/]node_modules[\\/](.*?)([\\/]|$)/
              )[1];
              return `vendor.${packageName.replace('@', '')}`;
            },
          },
        },
      },
    };
  }

  return config;
};
