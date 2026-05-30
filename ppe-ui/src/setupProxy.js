/**
 * Dev-server proxies so remote browsers only need port 3000 (public IP / LAN).
 * /api → edge-cloud:3001, /go2rtc → go2rtc:1984
 */
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function setupProxy(app) {
  app.use(
    '/go2rtc',
    createProxyMiddleware({
      target: 'http://127.0.0.1:1984',
      pathRewrite: { '^/go2rtc': '' },
      changeOrigin: true,
    }),
  );
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://127.0.0.1:3001',
      changeOrigin: false,
      on: {
        proxyReq: (proxyReq, req) => {
          const host = req.headers.host;
          if (host) {
            proxyReq.setHeader('X-Forwarded-Host', host);
            proxyReq.setHeader('X-Forwarded-Proto', 'http');
          }
        },
      },
    }),
  );
};
