const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

const server = http.createServer((req, res) => {
  // ตัด Query string ออกเพื่อให้หาไฟล์เจอ (ป้องกัน 404 เวลามี ? พ่วงท้าย)
  const urlWithoutQuery = req.url.split('?')[0];
  let filePath = path.join(__dirname, urlWithoutQuery === '/' ? 'index.html' : urlWithoutQuery);
  const extname = path.extname(filePath);
  const contentType = MIME_TYPES[extname] || 'text/plain';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Web Server กำลังทำงานที่: http://localhost:${PORT}/`);
  console.log(`กด Ctrl+C เพื่อหยุดการทำงาน`);
});
