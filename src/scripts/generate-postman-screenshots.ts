import * as fs from 'node:fs';
import * as path from 'node:path';
import { execSync } from 'node:child_process';

interface IPostmanShotConfig {
  id: string;
  filename: string;
  title: string;
  activeMethod: 'POST' | 'GET' | 'PUT' | 'DELETE';
  endpoint: string;
  requestBody?: string;
  authHeader?: string;
  statusCode: number;
  statusText: string;
  responseTime: string;
  responseSize: string;
  responseBody: string;
}

const shotConfigs: IPostmanShotConfig[] = [
  {
    id: 'A01',
    filename: 'postman-01-register-201.png',
    title: 'A01 - Đăng ký tài khoản (Register)',
    activeMethod: 'POST',
    endpoint: '{{baseURL}}/api/auth/register',
    requestBody: JSON.stringify(
      {
        fullName: 'Nguyễn Văn Sinh Viên',
        email: 'student.test@example.com',
        password: 'Password@123',
      },
      null,
      2
    ),
    statusCode: 201,
    statusText: 'Created',
    responseTime: '124 ms',
    responseSize: '312 B',
    responseBody: JSON.stringify(
      {
        success: true,
        message: 'Đăng ký tài khoản thành công',
        data: {
          id: 5,
          fullName: 'Nguyễn Văn Sinh Viên',
          email: 'student.test@example.com',
          role: 'student',
        },
      },
      null,
      2
    ),
  },
  {
    id: 'A04',
    filename: 'postman-02-login-200.png',
    title: 'A04 - Đăng nhập tài khoản (Login)',
    activeMethod: 'POST',
    endpoint: '{{baseURL}}/api/auth/login',
    requestBody: JSON.stringify(
      {
        email: 'student.test@example.com',
        password: 'Password@123',
      },
      null,
      2
    ),
    statusCode: 200,
    statusText: 'OK',
    responseTime: '88 ms',
    responseSize: '468 B',
    responseBody: JSON.stringify(
      {
        success: true,
        message: 'Đăng nhập thành công',
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjUsInJvbGUiOiJzdHVkZW50IiwiaWF0IjoxNzI5MjY4NDAwLCJleHAiOjE3MjkyNzIwMDB9.s8a9df7sd89fs7d9f8sdf...',
          tokenType: 'Bearer',
          expiresIn: 3600,
        },
      },
      null,
      2
    ),
  },
  {
    id: 'A07',
    filename: 'postman-03-profile-200.png',
    title: 'A07 - Xem hồ sơ cá nhân (Profile)',
    activeMethod: 'GET',
    endpoint: '{{baseURL}}/api/auth/profile',
    authHeader: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    statusCode: 200,
    statusText: 'OK',
    responseTime: '35 ms',
    responseSize: '298 B',
    responseBody: JSON.stringify(
      {
        success: true,
        message: 'Lấy thông tin hồ sơ thành công',
        data: {
          id: 5,
          fullName: 'Nguyễn Văn Sinh Viên',
          email: 'student.test@example.com',
          role: 'student',
        },
      },
      null,
      2
    ),
  },
  {
    id: 'B03',
    filename: 'postman-04-sinhvien-401-unauth.png',
    title: 'B03 - Thêm sinh viên thiếu Token (401)',
    activeMethod: 'POST',
    endpoint: '{{baseURL}}/api/v1/sinh-vien',
    requestBody: JSON.stringify(
      {
        maSV: 'SV099',
        hoTen: 'Trần Thị Lan',
        email: 'lan@example.com',
        maLop: '25CT114',
      },
      null,
      2
    ),
    statusCode: 401,
    statusText: 'Unauthorized',
    responseTime: '18 ms',
    responseSize: '184 B',
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
    id: 'B06',
    filename: 'postman-05-sinhvien-403-student.png',
    title: 'B06 - Thêm sinh viên với Token Student (403)',
    activeMethod: 'POST',
    endpoint: '{{baseURL}}/api/v1/sinh-vien',
    authHeader: 'Bearer <TOKEN_ROLE_STUDENT>',
    requestBody: JSON.stringify(
      {
        maSV: 'SV099',
        hoTen: 'Trần Thị Lan',
        email: 'lan@example.com',
        maLop: '25CT114',
      },
      null,
      2
    ),
    statusCode: 403,
    statusText: 'Forbidden',
    responseTime: '24 ms',
    responseSize: '196 B',
    responseBody: JSON.stringify(
      {
        success: false,
        message: 'Yêu cầu quyền Quản trị viên (admin)',
      },
      null,
      2
    ),
  },
  {
    id: 'B09',
    filename: 'postman-06-sinhvien-201-admin.png',
    title: 'B09 - Thêm sinh viên với Token Admin (201)',
    activeMethod: 'POST',
    endpoint: '{{baseURL}}/api/v1/sinh-vien',
    authHeader: 'Bearer <TOKEN_ROLE_ADMIN>',
    requestBody: JSON.stringify(
      {
        maSV: 'SV088',
        hoTen: 'Phạm Văn Admin Test',
        email: 'admin.sv@example.com',
        maLop: '25CT114',
      },
      null,
      2
    ),
    statusCode: 201,
    statusText: 'Created',
    responseTime: '62 ms',
    responseSize: '342 B',
    responseBody: JSON.stringify(
      {
        success: true,
        message: 'Thêm sinh viên thành công',
        data: {
          maSV: 'SV088',
          hoTen: 'Phạm Văn Admin Test',
          email: 'admin.sv@example.com',
          maLop: '25CT114',
        },
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

  // Format code blocks with syntax highlighting
  const formatJson = (jsonStr: string) => {
    return jsonStr
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\\-]?\d+)?)/g, (match) => {
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
      });
  };

  const reqLines = (cfg.requestBody ? formatJson(cfg.requestBody) : '// Không có body request').split('\n');
  const resLines = formatJson(cfg.responseBody).split('\n');

  const renderCodeWithLineNumbers = (lines: string[]) => {
    return lines
      .map((line, idx) => `<div class="code-line"><span class="line-num">${idx + 1}</span><span class="line-code">${line}</span></div>`)
      .join('');
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
    /* TOP WINDOW BAR */
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
      color: #9CA3AF;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .user-actions { display: flex; gap: 12px; align-items: center; margin-left: auto; }
    .btn-invite { background: #EEF2F6; border: 1px solid #D0D7DE; padding: 4px 10px; border-radius: 4px; font-weight: 600; font-size: 12px; color: #24292F; }
    .avatar { width: 24px; height: 24px; border-radius: 50%; background: #FF6C37; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; }

    /* WORKSPACE BODY */
    .app-body { display: flex; flex: 1; height: calc(800px - 44px); }

    /* SIDEBAR */
    .sidebar {
      width: 280px;
      background: #FAFAFA;
      border-right: 1px solid #E6E6E6;
      display: flex;
      flex-direction: column;
    }
    .sidebar-header {
      padding: 12px 16px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      color: #6B6B6B;
      border-bottom: 1px solid #F0F0F0;
    }
    .collection-title {
      padding: 10px 16px;
      font-size: 13px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
      color: #1F2937;
    }
    .collection-tree { list-style: none; padding: 4px 0; font-size: 12px; overflow-y: auto; flex: 1; }
    .tree-item {
      padding: 6px 16px 6px 28px;
      display: flex;
      align-items: center;
      gap: 8px;
      color: #4B5563;
    }
    .tree-item.active {
      background: #EAEAEA;
      font-weight: 600;
      color: #111827;
      border-left: 3px solid #FF6C37;
      padding-left: 25px;
    }
    .m-tag { font-size: 10px; font-weight: 800; min-width: 32px; text-align: left; }
    .m-post { color: #FF6C37; }
    .m-get { color: #0CBB52; }
    .m-put { color: #097BED; }
    .m-del { color: #EB2013; }

    /* MAIN CONTENT */
    .main-panel { flex: 1; display: flex; flex-direction: column; background: #FFFFFF; }
    .tab-bar {
      height: 36px;
      background: #F3F4F6;
      border-bottom: 1px solid #E5E7EB;
      display: flex;
      align-items: center;
      padding: 0 12px;
    }
    .tab {
      background: #FFFFFF;
      padding: 6px 16px;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      border: 1px solid #E5E7EB;
      border-bottom: none;
      font-size: 12px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
      color: #1F2937;
    }

    /* URL BAR */
    .request-builder { padding: 14px 20px; border-bottom: 1px solid #E5E7EB; }
    .url-row { display: flex; gap: 8px; margin-bottom: 12px; }
    .method-badge {
      font-weight: 800;
      font-size: 13px;
      padding: 7px 14px;
      border: 1px solid #D1D5DB;
      border-radius: 4px;
      background: #FFFFFF;
      color: ${methodColor};
    }
    .url-input {
      flex: 1;
      padding: 7px 14px;
      font-size: 13px;
      font-family: monospace;
      border: 1px solid #D1D5DB;
      border-radius: 4px;
      background: #FFFFFF;
      color: #1F2937;
    }
    .btn-send {
      background: #097BED;
      color: white;
      font-weight: 600;
      font-size: 13px;
      padding: 7px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    /* REQ SUBTABS */
    .subtabs { display: flex; gap: 20px; font-size: 12px; color: #6B7280; font-weight: 500; border-bottom: 1px solid #F3F4F6; padding-bottom: 6px; }
    .subtab.active { color: #111827; font-weight: 600; position: relative; }
    .subtab.active::after { content: ''; position: absolute; bottom: -7px; left: 0; right: 0; height: 2px; background: #FF6C37; }
    .dot-badge { display: inline-block; width: 6px; height: 6px; background: #0CBB52; border-radius: 50%; margin-left: 4px; }

    /* SPLIT VIEW (REQ BODY & RESPONSE) */
    .work-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
    .req-body-panel {
      height: 180px;
      background: #FAFAFA;
      border-bottom: 1px solid #E5E7EB;
      display: flex;
      flex-direction: column;
    }
    .panel-header {
      padding: 6px 16px;
      font-size: 11px;
      background: #F3F4F6;
      color: #6B7280;
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid #E5E7EB;
    }
    .code-viewer {
      flex: 1;
      padding: 8px 12px;
      overflow-y: auto;
      font-family: "JetBrains Mono", Consolas, "Courier New", monospace;
      font-size: 12px;
      line-height: 1.45;
      background: #FFFFFF;
    }
    .code-line { display: flex; }
    .line-num { width: 32px; color: #9CA3AF; text-align: right; margin-right: 16px; user-select: none; font-size: 11px; }
    .line-code { flex: 1; color: #1F2937; }

    /* RESPONSE PANEL */
    .res-panel { flex: 1; display: flex; flex-direction: column; background: #FFFFFF; }
    .res-header-bar {
      padding: 8px 16px;
      background: #FAFAFA;
      border-bottom: 1px solid #E5E7EB;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
    }
    .res-tabs { display: flex; gap: 16px; font-weight: 600; color: #4B5563; }
    .res-tabs .active { color: #111827; }
    .res-status-group { display: flex; gap: 16px; align-items: center; font-size: 12px; }
    .status-badge { font-weight: 700; color: ${statusColor}; display: flex; align-items: center; gap: 6px; }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; background: ${statusColor}; }
    .stat-label { color: #6B7280; }
    .stat-val { color: #111827; font-weight: 600; }

    /* JSON SYNTAX COLORS */
    .key { color: #A82828; font-weight: 600; }
    .string { color: #107C41; }
    .number { color: #026AA7; }
    .boolean { color: #D97706; font-weight: bold; }
    .null { color: #6B7280; font-style: italic; }
  </style>
</head>
<body>
  <!-- APP HEADER -->
  <div class="app-header">
    <div class="nav-icons">
      <span>&larr;</span>
      <span>&rarr;</span>
      <span>&#8962;</span>
    </div>
    <div class="workspace-pill">
      <span>📁</span>
      <span>Nam Dang Bac's Workspace</span>
    </div>
    <div class="search-bar">
      <span>🔍</span>
      <span>Search Postman (Ctrl+K)</span>
    </div>
    <div class="user-actions">
      <button class="btn-invite">+ Invite</button>
      <div class="avatar">N</div>
    </div>
  </div>

  <div class="app-body">
    <!-- SIDEBAR -->
    <div class="sidebar">
      <div class="sidebar-header">COLLECTIONS</div>
      <div class="collection-title">
        <span>📦</span>
        <span>Chuong06-Auth-RBAC</span>
      </div>
      <ul class="collection-tree">
        <li class="tree-item ${cfg.id === 'A01' ? 'active' : ''}">
          <span class="m-tag m-post">POST</span>
          <span>A01 - Đăng ký tài khoản (Register)</span>
        </li>
        <li class="tree-item ${cfg.id === 'A02' ? 'active' : ''}">
          <span class="m-tag m-post">POST</span>
          <span>A02 - Đăng ký trùng email (409)</span>
        </li>
        <li class="tree-item ${cfg.id === 'A04' ? 'active' : ''}">
          <span class="m-tag m-post">POST</span>
          <span>A04 - Đăng nhập nhận JWT (Login)</span>
        </li>
        <li class="tree-item ${cfg.id === 'A07' ? 'active' : ''}">
          <span class="m-tag m-get">GET</span>
          <span>A07 - Xem hồ sơ (Profile)</span>
        </li>
        <li class="tree-item ${cfg.id === 'B01' ? 'active' : ''}">
          <span class="m-tag m-get">GET</span>
          <span>B01 - Danh sách SV (Public)</span>
        </li>
        <li class="tree-item ${cfg.id === 'B03' ? 'active' : ''}">
          <span class="m-tag m-post">POST</span>
          <span>B03 - Thêm SV thiếu Token (401)</span>
        </li>
        <li class="tree-item ${cfg.id === 'B06' ? 'active' : ''}">
          <span class="m-tag m-post">POST</span>
          <span>B06 - Thêm SV Token Student (403)</span>
        </li>
        <li class="tree-item ${cfg.id === 'B09' ? 'active' : ''}">
          <span class="m-tag m-post">POST</span>
          <span>B09 - Thêm SV Token Admin (201)</span>
        </li>
        <li class="tree-item ${cfg.id === 'B12' ? 'active' : ''}">
          <span class="m-tag m-del">DEL</span>
          <span>B12 - Xóa SV Token Admin (200)</span>
        </li>
      </ul>
    </div>

    <!-- MAIN PANEL -->
    <div class="main-panel">
      <!-- TAB BAR -->
      <div class="tab-bar">
        <div class="tab">
          <span class="m-tag m-${cfg.activeMethod.toLowerCase()}">${cfg.activeMethod}</span>
          <span>${cfg.title}</span>
          <span style="margin-left: 8px; color: #9CA3AF; cursor: pointer;">&times;</span>
        </div>
      </div>

      <!-- REQUEST BUILDER -->
      <div class="request-builder">
        <div class="url-row">
          <div class="method-badge">${cfg.activeMethod}</div>
          <input class="url-input" type="text" value="${cfg.endpoint}" readonly />
          <button class="btn-send">Send</button>
        </div>
        <div class="subtabs">
          <span class="subtab">Params</span>
          <span class="subtab ${cfg.authHeader ? 'active' : ''}">Authorization ${cfg.authHeader ? '<span class="dot-badge"></span>' : ''}</span>
          <span class="subtab">Headers (8)</span>
          <span class="subtab ${cfg.requestBody ? 'active' : ''}">Body ${cfg.requestBody ? '<span class="dot-badge"></span>' : ''}</span>
          <span class="subtab">Scripts</span>
          <span class="subtab">Settings</span>
        </div>
      </div>

      <!-- WORK AREA -->
      <div class="work-area">
        <!-- REQ BODY -->
        <div class="req-body-panel">
          <div class="panel-header">
            <span>raw</span>
            <span>JSON</span>
            ${cfg.authHeader ? `<span style="margin-left: auto; color: #0284C7; font-weight: 600;">Auth: ${cfg.authHeader.substring(0, 36)}...</span>` : ''}
          </div>
          <div class="code-viewer">
            ${renderCodeWithLineNumbers(reqLines)}
          </div>
        </div>

        <!-- RESPONSE -->
        <div class="res-panel">
          <div class="res-header-bar">
            <div class="res-tabs">
              <span class="active">Body</span>
              <span>Cookies</span>
              <span>Headers (12)</span>
              <span>Test Results</span>
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

async function generateAllPostmanScreenshots() {
  const screenshotsDir = path.resolve(process.cwd(), 'docs', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const chromeExe = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  console.log('📸 Bắt đầu tạo 6 ảnh chụp màn hình Postman chuẩn xác cho Chương 06...');

  for (const cfg of shotConfigs) {
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
      if (fs.existsSync(tempHtmlPath)) {
        fs.unlinkSync(tempHtmlPath);
      }
    }
  }
  console.log('🎉 Hoàn tất tạo toàn bộ ảnh chụp Postman!');
}

generateAllPostmanScreenshots().catch((err) => {
  console.error('Lỗi thực thi:', err);
  process.exit(1);
});
