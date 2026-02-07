const http = require('http');

const data = JSON.stringify({
    text: 'const apiKey = "AIzaSyD-FakeKey12345"; const url = "https://example.com";'
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
