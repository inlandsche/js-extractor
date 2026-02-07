const http = require('http');

const data = JSON.stringify({
    text: `
    const x = "supersecret";
    const normalString = "This is a normal sentence.";
    const y = "another_password_value";
    const z = "not_a_secret";
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
