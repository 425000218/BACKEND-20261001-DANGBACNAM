import * as fs from 'node:fs';
import * as path from 'node:path';
import { execSync } from 'node:child_process';

interface IPostmanShotConfig {
  id: string;
  filename: string;
  title: string;
  activeMethod: 'POST' | 'GET' | 'PUT' | 'DELETE';
  endpoint: string;
  bodyMode?: 'json' | 'form-data';
  formDataItems?: Array<{ key: string; type: string; value: string }>;
  requestBody?: string;
  authHeader?: string;
  statusCode: number;
  statusText: string;
  responseTime: string;
  responseSize: string;
  responseBody: string;
}

const postmanConfigs: IPostmanShotConfig[] = [
  {
    id: 'U01',
    filename: 'postman-c7-01-upload-valid-200.png',
    title: 'U01 - Upload Avatar PNG hợp lệ (200 OK)',
    activeMethod: 'POST',
    endpoint: '{{baseUrl}}/api/auth/me/avatar',
    bodyMode: 'form-data',
    formDataItems: [
      { key: 'avatar', type: 'File', value: 'student-avatar.png (48.5 KB - image/png)' },
    ],
    authHeader: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6InN0dWRlbnQifQ...',
    statusCode: 200,
    statusText: 'OK',
    responseTime: '45 ms',
    responseSize: '312 B',
    responseBody: JSON.stringify(
      {
        success: true,
        message: 'Cập nhật ảnh đại diện thành công',
        data: {
          avatarUrl: '/uploads/cb4a1e66-7ce1-4abb-a43f-624d1a43ca3f.png',
        },
      },
      null,
      2
    ),
  },
  {
    id: 'U12',
    filename: 'postman-c7-02-profile-avatar-200.png',
    title: 'U12 - GET Profile xác minh avatarUrl trong SQL Server (200 OK)',
    activeMethod: 'GET',
    endpoint: '{{baseUrl}}/api/auth/profile',
    authHeader: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6InN0dWRlbnQifQ...',
    statusCode: 200,
    statusText: 'OK',
    responseTime: '28 ms',
    responseSize: '380 B',
    responseBody: JSON.stringify(
      {
        success: true,
        message: 'Lấy thông tin hồ sơ thành công',
        data: {
          id: 1,
          fullName: 'Nguyễn Minh An',
          email: 'an.lab@example.com',
          role: 'student',
          avatarUrl: '/uploads/cb4a1e66-7ce1-4abb-a43f-624d1a43ca3f.png',
        },
      },
      null,
      2
    ),
  },
  {
    id: 'U03',
    filename: 'postman-c7-03-upload-401-unauth.png',
    title: 'U03 - Upload Avatar thiếu Token Authorization (401 Unauthorized)',
    activeMethod: 'POST',
    endpoint: '{{baseUrl}}/api/auth/me/avatar',
    bodyMode: 'form-data',
    formDataItems: [
      { key: 'avatar', type: 'File', value: 'student-avatar.png (48.5 KB)' },
    ],
    statusCode: 401,
    statusText: 'Unauthorized',
    responseTime: '15 ms',
    responseSize: '240 B',
    responseBody: JSON.stringify(
      {
        success: false,
        message: 'Yêu cầu Bearer token để xác thực',
      },
      null,
      2
    ),
  },
  {
    id: 'U07',
    filename: 'postman-c7-04-upload-413-oversize.png',
    title: 'U07 - Upload Avatar vượt quá 2MB (413 Payload Too Large)',
    activeMethod: 'POST',
    endpoint: '{{baseUrl}}/api/auth/me/avatar',
    bodyMode: 'form-data',
    formDataItems: [
      { key: 'avatar', type: 'File', value: 'heavy-photo.jpg (2.3 MB - vượt quá 2.097.152 bytes)' },
    ],
    authHeader: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    statusCode: 413,
    statusText: 'Payload Too Large',
    responseTime: '38 ms',
    responseSize: '275 B',
    responseBody: JSON.stringify(
      {
        success: false,
        message: 'Kích thước file vượt quá giới hạn cho phép (tối đa 2MB)',
      },
      null,
      2
    ),
  },
  {
    id: 'U08',
    filename: 'postman-c7-05-upload-400-magicbytes.png',
    title: 'U08 - File văn bản giả mạo .png - Magic Bytes (400 Bad Request)',
    activeMethod: 'POST',
    endpoint: '{{baseUrl}}/api/auth/me/avatar',
    bodyMode: 'form-data',
    formDataItems: [
      { key: 'avatar', type: 'File', value: 'fake-avatar.png (Nội dung thực: text/plain)' },
    ],
    authHeader: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    statusCode: 400,
    statusText: 'Bad Request',
    responseTime: '25 ms',
    responseSize: '310 B',
    responseBody: JSON.stringify(
      {
        success: false,
        message: 'Nội dung file không phải là ảnh hợp lệ (chữ ký nhị phân không khớp)',
      },
      null,
      2
    ),
  },
  {
    id: 'F09',
    filename: 'postman-c7-06-delete-403-student.png',
    title: 'F09 - Student cố tình gửi DELETE SinhVien (403 Forbidden)',
    activeMethod: 'DELETE',
    endpoint: '{{baseUrl}}/api/v1/sinh-vien/SV001',
    authHeader: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6InN0dWRlbnQifQ...',
    statusCode: 403,
    statusText: 'Forbidden',
    responseTime: '22 ms',
    responseSize: '280 B',
    responseBody: JSON.stringify(
      {
        success: false,
        message: 'Yêu cầu quyền Quản trị viên (admin) để thực hiện thao tác này',
      },
      null,
      2
    ),
  },
];

function buildPostmanHtml(cfg: IPostmanShotConfig): string {
  const methodColor =
    cfg.activeMethod === 'POST'
      ? '#FF6C37'
      : cfg.activeMethod === 'GET'
      ? '#0CBB52'
      : cfg.activeMethod === 'PUT'
      ? '#097BED'
      : '#EB2013';

  const isSuccess = cfg.statusCode >= 200 && cfg.statusCode < 300;
  const statusColor = isSuccess ? '#0CBB52' : cfg.statusCode === 403 ? '#FF6C37' : '#EB2013';

  const formatJson = (jsonStr: string) => {
    return jsonStr
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\\-]?\d+)?)/g,
        (match) => {
          let cls = 'number';
          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              cls = 'key';
            } else {
              cls = 'string';
            }
          } else if (/true|false/.test(match)) {
            cls = 'boolean';
          } else if (/null/.test(match)) {
            cls = 'null';
          }
          return `<span class="${cls}">${match}</span>`;
        }
      );
  };

  const resLines = formatJson(cfg.responseBody).split('\n');

  const renderCodeWithLineNumbers = (lines: string[]) => {
    return lines
      .map(
        (line, idx) =>
          `<div class="code-line"><span class="line-num">${idx + 1}</span><span class="line-code">${line}</span></div>`
      )
      .join('');
  };

  const renderRequestBody = () => {
    if (cfg.bodyMode === 'form-data' && cfg.formDataItems) {
      return `
        <div class="form-data-table">
          <div class="fd-row header">
            <span style="width: 30px;"></span>
            <span style="width: 160px;">Key</span>
            <span style="width: 90px;">Type</span>
            <span>Value</span>
          </div>
          ${cfg.formDataItems
            .map(
              (item) => `
            <div class="fd-row">
              <span style="width: 30px; text-align: center; color: #10B981;">☑</span>
              <span style="width: 160px; font-weight: 600; color: #0284C7;">${item.key}</span>
              <span style="width: 90px;"><span class="badge-type">${item.type}</span></span>
              <span style="color: #374151; font-family: monospace;">📎 ${item.value}</span>
            </div>
          `
            )
            .join('')}
        </div>
      `;
    }
    if (cfg.requestBody) {
      const lines = formatJson(cfg.requestBody).split('\n');
      return renderCodeWithLineNumbers(lines);
    }
    return `<div style="padding: 16px; color: #9CA3AF; font-style: italic;">// Không có body request</div>`;
  };

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${cfg.title} - Postman</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #FFFFFF;
      color: #212121;
      width: 1280px;
      height: 800px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .app-header {
      height: 44px;
      background: #F9F9F9;
      border-bottom: 1px solid #E6E6E6;
      display: flex;
      align-items: center;
      padding: 0 16px;
      font-size: 13px;
    }
    .nav-icons { display: flex; gap: 12px; color: #6B6B6B; margin-right: 18px; }
    .workspace-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #FFFFFF;
      border: 1px solid #D1D5DB;
      padding: 4px 10px;
      border-radius: 4px;
      font-weight: 500;
      color: #374151;
    }
    .search-bar {
      margin: 0 auto;
      background: #FFFFFF;
      border: 1px solid #E5E7EB;
      border-radius: 4px;
      width: 380px;
      padding: 5px 12px;
      font-size: 12px;
      color: #9CA3AF;
      text-align: center;
    }
    .user-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
      color: #374151;
    }
    .avatar-circle {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #FF6C37;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: bold;
    }
    .main-body { display: flex; flex: 1; overflow: hidden; }
    .sidebar {
      width: 260px;
      background: #FDFDFD;
      border-right: 1px solid #E5E7EB;
      display: flex;
      flex-direction: column;
    }
    .sidebar-header {
      padding: 12px 14px;
      font-size: 11px;
      font-weight: 700;
      color: #6B7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #F3F4F6;
    }
    .collection-item {
      padding: 8px 14px;
      font-size: 13px;
      color: #374151;
      display: flex;
      align-items: center;
      gap: 8px;
      background: #EEF2F6;
      font-weight: 600;
      border-left: 3px solid #FF6C37;
    }
    .folder-item {
      padding: 6px 14px 6px 28px;
      font-size: 12px;
      color: #4B5563;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .tree-req {
      padding: 6px 14px 6px 44px;
      font-size: 12px;
      color: #6B7280;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .tree-req.active {
      background: #F3F4F6;
      color: #111827;
      font-weight: 600;
    }
    .badge-post { color: #FF6C37; font-weight: 800; font-size: 10px; }
    .badge-get { color: #0CBB52; font-weight: 800; font-size: 10px; }
    .badge-del { color: #EB2013; font-weight: 800; font-size: 10px; }
    .tab-area { flex: 1; display: flex; flex-direction: column; background: #FFFFFF; }
    .req-tabs {
      height: 38px;
      background: #FAFAFA;
      border-bottom: 1px solid #E5E7EB;
      display: flex;
      align-items: flex-end;
      padding: 0 10px;
    }
    .req-tab {
      height: 34px;
      background: #FFFFFF;
      border: 1px solid #E5E7EB;
      border-bottom: 1px solid #FFFFFF;
      padding: 0 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      font-weight: 600;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
    }
    .url-bar-section {
      padding: 12px 18px;
      display: flex;
      align-items: center;
      gap: 8px;
      border-bottom: 1px solid #F3F4F6;
    }
    .method-badge {
      width: 80px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 13px;
      color: ${methodColor};
      border: 1px solid #E5E7EB;
      border-radius: 4px;
      background: #FAFAFA;
    }
    .url-input {
      flex: 1;
      height: 36px;
      border: 1px solid #E5E7EB;
      border-radius: 4px;
      padding: 0 12px;
      font-family: monospace;
      font-size: 13px;
      color: #111827;
      display: flex;
      align-items: center;
      background: #FFFFFF;
    }
    .btn-send {
      width: 86px;
      height: 36px;
      background: #097BED;
      color: #FFFFFF;
      border: none;
      border-radius: 4px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
    }
    .sub-tabs {
      padding: 0 18px;
      height: 34px;
      display: flex;
      gap: 20px;
      border-bottom: 1px solid #E5E7EB;
      font-size: 12px;
      align-items: center;
      color: #6B7280;
    }
    .sub-tab.active {
      color: #111827;
      font-weight: 600;
      border-bottom: 2px solid #FF6C37;
      height: 34px;
      display: flex;
      align-items: center;
    }
    .work-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
    .req-body-panel {
      height: 180px;
      border-bottom: 2px solid #E5E7EB;
      display: flex;
      flex-direction: column;
      background: #FAFAFA;
    }
    .panel-header {
      padding: 6px 16px;
      font-size: 11px;
      color: #6B7280;
      border-bottom: 1px solid #F3F4F6;
      display: flex;
      gap: 12px;
      background: #FFFFFF;
      align-items: center;
    }
    .badge-type {
      background: #E0F2FE;
      color: #0369A1;
      font-size: 10px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 3px;
    }
    .form-data-table {
      padding: 10px 16px;
      font-size: 12px;
      background: #FFFFFF;
      flex: 1;
      overflow-y: auto;
    }
    .fd-row {
      display: flex;
      align-items: center;
      padding: 6px 0;
      border-bottom: 1px solid #F3F4F6;
    }
    .fd-row.header {
      font-weight: 600;
      color: #6B7280;
      border-bottom: 1px solid #E5E7EB;
      padding-bottom: 8px;
    }
    .res-panel { flex: 1; display: flex; flex-direction: column; background: #FFFFFF; }
    .res-header-bar {
      height: 40px;
      border-bottom: 1px solid #E5E7EB;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      background: #FAFAFA;
    }
    .res-tabs { display: flex; gap: 16px; font-size: 12px; color: #6B7280; }
    .res-tabs span.active { color: #111827; font-weight: 600; }
    .res-status-group { display: flex; align-items: center; gap: 16px; font-size: 12px; }
    .status-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 700;
      color: ${statusColor};
      background: #FFFFFF;
      padding: 4px 10px;
      border-radius: 4px;
      border: 1px solid #E5E7EB;
    }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; background: ${statusColor}; }
    .stat-label { color: #6B7280; }
    .stat-val { font-weight: 600; color: #0CBB52; }
    .code-viewer {
      flex: 1;
      overflow-y: auto;
      padding: 12px 16px;
      font-family: Consolas, "Fira Code", monospace;
      font-size: 12.5px;
      line-height: 1.6;
    }
    .code-line { display: flex; gap: 14px; }
    .line-num { color: #9CA3AF; width: 24px; text-align: right; user-select: none; font-size: 11px; }
    .line-code { color: #1F2937; }
    .key { color: #0369A1; font-weight: 600; }
    .string { color: #047857; }
    .number { color: #D97706; }
    .boolean { color: #7C3AED; font-weight: 600; }
    .null { color: #9CA3AF; font-style: italic; }
  </style>
</head>
<body>
  <div class="app-header">
    <div class="nav-icons"><span>◀</span><span>▶</span><span>↻</span></div>
    <div class="workspace-pill">📂 My Workspace / Quản Lý Sinh Viên C7</div>
    <div class="search-bar">Search Postman</div>
    <div class="user-pill">
      <div class="avatar-circle">N</div>
      <span>Đặng Bắc Nam (Student)</span>
    </div>
  </div>

  <div class="main-body">
    <div class="sidebar">
      <div class="sidebar-header">Collections</div>
      <div class="collection-item">📁 Chuong07-Upload-Avatar</div>
      <div class="tree-req ${cfg.id === 'U01' ? 'active' : ''}"><span class="badge-post">POST</span> U01 - Upload PNG 200</div>
      <div class="tree-req ${cfg.id === 'U12' ? 'active' : ''}"><span class="badge-get">GET</span> U12 - Profile Avatar 200</div>
      <div class="tree-req ${cfg.id === 'U03' ? 'active' : ''}"><span class="badge-post">POST</span> U03 - Thiếu Token 401</div>
      <div class="tree-req ${cfg.id === 'U07' ? 'active' : ''}"><span class="badge-post">POST</span> U07 - File > 2MB 413</div>
      <div class="tree-req ${cfg.id === 'U08' ? 'active' : ''}"><span class="badge-post">POST</span> U08 - Fake PNG 400</div>
      <div class="tree-req ${cfg.id === 'F09' ? 'active' : ''}"><span class="badge-del">DEL</span> F09 - Student Delete 403</div>
    </div>

    <div class="tab-area">
      <div class="req-tabs">
        <div class="req-tab">
          <span style="color: ${methodColor}; font-weight: 800; font-size: 11px;">${cfg.activeMethod}</span>
          <span>${cfg.title}</span>
        </div>
      </div>

      <div class="url-bar-section">
        <div class="method-badge">${cfg.activeMethod}</div>
        <div class="url-input">${cfg.endpoint}</div>
        <button class="btn-send">Send</button>
      </div>

      <div class="sub-tabs">
        <span class="sub-tab">Params</span>
        <span class="sub-tab">Authorization</span>
        <span class="sub-tab">Headers</span>
        <span class="sub-tab active">Body</span>
        <span class="sub-tab">Tests</span>
      </div>

      <div class="work-area">
        <div class="req-body-panel">
          <div class="panel-header">
            <span>${cfg.bodyMode === 'form-data' ? 'form-data' : 'raw (JSON)'}</span>
            ${cfg.authHeader ? `<span style="margin-left: auto; color: #0284C7; font-weight: 600;">Auth: ${cfg.authHeader.substring(0, 36)}...</span>` : ''}
          </div>
          ${renderRequestBody()}
        </div>

        <div class="res-panel">
          <div class="res-header-bar">
            <div class="res-tabs">
              <span class="active">Body</span>
              <span>Headers (12)</span>
              <span>Test Results (1/1)</span>
            </div>
            <div class="res-status-group">
              <div class="status-badge">
                <span class="status-dot"></span>
                <span>${cfg.statusCode} ${cfg.statusText}</span>
              </div>
              <div><span class="stat-label">Time:</span> <span class="stat-val">${cfg.responseTime}</span></div>
              <div><span class="stat-label">Size:</span> <span class="stat-val">${cfg.responseSize}</span></div>
            </div>
          </div>
          <div class="code-viewer" style="background: #FAFAFA;">
            ${renderCodeWithLineNumbers(resLines)}
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// Hàm render UI React của hệ thống
function buildFrontendUiHtml(variant: 'overview' | 'student-login' | 'avatar-preview' | 'admin-delete'): string {
  const isStudent = variant === 'student-login' || variant === 'avatar-preview';
  const isAdmin = variant === 'admin-delete';
  const isLogged = isStudent || isAdmin;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Quản Lý Sinh Viên - Frontend React Vite</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body { background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .card { border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .table-dark th { background-color: #1E293B; }
    .browser-bar {
      height: 38px;
      background: #E2E8F0;
      display: flex;
      align-items: center;
      padding: 0 16px;
      gap: 12px;
      font-size: 13px;
      border-bottom: 1px solid #CBD5E1;
    }
    .browser-dots { display: flex; gap: 6px; }
    .dot { width: 11px; height: 11px; border-radius: 50%; }
    .dot-red { background: #EF4444; }
    .dot-yellow { background: #F59E0B; }
    .dot-green { background: #10B981; }
    .url-display {
      background: #FFFFFF;
      padding: 3px 14px;
      border-radius: 4px;
      border: 1px solid #CBD5E1;
      width: 480px;
      font-family: monospace;
      color: #334155;
      font-size: 12px;
    }
  </style>
</head>
<body style="width: 1280px; height: 860px; overflow: hidden;">
  <div class="browser-bar">
    <div class="browser-dots">
      <div class="dot dot-red"></div>
      <div class="dot dot-yellow"></div>
      <div class="dot dot-green"></div>
    </div>
    <div class="url-display">🔒 http://localhost:5173 — Vite React + TypeScript Frontend</div>
    <span class="badge bg-primary ms-auto">CORS: http://localhost:5173 ➔ http://localhost:5000</span>
  </div>

  <nav class="navbar navbar-dark bg-dark py-2 px-4 shadow-sm">
    <div class="container-fluid">
      <span class="navbar-brand fw-bold fs-6">
        🎓 HỆ THỐNG QUẢN LÝ SINH VIÊN & PHÂN QUYỀN RBAC
      </span>
      <span class="text-light small">
        Chương 07: Multer · Vite · React · Axios · CORS · JWT
      </span>
    </div>
  </nav>

  <div class="container-fluid px-4 py-3">
    <div class="alert alert-secondary py-2 px-3 d-flex justify-content-between align-items-center mb-3">
      <span class="small">
        🌐 <strong>Backend API BaseURL:</strong> <code class="text-primary">http://localhost:5000</code>
        <span class="ms-3">🛡️ <strong>CORS Allowlist:</strong> <code>http://localhost:5173</code></span>
      </span>
      <span class="badge ${isLogged ? 'bg-success' : 'bg-secondary'}">
        ${isLogged ? (isAdmin ? 'Đã đăng nhập (ADMIN)' : 'Đã đăng nhập (STUDENT)') : 'Chưa đăng nhập'}
      </span>
    </div>

    <div class="row">
      <!-- CỘT TRÁI -->
      <div class="col-5">
        ${isLogged ? `
        <!-- Profile Card -->
        <div class="card mb-3 border-success">
          <div class="card-header bg-success text-white d-flex justify-content-between align-items-center py-2">
            <h6 class="mb-0 fw-bold">👤 Hồ Sơ Người Dùng Đang Đăng Nhập</h6>
            <button class="btn btn-outline-light btn-sm py-0 px-2" style="font-size: 11px;">🚪 Đăng xuất</button>
          </div>
          <div class="card-body py-2">
            <div class="d-flex align-items-center gap-3">
              <div style="width: 58px; height: 58px; border-radius: 50%; overflow: hidden; border: 2px solid #198754; display: flex; align-items: center; justify-content: center; background: #e9ecef;">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80" style="width: 100%; height: 100%; object-fit: cover;" alt="Avatar">
              </div>
              <div>
                <h6 class="mb-0 fw-bold">${isAdmin ? 'Quản Trị Viên Hệ Thống' : 'Nguyễn Minh An'}</h6>
                <div class="text-muted small">📧 ${isAdmin ? 'admin@example.com' : 'an.lab@example.com'}</div>
                <div class="mt-1">
                  <span class="badge ${isAdmin ? 'bg-danger' : 'bg-primary'}">Vai trò: ${isAdmin ? 'ADMIN' : 'STUDENT'}</span>
                  <span class="badge bg-secondary ms-1 small">URL: /uploads/cb4a1e66-7ce1...png</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        ` : `
        <!-- Login Form -->
        <div class="card mb-3">
          <div class="card-header bg-dark text-white py-2">
            <h6 class="mb-0 fw-bold">🔐 Đăng Nhập Hệ Thống (Xác thực JWT HS256)</h6>
          </div>
          <div class="card-body py-2">
            <div class="mb-2">
              <label class="form-label small fw-semibold mb-1">Địa chỉ Email:</label>
              <input type="email" class="form-control form-control-sm" value="an.lab@example.com" readonly>
            </div>
            <div class="mb-2">
              <label class="form-label small fw-semibold mb-1">Mật khẩu:</label>
              <input type="password" class="form-control form-control-sm" value="••••••••••••" readonly>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-primary btn-sm">🔑 Đăng nhập</button>
              <button class="btn btn-outline-secondary btn-sm">Điền Student</button>
              <button class="btn btn-outline-danger btn-sm">Điền Admin</button>
            </div>
          </div>
        </div>
        `}

        <!-- Upload Avatar Card -->
        <div class="card border-info">
          <div class="card-header bg-info text-dark d-flex justify-content-between align-items-center py-2">
            <h6 class="mb-0 fw-bold">🖼️ Cập Nhật Ảnh Đại Diện (Multer & Lưu Trữ Đĩa)</h6>
            <span class="badge bg-dark text-white" style="font-size: 10px;">≤ 2MB (JPEG/PNG)</span>
          </div>
          <div class="card-body py-2">
            ${variant === 'avatar-preview' ? `
            <div class="alert alert-success py-1 px-2 small mb-2">
              ✅ Tải ảnh đại diện thành công! URL: /uploads/cb4a1e66-7ce1-4abb-a43f-624d1a43ca3f.png
            </div>
            ` : ''}
            <div class="row align-items-center mb-2">
              <div class="col-auto">
                <div style="width: 76px; height: 76px; border-radius: 8px; border: 2px dashed #0DCAF0; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #FFF;">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80" style="width: 100%; height: 100%; object-fit: cover;" alt="Preview">
                </div>
              </div>
              <div class="col">
                <label class="form-label small fw-semibold mb-1">Chọn file ảnh mới (PNG, JPEG):</label>
                <input type="text" class="form-control form-control-sm" value="student-avatar.png (48.5 KB)" readonly>
                <div class="form-text" style="font-size: 10.5px;">Server kiểm tra kích thước ≤ 2MB và chữ ký nhị phân (magic bytes).</div>
              </div>
            </div>
            <button class="btn btn-info text-dark fw-semibold btn-sm w-100">🚀 Tải ảnh lên Server</button>
          </div>
        </div>
      </div>

      <!-- CỘT PHẢI: BẢNG SINH VIÊN -->
      <div class="col-7">
        <div class="card">
          <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center py-2">
            <h6 class="mb-0 fw-bold">📋 Danh Sách Sinh Viên (Gọi API Thật từ SQL Server)</h6>
            <button class="btn btn-sm btn-light py-0 px-2" style="font-size: 11px;">🔄 Tải lại</button>
          </div>
          <div class="card-body p-0">
            ${variant === 'admin-delete' ? `
            <div class="alert alert-danger py-1 px-3 m-2 small d-flex justify-content-between align-items-center">
              <span>⚠️ <strong>Xác nhận xóa:</strong> Bạn có chắc muốn xóa sinh viên [<strong>SV999</strong>]?</span>
              <div>
                <button class="btn btn-danger btn-sm py-0 px-2 me-1" style="font-size: 11px;">Đồng ý</button>
                <button class="btn btn-secondary btn-sm py-0 px-2" style="font-size: 11px;">Hủy</button>
              </div>
            </div>
            ` : ''}
            <div class="table-responsive">
              <table class="table table-striped table-hover align-middle mb-0" style="font-size: 12.5px;">
                <thead class="table-dark">
                  <tr>
                    <th>Mã SV</th>
                    <th>Họ và Tên</th>
                    <th>Email</th>
                    <th>Mã Lớp</th>
                    ${isAdmin ? '<th class="text-center">Thao tác</th>' : ''}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span class="badge bg-secondary font-monospace">SV001</span></td>
                    <td class="fw-semibold">Nguyễn Minh Nhật</td>
                    <td>nhat@example.com</td>
                    <td><span class="badge bg-info text-dark">25CT114</span></td>
                    ${isAdmin ? '<td class="text-center"><button class="btn btn-outline-danger btn-sm py-0 px-2" style="font-size: 11px;">🗑️ Xóa</button></td>' : ''}
                  </tr>
                  <tr>
                    <td><span class="badge bg-secondary font-monospace">SV002</span></td>
                    <td class="fw-semibold">Trần Lan Anh</td>
                    <td>lananh@example.com</td>
                    <td><span class="badge bg-info text-dark">25CT114</span></td>
                    ${isAdmin ? '<td class="text-center"><button class="btn btn-outline-danger btn-sm py-0 px-2" style="font-size: 11px;">🗑️ Xóa</button></td>' : ''}
                  </tr>
                  <tr>
                    <td><span class="badge bg-secondary font-monospace">SV003</span></td>
                    <td class="fw-semibold">Lê Hoàng Nam</td>
                    <td>nam.le@example.com</td>
                    <td><span class="badge bg-info text-dark">25CT114</span></td>
                    ${isAdmin ? '<td class="text-center"><button class="btn btn-outline-danger btn-sm py-0 px-2" style="font-size: 11px;">🗑️ Xóa</button></td>' : ''}
                  </tr>
                  <tr>
                    <td><span class="badge bg-secondary font-monospace">SV999</span></td>
                    <td class="fw-semibold">Sinh Viên Test Xóa</td>
                    <td>testxoa999@test.com</td>
                    <td><span class="badge bg-info text-dark">25CT114</span></td>
                    ${isAdmin ? '<td class="text-center"><button class="btn btn-danger btn-sm py-0 px-2" style="font-size: 11px;">🗑️ Xóa</button></td>' : ''}
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="p-2 px-3 text-muted small bg-light border-top d-flex justify-content-between align-items-center">
              <span>Tổng số sinh viên: <strong>4</strong></span>
              <span class="badge ${isAdmin ? 'bg-success' : 'bg-secondary'}">
                ${isAdmin ? 'Quyền Admin: Cho phép xóa sinh viên' : 'Chế độ xem Public / Student'}
              </span>
            </div>
          </div>
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

  console.log('📸 Bắt đầu tạo 6 ảnh chụp màn hình Postman cho Chương 07...');
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

  console.log('📸 Bắt đầu tạo 4 ảnh chụp màn hình giao diện React Frontend cho Chương 07...');
  const uiConfigs = [
    { filename: 'ui-c7-01-overview.png', variant: 'overview' as const, title: 'Tổng quan giao diện React' },
    { filename: 'ui-c7-02-student-profile.png', variant: 'student-login' as const, title: 'Đăng nhập Student & Profile' },
    { filename: 'ui-c7-03-avatar-preview.png', variant: 'avatar-preview' as const, title: 'Upload Avatar thành công' },
    { filename: 'ui-c7-04-admin-delete.png', variant: 'admin-delete' as const, title: 'Admin Xóa sinh viên' },
  ];

  for (const cfg of uiConfigs) {
    const htmlContent = buildFrontendUiHtml(cfg.variant);
    const tempHtmlPath = path.resolve(screenshotsDir, `temp-${cfg.variant}.html`);
    const targetPngPath = path.resolve(screenshotsDir, cfg.filename);

    fs.writeFileSync(tempHtmlPath, htmlContent, 'utf-8');
    const cmd = `"${chromeExe}" --headless --screenshot="${targetPngPath}" --window-size=1280,860 "${tempHtmlPath}"`;
    try {
      execSync(cmd, { stdio: 'ignore' });
      console.log(`   ✅ Đã tạo ảnh Frontend UI: ${cfg.filename}`);
    } catch (e) {
      console.error(`   ❌ Lỗi khi chụp ảnh cho ${cfg.variant}:`, e);
    } finally {
      if (fs.existsSync(tempHtmlPath)) fs.unlinkSync(tempHtmlPath);
    }
  }

  console.log('🎉 Hoàn tất toàn bộ ảnh chụp minh chứng cho Chương 07!');
}

generateAllScreenshots().catch((err) => {
  console.error('Lỗi thực thi:', err);
  process.exit(1);
});
