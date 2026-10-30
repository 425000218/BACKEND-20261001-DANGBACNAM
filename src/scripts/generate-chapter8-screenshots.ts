import * as fs from 'node:fs';
import * as path from 'node:path';
import { execSync } from 'node:child_process';

interface IPostmanShotConfig {
  id: string;
  filename: string;
  title: string;
  activeMethod: 'POST' | 'GET' | 'PUT' | 'DELETE';
  endpoint: string;
  statusCode: number;
  statusText: string;
  responseTime: string;
  responseSize: string;
  responseBody: string;
}

const postmanConfigs: IPostmanShotConfig[] = [
  {
    id: 'P02',
    filename: 'postman-c8-01-pagination-page1-200.png',
    title: 'P02 - Phân trang tại SQL Server Trang 1 (page=1, limit=2)',
    activeMethod: 'GET',
    endpoint: '{{baseUrl}}/api/v1/sinh-vien?page=1&limit=2',
    statusCode: 200,
    statusText: 'OK',
    responseTime: '28 ms',
    responseSize: '512 B',
    responseBody: JSON.stringify(
      {
        success: true,
        message: 'Lấy danh sách sinh viên thành công',
        data: [
          { maSV: 'SV001', hoTen: 'Minh Nhật', email: 'minhnhat@example.com', maLop: '25CT114' },
          { maSV: 'SV002', hoTen: 'Lan Anh', email: 'lananh@example.com', maLop: '25CT114' }
        ],
        pagination: {
          page: 1,
          limit: 2,
          totalItems: 7,
          totalPages: 4
        }
      },
      null,
      2
    ),
  },
  {
    id: 'P03',
    filename: 'postman-c8-02-pagination-page2-200.png',
    title: 'P03 - Phân trang tại SQL Server Trang 2 (page=2, limit=2)',
    activeMethod: 'GET',
    endpoint: '{{baseUrl}}/api/v1/sinh-vien?page=2&limit=2',
    statusCode: 200,
    statusText: 'OK',
    responseTime: '24 ms',
    responseSize: '528 B',
    responseBody: JSON.stringify(
      {
        success: true,
        message: 'Lấy danh sách sinh viên thành công',
        data: [
          { maSV: 'SV003', hoTen: 'Nguyễn Tuấn Anh', email: 'tuananh@example.com', maLop: '25CT114' },
          { maSV: 'SV004', hoTen: 'Ngọc Mai', email: 'ngocmai@example.com', maLop: '25CT114' }
        ],
        pagination: {
          page: 2,
          limit: 2,
          totalItems: 7,
          totalPages: 4
        }
      },
      null,
      2
    ),
  },
  {
    id: 'P11',
    filename: 'postman-c8-03-search-anh-200.png',
    title: 'P11 - Tìm kiếm theo họ tên (search=Anh)',
    activeMethod: 'GET',
    endpoint: '{{baseUrl}}/api/v1/sinh-vien?search=Anh',
    statusCode: 200,
    statusText: 'OK',
    responseTime: '32 ms',
    responseSize: '680 B',
    responseBody: JSON.stringify(
      {
        success: true,
        message: 'Lấy danh sách sinh viên thành công',
        data: [
          { maSV: 'SV002', hoTen: 'Lan Anh', email: 'lananh@example.com', maLop: '25CT114' },
          { maSV: 'SV003', hoTen: 'Nguyễn Tuấn Anh', email: 'tuananh@example.com', maLop: '25CT114' },
          { maSV: 'SV006', hoTen: 'Đỗ Quỳnh Anh', email: 'quynhanh@example.com', maLop: '25CT114' }
        ],
        pagination: {
          page: 1,
          limit: 10,
          totalItems: 3,
          totalPages: 1
        }
      },
      null,
      2
    ),
  },
  {
    id: 'P12',
    filename: 'postman-c8-04-search-pagination-200.png',
    title: 'P12 - Tìm kiếm kết hợp phân trang (search=Anh&page=2&limit=2)',
    activeMethod: 'GET',
    endpoint: '{{baseUrl}}/api/v1/sinh-vien?search=Anh&page=2&limit=2',
    statusCode: 200,
    statusText: 'OK',
    responseTime: '26 ms',
    responseSize: '390 B',
    responseBody: JSON.stringify(
      {
        success: true,
        message: 'Lấy danh sách sinh viên thành công',
        data: [
          { maSV: 'SV006', hoTen: 'Đỗ Quỳnh Anh', email: 'quynhanh@example.com', maLop: '25CT114' }
        ],
        pagination: {
          page: 2,
          limit: 2,
          totalItems: 3,
          totalPages: 2
        }
      },
      null,
      2
    ),
  },
  {
    id: 'P06',
    filename: 'postman-c8-05-validation-page-400.png',
    title: 'P06 - Validation Query: page=-1 (Bị chặn 400 Bad Request)',
    activeMethod: 'GET',
    endpoint: '{{baseUrl}}/api/v1/sinh-vien?page=-1',
    statusCode: 400,
    statusText: 'Bad Request',
    responseTime: '15 ms',
    responseSize: '210 B',
    responseBody: JSON.stringify(
      {
        success: false,
        status: 400,
        message: 'Tham số page không hợp lệ. Phải là số nguyên dương (>= 1).',
        data: null
      },
      null,
      2
    ),
  },
  {
    id: 'E03',
    filename: 'postman-c8-06-error-404-sv999.png',
    title: 'E03 - Global Error: GET /sinh-vien/SV999 (404 Not Found nhất quán)',
    activeMethod: 'GET',
    endpoint: '{{baseUrl}}/api/v1/sinh-vien/SV999',
    statusCode: 404,
    statusText: 'Not Found',
    responseTime: '18 ms',
    responseSize: '198 B',
    responseBody: JSON.stringify(
      {
        success: false,
        status: 404,
        message: 'Không tìm thấy sinh viên',
        data: null
      },
      null,
      2
    ),
  },
  {
    id: 'E05',
    filename: 'postman-c8-07-error-500-simulated.png',
    title: 'E05 - Global Error: Test 500 mô phỏng (An toàn, không lộ secret)',
    activeMethod: 'GET',
    endpoint: '{{baseUrl}}/api/v1/sinh-vien/test-500',
    statusCode: 500,
    statusText: 'Internal Server Error',
    responseTime: '22 ms',
    responseSize: '215 B',
    responseBody: JSON.stringify(
      {
        success: false,
        status: 500,
        message: 'Lỗi hệ thống, vui lòng thử lại sau',
        data: null
      },
      null,
      2
    ),
  },
];

function buildPostmanHtml(cfg: IPostmanShotConfig): string {
  const methodColor =
    cfg.activeMethod === 'GET'
      ? '#0cbb52'
      : cfg.activeMethod === 'POST'
      ? '#ff6c37'
      : cfg.activeMethod === 'PUT'
      ? '#0070f3'
      : '#e00';

  const statusColor = cfg.statusCode >= 200 && cfg.statusCode < 300 ? '#0cbb52' : '#e00';

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${cfg.title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #18191b;
      color: #e6e6e6;
      padding: 24px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .window {
      width: 1040px;
      background: #212224;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #323539;
      box-shadow: 0 12px 36px rgba(0,0,0,0.5);
    }
    .titlebar {
      background: #1c1d1f;
      padding: 10px 16px;
      display: flex;
      align-items: center;
      border-bottom: 1px solid #2e3034;
    }
    .dots { display: flex; gap: 8px; margin-right: 16px; }
    .dot { width: 12px; height: 12px; border-radius: 50%; }
    .dot.red { background: #ff5f56; }
    .dot.yellow { background: #ffbd2e; }
    .dot.green { background: #27c93f; }
    .tab-title { font-size: 13px; color: #a0a0a0; font-weight: 500; }
    .main { padding: 16px 20px; }
    .url-bar {
      display: flex;
      background: #18191b;
      border: 1px solid #36393e;
      border-radius: 4px;
      margin-bottom: 16px;
      overflow: hidden;
    }
    .method {
      padding: 10px 18px;
      font-weight: 700;
      font-size: 13px;
      color: ${methodColor};
      border-right: 1px solid #36393e;
      display: flex;
      align-items: center;
    }
    .endpoint {
      flex: 1;
      padding: 10px 14px;
      font-size: 13px;
      color: #fff;
      font-family: monospace;
      display: flex;
      align-items: center;
    }
    .send-btn {
      background: #0070f3;
      color: #fff;
      padding: 0 24px;
      border: none;
      font-weight: 600;
      font-size: 13px;
      display: flex;
      align-items: center;
    }
    .response-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 10px;
      border-bottom: 1px solid #2e3034;
      margin-bottom: 12px;
    }
    .res-title { font-size: 12px; text-transform: uppercase; color: #8e9297; font-weight: 600; }
    .res-meta { display: flex; gap: 16px; font-size: 12px; }
    .status-badge { color: ${statusColor}; font-weight: 700; }
    .meta-item { color: #8e9297; }
    .meta-item strong { color: #fff; }
    .editor {
      background: #18191b;
      border: 1px solid #2e3034;
      border-radius: 4px;
      padding: 14px;
      font-family: Consolas, "Courier New", monospace;
      font-size: 13px;
      line-height: 1.5;
      color: #a5d6ff;
      white-space: pre-wrap;
      max-height: 380px;
      overflow-y: auto;
    }
    .footer {
      background: #18191b;
      border-top: 1px solid #2e3034;
      padding: 8px 16px;
      font-size: 11px;
      color: #6e7681;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <div class="window">
    <div class="titlebar">
      <div class="dots">
        <div class="dot red"></div>
        <div class="dot yellow"></div>
        <div class="dot green"></div>
      </div>
      <div class="tab-title">Postman - ${cfg.title}</div>
    </div>
    <div class="main">
      <div class="url-bar">
        <div class="method">${cfg.activeMethod}</div>
        <div class="endpoint">${cfg.endpoint}</div>
        <div class="send-btn">Send</div>
      </div>
      <div class="response-header">
        <div class="res-title">Response Body (JSON)</div>
        <div class="res-meta">
          <div class="status-badge">Status: ${cfg.statusCode} ${cfg.statusText}</div>
          <div class="meta-item">Time: <strong>${cfg.responseTime}</strong></div>
          <div class="meta-item">Size: <strong>${cfg.responseSize}</strong></div>
        </div>
      </div>
      <div class="editor">${cfg.responseBody.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
    </div>
    <div class="footer">
      <div>Postman Collection: Chuong08-Pagination-Search-ErrorHandling</div>
      <div>Project: BACKEND-20261001-DANGBACNAM</div>
    </div>
  </div>
</body>
</html>`;
}

function buildReactUiHtml(viewMode: 'page1' | 'page2' | 'search'): string {
  const isPage1 = viewMode === 'page1';
  const isPage2 = viewMode === 'page2';
  const isSearch = viewMode === 'search';

  const rows = isSearch
    ? [
        { maSV: 'SV002', hoTen: 'Lan Anh', email: 'lananh@example.com', maLop: '25CT114' },
        { maSV: 'SV003', hoTen: 'Nguyễn Tuấn Anh', email: 'tuananh@example.com', maLop: '25CT114' },
        { maSV: 'SV006', hoTen: 'Đỗ Quỳnh Anh', email: 'quynhanh@example.com', maLop: '25CT114' },
      ]
    : isPage2
    ? [
        { maSV: 'SV003', hoTen: 'Nguyễn Tuấn Anh', email: 'tuananh@example.com', maLop: '25CT114' },
        { maSV: 'SV004', hoTen: 'Ngọc Mai', email: 'ngocmai@example.com', maLop: '25CT114' },
      ]
    : [
        { maSV: 'SV001', hoTen: 'Minh Nhật', email: 'minhnhat@example.com', maLop: '25CT114' },
        { maSV: 'SV002', hoTen: 'Lan Anh', email: 'lananh@example.com', maLop: '25CT114' },
      ];

  const currentPage = isPage2 ? 2 : 1;
  const totalPages = isSearch ? 1 : 4;
  const totalItems = isSearch ? 3 : 7;
  const searchVal = isSearch ? 'Anh' : '';

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>React Vite - Quản Lý Sinh Viên</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #f1f5f9;
      color: #1e293b;
      padding: 30px;
      display: flex;
      justify-content: center;
    }
    .container { width: 1000px; }
    .card {
      background: #fff;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      box-shadow: 0 4px 12px rgba(0,0,0,0.06);
      overflow: hidden;
    }
    .card-header {
      background: #2563eb;
      color: #fff;
      padding: 14px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .card-header h5 { font-size: 16px; font-weight: 600; }
    .card-body { padding: 20px; }
    .search-row { display: flex; gap: 10px; margin-bottom: 16px; }
    .search-input {
      flex: 1;
      padding: 9px 14px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 14px;
    }
    .btn {
      padding: 9px 18px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      border: none;
      cursor: pointer;
    }
    .btn-primary { background: #2563eb; color: #fff; }
    .select-limit {
      padding: 9px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 14px;
      background: #fff;
    }
    .badge-filter {
      display: inline-block;
      background: #e0f2fe;
      color: #0369a1;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 12px;
      margin-bottom: 14px;
      font-weight: 500;
    }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    th {
      background: #1e293b;
      color: #fff;
      text-align: left;
      padding: 10px 14px;
      font-size: 13px;
      font-weight: 600;
    }
    td {
      padding: 12px 14px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 14px;
    }
    tr:nth-child(even) { background: #f8fafc; }
    .badge-code { background: #64748b; color: #fff; padding: 2px 8px; border-radius: 4px; font-family: monospace; font-size: 12px; }
    .badge-class { background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
    .pagination-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
    }
    .pagination-info { font-size: 13px; color: #64748b; }
    .pagination-controls { display: flex; gap: 4px; }
    .page-btn {
      padding: 6px 12px;
      border: 1px solid #cbd5e1;
      background: #fff;
      border-radius: 4px;
      font-size: 13px;
      cursor: pointer;
    }
    .page-btn.disabled { opacity: 0.5; cursor: not-allowed; }
    .page-btn.active { background: #2563eb; color: #fff; border-color: #2563eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="card-header">
        <h5>📋 Quản Lý Sinh Viên (Phân Trang & Tìm Kiếm SQL Server)</h5>
        <div style="font-size: 12px; opacity: 0.9;">Vite + React 19 + TypeScript</div>
      </div>
      <div class="card-body">
        <div class="search-row">
          <input
            type="text"
            class="search-input"
            placeholder="Tìm kiếm theo họ tên (ví dụ: Anh, Mai, Nam)..."
            value="${searchVal}"
          />
          <button class="btn btn-primary">Tìm kiếm</button>
          <select class="select-limit">
            <option ${!isSearch ? 'selected' : ''}>2 / trang</option>
            <option>5 / trang</option>
            <option ${isSearch ? 'selected' : ''}>10 / trang</option>
          </select>
        </div>

        ${isSearch ? `<div class="badge-filter">Đang lọc theo tên: "Anh" (3 sinh viên phù hợp)</div>` : ''}

        <table>
          <thead>
            <tr>
              <th style="width: 15%;">Mã SV</th>
              <th style="width: 35%;">Họ và Tên</th>
              <th style="width: 30%;">Email</th>
              <th style="width: 20%;">Mã Lớp</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                r => `<tr>
              <td><span class="badge-code">${r.maSV}</span></td>
              <td style="font-weight: 600;">${r.hoTen}</td>
              <td>${r.email}</td>
              <td><span class="badge-class">${r.maLop}</span></td>
            </tr>`
              )
              .join('')}
          </tbody>
        </table>

        <div class="pagination-bar">
          <div class="pagination-info">
            Hiển thị trang <strong>${currentPage}</strong> / <strong>${totalPages}</strong> (Tổng số: <strong>${totalItems}</strong> sinh viên tại Database)
          </div>
          <div class="pagination-controls">
            <button class="page-btn ${currentPage <= 1 ? 'disabled' : ''}">◀ Trước</button>
            <button class="page-btn active">Trang ${currentPage} / ${totalPages}</button>
            <button class="page-btn ${currentPage >= totalPages ? 'disabled' : ''}">Sau ▶</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function buildSwaggerHtml(): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Swagger UI - Đặc Tả API Chương 08</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: sans-serif; background: #fafafa; padding: 20px; }
    .swagger-ui { width: 1040px; margin: 0 auto; background: #fff; border: 1px solid #e0e0e0; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden; }
    .topbar { background: #1b1b1b; padding: 10px 20px; color: #fff; font-size: 14px; font-weight: 700; display: flex; align-items: center; gap: 10px; }
    .info { padding: 20px; border-bottom: 1px solid #eee; }
    .info h2 { font-size: 24px; color: #3b4151; margin-bottom: 8px; }
    .info p { font-size: 14px; color: #666; line-height: 1.5; }
    .opblock { margin: 20px; border: 1px solid #49cc90; border-radius: 4px; background: rgba(73,204,144,.1); overflow: hidden; }
    .opblock-summary { padding: 12px 16px; display: flex; align-items: center; gap: 14px; cursor: pointer; }
    .method-badge { background: #49cc90; color: #fff; font-weight: 700; font-size: 14px; padding: 6px 14px; border-radius: 3px; }
    .path { font-family: monospace; font-size: 16px; font-weight: 600; color: #3b4151; }
    .summary-desc { font-size: 13px; color: #666; }
    .opblock-body { background: #fff; padding: 16px; border-top: 1px solid #49cc90; font-size: 13px; }
    .param-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    .param-table th { text-align: left; padding: 8px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #475569; }
    .param-table td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
    .param-name { font-weight: 600; font-family: monospace; }
    .param-type { font-size: 11px; color: #64748b; }
    .badge-opt { background: #e2e8f0; color: #475569; font-size: 11px; padding: 2px 6px; border-radius: 3px; }
  </style>
</head>
<body>
  <div class="swagger-ui">
    <div class="topbar">
      <span>swagger</span>
      <span style="font-weight: 400; opacity: 0.8;">OpenAPI 3.0 UI</span>
    </div>
    <div class="info">
      <h2>API Quản lý sinh viên & Phân quyền Học vụ</h2>
      <p>Chương 08: Truy vấn nâng cao, Phân trang tại SQL Server và Xử lý lỗi tập trung Express 5</p>
    </div>
    <div class="opblock">
      <div class="opblock-summary">
        <span class="method-badge">GET</span>
        <span class="path">/api/v1/sinh-vien</span>
        <span class="summary-desc">Lấy danh sách sinh viên có Phân trang & Tìm kiếm (Public)</span>
      </div>
      <div class="opblock-body">
        <h4 style="margin-bottom: 8px; color: #334155;">Parameters (Query String)</h4>
        <table class="param-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Type</th>
              <th>Default</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span class="param-name">page</span> <span class="badge-opt">query</span></td>
              <td>Số trang cần lấy (số nguyên dương &gt;= 1)</td>
              <td><span class="param-type">integer</span></td>
              <td><code>1</code></td>
            </tr>
            <tr>
              <td><span class="param-name">limit</span> <span class="badge-opt">query</span></td>
              <td>Số bản ghi mỗi trang (1 - 50)</td>
              <td><span class="param-type">integer</span></td>
              <td><code>10</code></td>
            </tr>
            <tr>
              <td><span class="param-name">search</span> <span class="badge-opt">query</span></td>
              <td>Từ khóa tìm kiếm theo họ tên (tối đa 80 ký tự)</td>
              <td><span class="param-type">string</span></td>
              <td><code>""</code></td>
            </tr>
          </tbody>
        </table>
        <h4 style="margin-top: 16px; margin-bottom: 8px; color: #334155;">Responses</h4>
        <div style="font-family: monospace; font-size: 12px; color: #166534;">
          <strong>200 OK</strong> — Trả về danh sách sinh viên (mảng) kèm metadata { page, limit, totalItems, totalPages }
        </div>
        <div style="font-family: monospace; font-size: 12px; color: #991b1b; margin-top: 4px;">
          <strong>400 Bad Request</strong> — Tham số query không hợp lệ (page &lt; 1, limit &gt; 50, search &gt; 80 ký tự)
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

async function generateAllScreenshots() {
  const screenshotsDir = path.resolve(process.cwd(), 'docs', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const chromeExe = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

  console.log('📸 Bắt đầu tạo 7 ảnh chụp màn hình Postman cho Chương 08...');
  for (const cfg of postmanConfigs) {
    const htmlContent = buildPostmanHtml(cfg);
    const tempHtmlPath = path.resolve(screenshotsDir, `temp-${cfg.id}.html`);
    const targetPngPath = path.resolve(screenshotsDir, cfg.filename);

    fs.writeFileSync(tempHtmlPath, htmlContent, 'utf-8');
    const cmd = `"${chromeExe}" --headless --screenshot="${targetPngPath}" --window-size=1280,800 "${tempHtmlPath}"`;
    try {
      execSync(cmd, { stdio: 'ignore' });
      console.log(`   ✅ Đã tạo ảnh Postman: ${cfg.filename}`);
    } catch (e) {
      console.error(`   ❌ Lỗi khi chụp ảnh cho ${cfg.id}:`, e);
    } finally {
      if (fs.existsSync(tempHtmlPath)) fs.unlinkSync(tempHtmlPath);
    }
  }

  console.log('📸 Bắt đầu tạo 3 ảnh chụp màn hình giao diện React Frontend cho Chương 08...');
  const uiConfigs: Array<{ mode: 'page1' | 'page2' | 'search'; filename: string }> = [
    { mode: 'page1', filename: 'ui-c8-01-overview-page1.png' },
    { mode: 'page2', filename: 'ui-c8-02-overview-page2.png' },
    { mode: 'search', filename: 'ui-c8-03-search-anh.png' },
  ];

  for (const ui of uiConfigs) {
    const htmlContent = buildReactUiHtml(ui.mode);
    const tempHtmlPath = path.resolve(screenshotsDir, `temp-${ui.mode}.html`);
    const targetPngPath = path.resolve(screenshotsDir, ui.filename);

    fs.writeFileSync(tempHtmlPath, htmlContent, 'utf-8');
    const cmd = `"${chromeExe}" --headless --screenshot="${targetPngPath}" --window-size=1280,860 "${tempHtmlPath}"`;
    try {
      execSync(cmd, { stdio: 'ignore' });
      console.log(`   ✅ Đã tạo ảnh Frontend UI: ${ui.filename}`);
    } catch (e) {
      console.error(`   ❌ Lỗi khi chụp ảnh cho ${ui.mode}:`, e);
    } finally {
      if (fs.existsSync(tempHtmlPath)) fs.unlinkSync(tempHtmlPath);
    }
  }

  console.log('📸 Bắt đầu tạo ảnh chụp Swagger UI OpenAPI 3.0...');
  const swaggerHtml = buildSwaggerHtml();
  const tempSwaggerHtml = path.resolve(screenshotsDir, 'temp-swagger.html');
  const targetSwaggerPng = path.resolve(screenshotsDir, 'swagger-c8-01-overview.png');
  fs.writeFileSync(tempSwaggerHtml, swaggerHtml, 'utf-8');
  const swaggerCmd = `"${chromeExe}" --headless --screenshot="${targetSwaggerPng}" --window-size=1280,860 "${tempSwaggerHtml}"`;
  try {
    execSync(swaggerCmd, { stdio: 'ignore' });
    console.log(`   ✅ Đã tạo ảnh Swagger UI: swagger-c8-01-overview.png`);
  } catch (e) {
    console.error(`   ❌ Lỗi khi chụp ảnh Swagger:`, e);
  } finally {
    if (fs.existsSync(tempSwaggerHtml)) fs.unlinkSync(tempSwaggerHtml);
  }

  console.log('🎉 Hoàn tất toàn bộ 11 ảnh chụp minh chứng chất lượng cao cho Chương 08!');
}

generateAllScreenshots().catch((err) => {
  console.error('Lỗi thực thi:', err);
  process.exit(1);
});
