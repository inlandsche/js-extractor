const http = require('http');

const data = JSON.stringify({
    text: `
    const validURL = "https://google.com";
    const validURL2 = "http://api.service.io/v1/data";
    const incompleteURL1 = "https://www.";
    const incompleteURL2 = "http://www";
    const justWWW = "www.";
    const validWithPath = "https://example.com/path/to/file.js";
  `
});

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/analyze-text',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`);
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
        console.log('Response:', JSON.parse(body));
    });
});

req.on('error', error => {
    console.error('Error:', error);
});

req.write(data);
req.end();
