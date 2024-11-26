const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const NETLIFY_URL = 'hangman-gamely.netlify.app';

const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml'
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    // First try to serve local files
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if(error.code == 'ENOENT') {
                // If file not found locally, proxy to Netlify
                console.log('File not found locally, proxying to Netlify:', req.url);
                
                const options = {
                    hostname: NETLIFY_URL,
                    path: req.url,
                    method: req.method,
                    headers: {
                        ...req.headers,
                        host: NETLIFY_URL
                    }
                };

                const proxyReq = https.request(options, (proxyRes) => {
                    res.writeHead(proxyRes.statusCode, proxyRes.headers);
                    proxyRes.pipe(res);
                });

                proxyReq.on('error', (error) => {
                    console.error('Proxy error:', error);
                    res.writeHead(500);
                    res.end('Proxy error: ' + error.message);
                });

                if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
                    req.pipe(proxyReq);
                } else {
                    proxyReq.end();
                }
            } else {
                console.error('Server error:', error.code);
                res.writeHead(500);
                res.end('Server error: ' + error.code);
            }
        } else {
            console.log('Serving local file:', filePath);
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

const PORT = 3456;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Serving files from: ${__dirname}`);
    console.log(`Proxying to: https://${NETLIFY_URL}`);
});
