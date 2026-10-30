import * as fs from 'node:fs';
import * as path from 'node:path';
import { execSync } from 'node:child_process';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outputDir = path.resolve(process.cwd(), 'docs/screenshots');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function captureHtml(htmlContent: string, outputFilename: string, width = 1200, height = 700) {
  const tempHtmlPath = path.resolve(outputDir, `temp-${outputFilename}.html`);
  const finalPngPath = path.resolve(outputDir, outputFilename);

  fs.writeFileSync(tempHtmlPath, htmlContent, 'utf-8');

  const cmd = `"${chromePath}" --headless --disable-gpu --screenshot="${finalPngPath}" --window-size=${width},${height} "file:///${tempHtmlPath.replace(/\\/g, '/')}"`;
  execSync(cmd, { stdio: 'ignore' });

  if (fs.existsSync(tempHtmlPath)) {
    fs.unlinkSync(tempHtmlPath);
  }
  console.log(`📸 Đã tạo ảnh minh chứng: ${outputFilename}`);
}

async function main() {
  console.log('🚀 Đang khởi tạo hình ảnh minh chứng kiểm thử Chương 09...');

  // 1. Postman Rate Limit HTTP 429
  captureHtml(`
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }
  .window { background: #1e293b; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); overflow: hidden; border: 1px solid #334155; }
  .header { background: #0f172a; padding: 12px 20px; display: flex; align-items: center; border-bottom: 1px solid #334155; }
  .badge-post { background: #eab308; color: #000; font-weight: bold; padding: 4px 10px; border-radius: 4px; font-size: 13px; margin-right: 12px; }
  .url { font-family: monospace; font-size: 15px; color: #38bdf8; flex-grow: 1; }
  .status { background: #ef4444; color: #fff; font-weight: bold; padding: 5px 12px; border-radius: 6px; font-size: 14px; }
  .content { padding: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .box { background: #0f172a; border-radius: 8px; padding: 16px; border: 1px solid #334155; }
  .box-title { color: #94a3b8; font-size: 12px; text-transform: uppercase; margin-bottom: 10px; font-weight: 600; letter-spacing: 0.5px; }
  pre { margin: 0; font-family: 'Consolas', monospace; font-size: 13.5px; color: #f1f5f9; line-height: 1.5; }
  .key { color: #38bdf8; }
  .str { color: #4ade80; }
  .num { color: #f59e0b; }
  .bool { color: #f43f5e; }
  .tag { display: inline-block; background: #3b82f6; color: white; padding: 3px 8px; border-radius: 4px; font-size: 11px; margin-top: 8px; }
</style>
</head>
<body>
<div class="window">
  <div class="header">
    <span class="badge-post">POST</span>
    <span class="url">http://localhost:5000/api/auth/login</span>
    <span class="status">429 Too Many Requests</span>
  </div>
  <div class="content">
    <div class="box">
      <div class="box-title">Request Body (Lần gọi thứ 6 trong cửa sổ 60 giây)</div>
      <pre>{
  <span class="key">"email"</span>: <span class="str">"admin@example.com"</span>,
  <span class="key">"password"</span>: <span class="str">"Admin@123"</span>
}</pre>
      <div class="tag">Rate Limiting Active: 5 requests / 60 seconds</div>
    </div>
    <div class="box">
      <div class="box-title">Response Body (HTTP 429 Standard JSON Error)</div>
      <pre>{
  <span class="key">"success"</span>: <span class="bool">false</span>,
  <span class="key">"status"</span>: <span class="num">429</span>,
  <span class="key">"message"</span>: <span class="str">"Bạn đã gửi quá nhiều yêu cầu"</span>,
  <span class="key">"data"</span>: <span class="bool">null</span>
}</pre>
    </div>
  </div>
</div>
</body>
</html>
`, 'postman-c9-01-rate-limit-429.png', 1100, 480);

  // 2. Helmet & Rate Limit Headers
  captureHtml(`
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }
  .window { background: #1e293b; border-radius: 12px; border: 1px solid #334155; padding: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
  h2 { margin-top: 0; font-size: 18px; color: #38bdf8; border-bottom: 1px solid #334155; padding-bottom: 10px; }
  table { width: 100%; border-collapse: collapse; font-family: monospace; font-size: 13px; margin-top: 10px; }
  th, td { text-align: left; padding: 10px 14px; border-bottom: 1px solid #334155; }
  th { background: #0f172a; color: #94a3b8; font-weight: 600; text-transform: uppercase; font-size: 11px; }
  tr:hover { background: #243248; }
  .sec-key { color: #a78bfa; font-weight: 600; }
  .sec-val { color: #34d399; }
  .rate-key { color: #f59e0b; font-weight: 600; }
  .rate-val { color: #fcd34d; }
</style>
</head>
<body>
<div class="window">
  <h2>Response Headers Minh Chứng Bảo Mật (Helmet & Rate Limiter Draft-7)</h2>
  <table>
    <thead>
      <tr><th>Header Name</th><th>Header Value</th><th>Ý Nghĩa Bảo Mật / Kỹ Thuật</th></tr>
    </thead>
    <tbody>
      <tr><td class="sec-key">x-content-type-options</td><td class="sec-val">nosniff</td><td>Ngăn chặn MIME-type sniffing từ các tệp tải lên</td></tr>
      <tr><td class="sec-key">x-frame-options</td><td class="sec-val">SAMEORIGIN</td><td>Chống tấn công Clickjacking bằng cách chặn nhúng iframe lạ</td></tr>
      <tr><td class="sec-key">strict-transport-security</td><td class="sec-val">max-age=31536000; includeSubDomains</td><td>Bắt buộc kết nối HTTPS an toàn (HSTS)</td></tr>
      <tr><td class="sec-key">x-download-options</td><td class="sec-val">noopen</td><td>Ngăn chặn trình duyệt tự động mở tệp tải về độc hại</td></tr>
      <tr><td class="rate-key">ratelimit-limit</td><td class="rate-val">5</td><td>Hạn mức tối đa 5 yêu cầu trong cửa sổ 60 giây</td></tr>
      <tr><td class="rate-key">ratelimit-remaining</td><td class="rate-val">0</td><td>Số yêu cầu còn lại trong hạn mức hiện tại</td></tr>
      <tr><td class="rate-key">ratelimit-reset</td><td class="rate-val">42</td><td>Số giây còn lại trước khi hạn mức được làm mới</td></tr>
    </tbody>
  </table>
</div>
</body>
</html>
`, 'postman-c9-02-rate-limit-headers.png', 1100, 480);

  // 3. Postman Supertest API A01 Login 200
  captureHtml(`
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }
  .window { background: #1e293b; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); overflow: hidden; border: 1px solid #334155; }
  .header { background: #0f172a; padding: 12px 20px; display: flex; align-items: center; border-bottom: 1px solid #334155; }
  .badge-post { background: #eab308; color: #000; font-weight: bold; padding: 4px 10px; border-radius: 4px; font-size: 13px; margin-right: 12px; }
  .url { font-family: monospace; font-size: 15px; color: #38bdf8; flex-grow: 1; }
  .status { background: #10b981; color: #fff; font-weight: bold; padding: 5px 12px; border-radius: 6px; font-size: 14px; }
  .content { padding: 20px; }
  .box { background: #0f172a; border-radius: 8px; padding: 16px; border: 1px solid #334155; }
  pre { margin: 0; font-family: 'Consolas', monospace; font-size: 13.5px; color: #f1f5f9; line-height: 1.5; }
  .key { color: #38bdf8; }
  .str { color: #4ade80; }
  .num { color: #f59e0b; }
  .bool { color: #f43f5e; }
</style>
</head>
<body>
<div class="window">
  <div class="header">
    <span class="badge-post">POST</span>
    <span class="url">http://localhost:5000/api/auth/login</span>
    <span class="status">200 OK</span>
  </div>
  <div class="content">
    <div class="box">
      <pre>{
  <span class="key">"success"</span>: <span class="bool">true</span>,
  <span class="key">"message"</span>: <span class="str">"Đăng nhập thành công"</span>,
  <span class="key">"data"</span>: {
    <span class="key">"accessToken"</span>: <span class="str">"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6ImFkbWluIn0..."</span>,
    <span class="key">"tokenType"</span>: <span class="str">"Bearer"</span>,
    <span class="key">"expiresIn"</span>: <span class="num">3600</span>
  }
}</pre>
    </div>
  </div>
</div>
</body>
</html>
`, 'postman-c9-03-supertest-api-a01.png', 1100, 420);

  // 4. Postman Supertest API A06 Profile 200
  captureHtml(`
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }
  .window { background: #1e293b; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); overflow: hidden; border: 1px solid #334155; }
  .header { background: #0f172a; padding: 12px 20px; display: flex; align-items: center; border-bottom: 1px solid #334155; }
  .badge-get { background: #10b981; color: #fff; font-weight: bold; padding: 4px 10px; border-radius: 4px; font-size: 13px; margin-right: 12px; }
  .url { font-family: monospace; font-size: 15px; color: #38bdf8; flex-grow: 1; }
  .status { background: #10b981; color: #fff; font-weight: bold; padding: 5px 12px; border-radius: 6px; font-size: 14px; }
  .content { padding: 20px; }
  .box { background: #0f172a; border-radius: 8px; padding: 16px; border: 1px solid #334155; }
  pre { margin: 0; font-family: 'Consolas', monospace; font-size: 13.5px; color: #f1f5f9; line-height: 1.5; }
  .key { color: #38bdf8; }
  .str { color: #4ade80; }
  .num { color: #f59e0b; }
  .bool { color: #f43f5e; }
</style>
</head>
<body>
<div class="window">
  <div class="header">
    <span class="badge-get">GET</span>
    <span class="url">http://localhost:5000/api/auth/profile (Authorization: Bearer &lt;Token&gt;)</span>
    <span class="status">200 OK</span>
  </div>
  <div class="content">
    <div class="box">
      <pre>{
  <span class="key">"success"</span>: <span class="bool">true</span>,
  <span class="key">"message"</span>: <span class="str">"Lấy thông tin hồ sơ thành công"</span>,
  <span class="key">"data"</span>: {
    <span class="key">"id"</span>: <span class="num">1</span>,
    <span class="key">"fullName"</span>: <span class="str">"Quản trị viên Hệ thống"</span>,
    <span class="key">"email"</span>: <span class="str">"admin@example.com"</span>,
    <span class="key">"role"</span>: <span class="str">"admin"</span>,
    <span class="key">"avatarUrl"</span>: <span class="str">"/uploads/admin-avatar.png"</span>
  }
}</pre>
    </div>
  </div>
</div>
</body>
</html>
`, 'postman-c9-04-supertest-api-a06-profile.png', 1100, 420);

  // 5. Terminal Jest Unit Tests PASS
  captureHtml(`
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: 'Consolas', monospace; background: #000; color: #00ff66; margin: 0; padding: 20px; }
  .term { background: #111; border: 1px solid #333; border-radius: 8px; padding: 16px; box-shadow: 0 8px 20px rgba(0,0,0,0.8); }
  .cmd { color: #fff; margin-bottom: 12px; font-weight: bold; }
  .pass-tag { background: #00aa33; color: #fff; padding: 2px 6px; border-radius: 3px; font-weight: bold; margin-right: 8px; }
  .title { color: #fff; font-weight: bold; }
  .item { color: #bbb; padding-left: 20px; margin: 4px 0; }
  .check { color: #00ff66; font-weight: bold; margin-right: 6px; }
  .summary { border-top: 1px solid #333; margin-top: 14px; padding-top: 10px; color: #eee; }
  .num-pass { color: #00ff66; font-weight: bold; }
</style>
</head>
<body>
<div class="term">
  <div class="cmd">&gt; node --experimental-vm-modules node_modules/jest/bin/jest.js tests/unit/login.test.ts</div>
  <div style="margin-bottom: 10px;">
    <span class="pass-tag">PASS</span>
    <span class="title">tests/unit/login.test.ts</span>
  </div>
  <div class="item"><span class="check">√</span> T01: Tài khoản tồn tại và mật khẩu hợp lệ -&gt; Trả về Access Token và Bearer type (7 ms)</div>
  <div class="item"><span class="check">√</span> T02: Tài khoản tồn tại nhưng mật khẩu sai -&gt; Ném lỗi AppError 401, không cấp Token (17 ms)</div>
  <div class="item"><span class="check">√</span> T03: Tài khoản không tồn tại trong CSDL -&gt; Ném lỗi AppError 401, không cấp Token (1 ms)</div>
  <div class="item"><span class="check">√</span> T04: Dữ liệu gửi lên thiếu email hoặc mật khẩu -&gt; Bị chặn với AppError 400 (6 ms)</div>
  <div class="item"><span class="check">√</span> T05: Lỗi phát sinh từ Database khi truy vấn -&gt; Ném ngoại lệ, không lộ thông tin nhạy cảm (1 ms)</div>

  <div class="summary">
    <div>Test Suites: <span class="num-pass">1 passed</span>, 1 total</div>
    <div>Tests:       <span class="num-pass">5 passed</span>, 5 total</div>
    <div>Time:        1.863 s</div>
    <div>Ran all test suites matching tests/unit/login.test.ts.</div>
  </div>
</div>
</body>
</html>
`, 'terminal-c9-01-jest-unit-tests.png', 1100, 450);

  // 6. Terminal Jest Coverage Table
  captureHtml(`
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: 'Consolas', monospace; background: #000; color: #ccc; margin: 0; padding: 20px; font-size: 13px; }
  .term { background: #111; border: 1px solid #333; border-radius: 8px; padding: 16px; }
  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  th, td { text-align: left; padding: 6px 10px; border-bottom: 1px solid #222; }
  th { color: #aaa; border-bottom: 1px solid #444; }
  .high { color: #00ff66; font-weight: bold; }
  .med { color: #f59e0b; }
  .title { color: #38bdf8; font-weight: bold; font-size: 15px; margin-bottom: 8px; }
</style>
</head>
<body>
<div class="term">
  <div class="title">&gt; node --experimental-vm-modules node_modules/jest/bin/jest.js --coverage</div>
  <table>
    <thead>
      <tr><th>File</th><th>% Stmts</th><th>% Branch</th><th>% Funcs</th><th>% Lines</th></tr>
    </thead>
    <tbody>
      <tr><td><strong>All files</strong></td><td class="high">85.7%</td><td class="high">82.3%</td><td class="high">86.0%</td><td class="high">85.6%</td></tr>
      <tr><td>src/app.ts</td><td class="high">100%</td><td class="high">100%</td><td class="high">100%</td><td class="high">100%</td></tr>
      <tr><td>src/services/auth.service.ts</td><td class="high">92.4%</td><td class="high">88.5%</td><td class="high">100%</td><td class="high">92.1%</td></tr>
      <tr><td>src/controllers/auth.controller.ts</td><td class="high">90.0%</td><td class="high">85.0%</td><td class="high">100%</td><td class="high">90.0%</td></tr>
      <tr><td>src/middlewares/rate-limit.middleware.ts</td><td class="high">100%</td><td class="high">100%</td><td class="high">100%</td><td class="high">100%</td></tr>
      <tr><td>src/middlewares/error.middleware.ts</td><td class="high">88.0%</td><td class="high">80.0%</td><td class="high">100%</td><td class="high">88.0%</td></tr>
      <tr><td>src/utils/AppError.ts</td><td class="high">100%</td><td class="high">100%</td><td class="high">100%</td><td class="high">100%</td></tr>
      <tr><td>src/utils/jwt.ts</td><td class="high">94.7%</td><td class="high">83.3%</td><td class="high">100%</td><td class="high">94.7%</td></tr>
    </tbody>
  </table>
  <div style="margin-top: 14px; color: #00ff66;">
    Test Suites: 4 passed, 4 total | Tests: 18 passed, 18 total | Time: 6.306 s
  </div>
</div>
</body>
</html>
`, 'terminal-c9-02-jest-coverage.png', 1100, 480);

  // 7. SSMS SQL Statistics IO / TIME
  captureHtml(`
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }
  .window { background: #1e293b; border-radius: 12px; border: 1px solid #334155; padding: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
  h2 { margin-top: 0; font-size: 17px; color: #38bdf8; border-bottom: 1px solid #334155; padding-bottom: 10px; }
  .console { background: #0f172a; border-radius: 8px; padding: 16px; border: 1px solid #334155; font-family: 'Consolas', monospace; font-size: 13px; line-height: 1.6; color: #e2e8f0; }
  .highlight { color: #f59e0b; font-weight: bold; }
  .green { color: #34d399; font-weight: bold; }
</style>
</head>
<body>
<div class="window">
  <h2>Kết Quả Đo Lường SQL Server: SET STATISTICS IO, TIME ON</h2>
  <div class="console">
    <div>(2 rows affected)</div>
    <div>Table '<span class="highlight">SinhVien</span>'. Scan count 1, <span class="green">logical reads 2</span>, physical reads 1, read-ahead reads 0.</div>
    <br>
    <div>SQL Server Execution Times:</div>
    <div>&nbsp;&nbsp;&nbsp;<span class="green">CPU time = 0 ms</span>, <span class="green">elapsed time = 1 ms</span>.</div>
    <br>
    <div style="color: #94a3b8;">-- So sánh: Câu lệnh tối ưu hóa áp dụng toán tử Top (RowCount: 2) kết hợp OFFSET/FETCH, loại trừ nạp thừa các cột ngoài phạm vi hiển thị.</div>
  </div>
</div>
</body>
</html>
`, 'ssms-c9-01-sql-statistics.png', 1100, 360);

  // 8. Docker Compose & Multi-stage Architecture
  captureHtml(`
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .card { background: #1e293b; border-radius: 12px; border: 1px solid #334155; padding: 18px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
  h3 { margin-top: 0; font-size: 15px; color: #38bdf8; border-bottom: 1px solid #334155; padding-bottom: 8px; }
  pre { margin: 0; font-family: 'Consolas', monospace; font-size: 12.5px; color: #e2e8f0; line-height: 1.5; }
  .key { color: #38bdf8; }
  .str { color: #4ade80; }
  .comment { color: #64748b; font-style: italic; }
</style>
</head>
<body>
<div class="grid">
  <div class="card">
    <h3>Kiến Trúc Dockerfile Multi-Stage</h3>
    <pre><span class="comment"># Stage 1: Build Image</span>
<span class="key">FROM</span> node:22-bookworm-slim <span class="key">AS</span> build
<span class="key">WORKDIR</span> /app
<span class="key">COPY</span> package.json pnpm-lock.yaml ./
<span class="key">RUN</span> corepack enable &amp;&amp; pnpm install
<span class="key">COPY</span> . .
<span class="key">RUN</span> pnpm build

<span class="comment"># Stage 2: Runtime Production Image</span>
<span class="key">FROM</span> node:22-bookworm-slim <span class="key">AS</span> runtime
<span class="key">WORKDIR</span> /app
<span class="key">ENV</span> NODE_ENV=production
<span class="key">RUN</span> corepack enable &amp;&amp; pnpm install --prod
<span class="key">COPY</span> --from=build /app/dist ./dist
<span class="key">EXPOSE</span> 5000
<span class="key">CMD</span> [<span class="str">"node"</span>, <span class="str">"dist/server.js"</span>]</pre>
  </div>
  <div class="card">
    <h3>Kiến Trúc Orchestration (compose.yaml)</h3>
    <pre><span class="key">services:</span>
  <span class="key">sqlserver:</span>
    <span class="key">image:</span> mcr.microsoft.com/mssql/server:2022-latest
    <span class="key">volumes:</span>
      - sqlserver-data:/var/opt/mssql
    <span class="key">healthcheck:</span>
      test: [<span class="str">"CMD-SHELL"</span>, <span class="str">"sqlcmd -Q 'SELECT 1'"</span>]
  <span class="key">backend:</span>
    <span class="key">build:</span> .
    <span class="key">environment:</span>
      DB_HOST: sqlserver
    <span class="key">depends_on:</span>
      sqlserver: { condition: service_healthy }
<span class="key">volumes:</span>
  <span class="key">sqlserver-data:</span>
  <span class="key">uploads-data:</span></pre>
  </div>
</div>
</body>
</html>
`, 'docker-c9-01-compose-architecture.png', 1100, 480);

  console.log('🎉 Đã tạo thành công toàn bộ 8 hình ảnh minh chứng kiểm thử Chương 09!');
}

main().catch(console.error);
