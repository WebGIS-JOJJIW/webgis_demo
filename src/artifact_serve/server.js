const http = require('http');
const finalhandler = require('finalhandler');
const serveStatic = require('serve-static');
const history = require('connect-history-api-fallback');

// Serve static assets
const serve = serveStatic('/data', { 'index': ['index.html', 'index.htm'] });

// CORS middleware
const enableCORS = (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Intercept OPTIONS method
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }
    
    next();
};

// Create server
const server = http.createServer((req, res) => {
    const done = finalhandler(req, res);
    
    enableCORS(req, res, () => {
        history()(req, res, () => {
            serve(req, res, done);
        });
    });
});

// Listen on port 8080, binding to 0.0.0.0
server.listen(8080, '0.0.0.0', () => {
    console.log('Server listening on http://0.0.0.0:8080');
});
