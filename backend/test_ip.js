const http = require('http');

const data = JSON.stringify({
    text: `
    const validIP = "192.168.1.1";
    const invalidIP1 = "256.0.0.1";
    const invalidIP2 = "1.2.3.999";
    const validIP2 = "8.8.8.8";
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
