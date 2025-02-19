// local-test.js
const http = require('http');
const serverlessHandler = require('./dist/serverless.js').default; // adjust the path as needed

const server = http.createServer((req, res) => {
  serverlessHandler(req, res);
});

const port = process.env.PORT || 3005;
server.listen(port, () => {
  console.log(`Serverless function running locally on port ${port}`);
});
