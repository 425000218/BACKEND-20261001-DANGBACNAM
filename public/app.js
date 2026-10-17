let currentToken = localStorage.getItem('accessToken') || '';
let currentRole = localStorage.getItem('userRole') || 'guest';

function updateSessionUI() {
  const badge = document.getElementById('sessionRoleBadge');
  const tokenDisplay = document.getElementById('tokenDisplay');

  if (currentToken) {
    tokenDisplay.innerText = currentToken;
    if (currentRole === 'admin') {
      badge.className = 'badge badge-admin';
      badge.innerText = 'ROLE: ADMIN 👑';
    } else {
      badge.className = 'badge badge-student';
      badge.innerText = 'ROLE: STUDENT 🎓';
    }
  } else {
    tokenDisplay.innerText = 'Chưa có Token. Hãy đăng nhập để nhận JWT.';
    badge.className = 'badge badge-guest';
    badge.innerText = 'Chưa đăng nhập';
  }
}

function showResponse(method, url, status, data) {
  const statusBadge = document.getElementById('responseStatusBadge');
  const requestMeta = document.getElementById('requestMeta');
  const responseBody = document.getElementById('responseBody');

  requestMeta.innerText = `${method} ${url}`;
  statusBadge.innerText = `${status}`;
  statusBadge.className = 'status-pill';

  if (status >= 200 && status < 300) statusBadge.classList.add('status-200');
  else if (status === 400 || status === 409) statusBadge.classList.add('status-400');
  else if (status === 401 || status === 403) statusBadge.classList.add('status-401');
  else statusBadge.classList.add('status-500');

  responseBody.innerText = JSON.stringify(data, null, 2);
}

function clearConsole() {
  document.getElementById('responseStatusBadge').innerText = 'CLEARED';
  document.getElementById('responseStatusBadge').className = 'status-pill';
  document.getElementById('requestMeta').innerText = '';
  document.getElementById('responseBody').innerText = '// Đã xóa log.';
}

// Helper fetch with Bearer token
async function apiRequest(method, endpoint, body = null, useAuth = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (useAuth && currentToken) {
    headers['Authorization'] = `Bearer ${currentToken}`;
  }
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  try {
    const res = await fetch(endpoint, opts);
    let data = {};
    try { data = await res.json(); } catch { data = { message: 'Non-JSON response' }; }
    showResponse(method, endpoint, res.status, data);
    return { status: res.status, data };
  } catch (err) {
    showResponse(method, endpoint, 0, { error: err.message });
    return { status: 0, data: { error: err.message } };
  }
}

// Auth Handlers
async function handleRegister() {
  const body = {
    fullName: document.getElementById('regFullName').value,
    email: document.getElementById('regEmail').value,
    password: document.getElementById('regPassword').value,
  };
  await apiRequest('POST', '/api/auth/register', body, false);
}

async function handleLogin() {
  const body = {
    email: document.getElementById('loginEmail').value,
    password: document.getElementById('loginPassword').value,
  };
  const res = await apiRequest('POST', '/api/auth/login', body, false);
  if (res.status === 200 && res.data?.data?.accessToken) {
    currentToken = res.data.data.accessToken;
    localStorage.setItem('accessToken', currentToken);
    
    // Decode role from token payload
    try {
      const payload = JSON.parse(atob(currentToken.split('.')[1]));
      currentRole = payload.role || 'student';
      localStorage.setItem('userRole', currentRole);
    } catch {
      currentRole = 'student';
    }
    updateSessionUI();
  }
}

async function handleGetProfile() {
  await apiRequest('GET', '/api/auth/profile', null, true);
}

function handleLogout() {
  currentToken = '';
  currentRole = 'guest';
  localStorage.removeItem('accessToken');
  localStorage.removeItem('userRole');
  updateSessionUI();
  showResponse('LOGOUT', '-', 200, { message: 'Đã xóa Access Token trên client.' });
}

function fillAdminLogin() {
  document.getElementById('loginEmail').value = 'admin@example.com';
  document.getElementById('loginPassword').value = 'Admin@123';
}

function fillStudentLogin() {
  document.getElementById('loginEmail').value = 'an.lab@example.com';
  document.getElementById('loginPassword').value = 'SinhVien@123';
}

// SinhVien CRUD Handlers
async function handleGetSinhVien() {
  const res = await apiRequest('GET', '/api/v1/sinh-vien', null, false);
  const tbody = document.getElementById('sinhVienTbody');
  tbody.innerHTML = '';
  if (res.status === 200 && Array.isArray(res.data?.data)) {
    res.data.data.forEach(sv => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td><b>${sv.maSV}</b></td><td>${sv.hoTen}</td><td>${sv.email}</td><td>${sv.maLop}</td>`;
      tbody.appendChild(tr);
    });
  } else {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--danger);">Không tải được danh sách.</td></tr>`;
  }
}

async function handleCreateSinhVien() {
  const body = {
    maSV: document.getElementById('svMa').value,
    hoTen: document.getElementById('svHoTen').value,
    email: document.getElementById('svEmail').value,
    maLop: document.getElementById('svLop').value,
  };
  await apiRequest('POST', '/api/v1/sinh-vien', body, true);
  handleGetSinhVien();
}

async function handleUpdateSinhVien() {
  const maSV = document.getElementById('svMa').value;
  const body = {
    hoTen: document.getElementById('svHoTen').value,
    email: document.getElementById('svEmail').value,
    maLop: document.getElementById('svLop').value,
  };
  await apiRequest('PUT', `/api/v1/sinh-vien/${maSV}`, body, true);
  handleGetSinhVien();
}

async function handleDeleteSinhVien() {
  const maSV = document.getElementById('svMa').value;
  await apiRequest('DELETE', `/api/v1/sinh-vien/${maSV}`, null, true);
  handleGetSinhVien();
}

// Bind event listeners when DOM loads
document.addEventListener('DOMContentLoaded', () => {
  updateSessionUI();

  // Auth buttons
  document.getElementById('btnRegister')?.addEventListener('click', handleRegister);
  document.getElementById('btnLogin')?.addEventListener('click', handleLogin);
  document.getElementById('btnProfile')?.addEventListener('click', handleGetProfile);
  document.getElementById('btnLogout')?.addEventListener('click', handleLogout);
  document.getElementById('btnFillAdmin')?.addEventListener('click', fillAdminLogin);
  document.getElementById('btnFillStudent')?.addEventListener('click', fillStudentLogin);

  // SinhVien buttons
  document.getElementById('btnGetSinhVien')?.addEventListener('click', handleGetSinhVien);
  document.getElementById('btnCreateSinhVien')?.addEventListener('click', handleCreateSinhVien);
  document.getElementById('btnUpdateSinhVien')?.addEventListener('click', handleUpdateSinhVien);
  document.getElementById('btnDeleteSinhVien')?.addEventListener('click', handleDeleteSinhVien);
  document.getElementById('btnClearConsole')?.addEventListener('click', clearConsole);
});
