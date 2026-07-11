const http = require('http');

const port = process.env.PORT || 3000;

const html = `<!DOCTYPE html>
<html>
<head><title>EE Build</title></head>
<body>
  <h1>EE Build is live!</h1>
  <a href="https://www.google.com">
    <button>Go to Google</button>
  </a>
</body>
</html>`;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
