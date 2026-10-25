import { useState } from 'react';
import { API_BASE_URL } from './api/client';
import { LoginForm, type IUserProfile } from './components/LoginForm';
import { SinhVienTable } from './components/SinhVienTable';
import { AvatarUpload } from './components/AvatarUpload';

export function App() {
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<IUserProfile | null>(null);

  const handleLoginSuccess = (newToken: string, userProfile: IUserProfile) => {
    setToken(newToken);
    setProfile(userProfile);
  };

  const handleLogout = () => {
    setToken(null);
    setProfile(null);
  };

  const handleAvatarUploadSuccess = (newAvatarUrl: string) => {
    if (profile) {
      setProfile({
        ...profile,
        avatarUrl: newAvatarUrl,
      });
    }
  };

  return (
    <div className="bg-light min-vh-100 pb-5">
      {/* Navbar Header */}
      <nav className="navbar navbar-dark bg-dark shadow-sm mb-4">
        <div className="container">
          <span className="navbar-brand fw-bold">
            🎓 HỆ THỐNG QUẢN LÝ SINH VIÊN & PHÂN QUYỀN RBAC
          </span>
          <span className="navbar-text text-light small">
            Chương 07: Multer · Vite · React · Axios · CORS · JWT
          </span>
        </div>
      </nav>

      <div className="container">
        {/* Banner thông tin môi trường */}
        <div className="alert alert-secondary py-2 px-3 d-flex justify-content-between align-items-center mb-4">
          <span className="small">
            🌐 <strong>Backend API BaseURL:</strong> <code className="text-primary">{API_BASE_URL}</code>
            <span className="ms-3">
              🛡️ <strong>CORS Allowlist:</strong> <code>http://localhost:5173</code>
            </span>
          </span>
          <span className="badge bg-secondary">
            {token ? `Đã đăng nhập (${profile?.role?.toUpperCase()})` : 'Chưa đăng nhập'}
          </span>
        </div>

        {/* Cột chính hiển thị các module */}
        <div className="row">
          <div className="col-lg-5">
            {/* 1. Màn hình Đăng nhập & Hồ sơ */}
            <LoginForm
              token={token}
              profile={profile}
              onLoginSuccess={handleLoginSuccess}
              onLogout={handleLogout}
            />

            {/* 2. Màn hình Upload Avatar (khi đã có token) */}
            <AvatarUpload
              token={token}
              currentAvatarUrl={profile?.avatarUrl}
              onUploadSuccess={handleAvatarUploadSuccess}
            />
          </div>

          <div className="col-lg-7">
            {/* 3. Bảng Quản lý Sinh viên (Public GET + Admin DELETE) */}
            <SinhVienTable
              token={token}
              userRole={profile?.role}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-5 pt-3 text-center text-muted border-top small">
          <p className="mb-1">
            Dự án Lập trình Backend · Sinh viên: <strong>Đặng Bắc Nam</strong> · Mã dự án: <code>BACKEND-20261001-DANGBACNAM</code>
          </p>
          <p className="mb-0 text-secondary">
            Bản quyền © 2026. Công nghệ: Node.js 20+ / Express 5 / TypeScript / SQL Server / Sequelize / Multer / React 19 / Vite.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
