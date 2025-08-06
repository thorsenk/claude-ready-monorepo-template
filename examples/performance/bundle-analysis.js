// Bundle analysis configuration and utilities
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CompressionPlugin = require('compression-webpack-plugin');

// Next.js webpack configuration with bundle analysis
module.exports = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Bundle analyzer - only in production and when ANALYZE=true
    if (!dev && process.env.ANALYZE === 'true') {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: true,
          reportFilename: isServer
            ? '../analyze/server.html'
            : './analyze/client.html',
        })
      );
    }

    // Compression plugin for production
    if (!dev) {
      config.plugins.push(
        new CompressionPlugin({
          algorithm: 'gzip',
          test: /\.(js|css|html|svg)$/,
          threshold: 8192,
          minRatio: 0.8,
        })
      );
    }

    // Bundle optimization
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            enforce: true,
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      },
    };

    // Tree shaking optimization
    config.optimization.usedExports = true;
    config.optimization.providedExports = true;
    config.optimization.sideEffects = false;

    return config;
  },

  // Experimental features for performance
  experimental: {
    // Modern builds for better performance
    modern: true,
    // Optimize imports automatically
    optimizeImports: ['lodash', 'date-fns'],
    // Tree shake unused exports
    externalDir: true,
  },

  // Image optimization
  images: {
    domains: ['example.com', 'images.unsplash.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
  },

  // Performance optimizations
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,

  // Reduce bundle size
  outputFileTracing: true,
  
  // Environment-specific optimizations
  env: {
    ANALYZE: process.env.ANALYZE,
    BUNDLE_SIZE_LIMIT: process.env.BUNDLE_SIZE_LIMIT || '250kb',
  },
};

// Performance monitoring utilities
class BundleMonitor {
  constructor() {
    this.sizeThresholds = {
      warning: 200 * 1024, // 200KB
      error: 250 * 1024,   // 250KB
    };
    
    this.reportPath = './reports/bundle-analysis.json';
  }

  // Analyze bundle and generate report
  analyzeBundleSize(stats) {
    const assets = stats.compilation.assets;
    const analysis = {
      timestamp: new Date().toISOString(),
      total: 0,
      chunks: [],
      warnings: [],
      errors: [],
    };

    Object.keys(assets).forEach(assetName => {
      const asset = assets[assetName];
      const size = asset.size();
      
      analysis.total += size;
      analysis.chunks.push({
        name: assetName,
        size,
        sizeFormatted: this.formatBytes(size),
      });

      // Check thresholds
      if (size > this.sizeThresholds.error) {
        analysis.errors.push({
          asset: assetName,
          size: this.formatBytes(size),
          message: `Asset exceeds size limit (${this.formatBytes(this.sizeThresholds.error)})`,
        });
      } else if (size > this.sizeThresholds.warning) {
        analysis.warnings.push({
          asset: assetName,
          size: this.formatBytes(size),
          message: `Asset approaching size limit (${this.formatBytes(this.sizeThresholds.warning)})`,
        });
      }
    });

    return analysis;
  }

  // Format bytes to human readable
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  // Generate performance report
  generateReport(analysis) {
    const report = `
# Bundle Analysis Report

Generated: ${analysis.timestamp}
Total Bundle Size: ${this.formatBytes(analysis.total)}

## Size Breakdown

${analysis.chunks
  .sort((a, b) => b.size - a.size)
  .map(chunk => `- ${chunk.name}: ${chunk.sizeFormatted}`)
  .join('\n')}

## Warnings (${analysis.warnings.length})

${analysis.warnings.map(warning => 
  `⚠️ ${warning.asset}: ${warning.message}`
).join('\n')}

## Errors (${analysis.errors.length})

${analysis.errors.map(error => 
  `❌ ${error.asset}: ${error.message}`
).join('\n')}

## Recommendations

${this.generateRecommendations(analysis)}
    `;

    return report;
  }

  // Generate optimization recommendations
  generateRecommendations(analysis) {
    const recommendations = [];
    
    if (analysis.total > this.sizeThresholds.error) {
      recommendations.push('🚨 Bundle size exceeds recommended limit');
      recommendations.push('• Consider code splitting with dynamic imports');
      recommendations.push('• Analyze and remove unused dependencies');
      recommendations.push('• Use tree shaking to eliminate dead code');
    }
    
    if (analysis.warnings.length > 0) {
      recommendations.push('⚠️ Some assets are approaching size limits');
      recommendations.push('• Consider lazy loading for large components');
      recommendations.push('• Optimize images and use modern formats (WebP/AVIF)');
    }
    
    const largeChunks = analysis.chunks.filter(chunk => 
      chunk.size > 50 * 1024 // > 50KB
    );
    
    if (largeChunks.length > 5) {
      recommendations.push('📦 Consider consolidating small chunks');
      recommendations.push('• Review splitChunks configuration');
      recommendations.push('• Merge related functionality into larger chunks');
    }

    return recommendations.length > 0 
      ? recommendations.join('\n') 
      : '✅ Bundle size is within recommended limits';
  }
}

// Webpack plugin for automated bundle monitoring
class BundleMonitorPlugin {
  constructor(options = {}) {
    this.monitor = new BundleMonitor();
    this.options = {
      outputPath: './reports',
      failOnError: false,
      ...options,
    };
  }

  apply(compiler) {
    compiler.hooks.afterEmit.tapAsync('BundleMonitorPlugin', (compilation, callback) => {
      const analysis = this.monitor.analyzeBundleSize(compilation);
      const report = this.monitor.generateReport(analysis);
      
      // Ensure output directory exists
      const fs = require('fs');
      const path = require('path');
      
      if (!fs.existsSync(this.options.outputPath)) {
        fs.mkdirSync(this.options.outputPath, { recursive: true });
      }
      
      // Write reports
      fs.writeFileSync(
        path.join(this.options.outputPath, 'bundle-analysis.json'),
        JSON.stringify(analysis, null, 2)
      );
      
      fs.writeFileSync(
        path.join(this.options.outputPath, 'bundle-report.md'),
        report
      );
      
      // Log results
      console.log('📊 Bundle Analysis Complete');
      console.log(`Total Size: ${this.monitor.formatBytes(analysis.total)}`);
      
      if (analysis.warnings.length > 0) {
        console.log(`⚠️ ${analysis.warnings.length} warnings`);
      }
      
      if (analysis.errors.length > 0) {
        console.log(`❌ ${analysis.errors.length} errors`);
        
        if (this.options.failOnError) {
          return callback(new Error('Bundle size exceeds limits'));
        }
      }
      
      callback();
    });
  }
}

// Package.json scripts for bundle analysis
const packageScripts = {
  "analyze": "cross-env ANALYZE=true next build",
  "analyze:server": "cross-env BUNDLE_ANALYZE=server next build",
  "analyze:browser": "cross-env BUNDLE_ANALYZE=browser next build",
  "build:analyze": "npm run build && npm run analyze",
  "size-limit": "size-limit",
  "size-limit:why": "size-limit --why"
};

// Size-limit configuration for automated checks
const sizeLimitConfig = [
  {
    name: "Client bundle (First Load JS)",
    path: ".next/static/chunks/pages/_app*.js",
    limit: "150 KB",
    gzip: true
  },
  {
    name: "Home page bundle",
    path: ".next/static/chunks/pages/index*.js", 
    limit: "50 KB",
    gzip: true
  },
  {
    name: "Total CSS",
    path: ".next/static/css/*.css",
    limit: "30 KB",
    gzip: true
  }
];

// GitHub Action for bundle size monitoring
const bundleCheckAction = `
name: Bundle Size Check

on:
  pull_request:
    branches: [main]

jobs:
  bundle-analysis:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'pnpm'
          
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Build and analyze
        run: pnpm build:analyze
        
      - name: Check bundle size
        run: pnpm size-limit
        
      - name: Comment PR
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const report = fs.readFileSync('./reports/bundle-report.md', 'utf8');
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: \`## 📊 Bundle Analysis Report\\n\\n\${report}\`
            });
`;

module.exports = {
  BundleMonitor,
  BundleMonitorPlugin,
  packageScripts,
  sizeLimitConfig,
  bundleCheckAction,
};