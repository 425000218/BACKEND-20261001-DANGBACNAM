import React, { useState } from 'react';
import { apiClient } from '../api/client';

export interface IUserProfile {
  id: number;
  fullName: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
}

interface LoginFormProps {
  token: string | null;
  profile: IUserProfile | null;
  onLoginSuccess: (token: string, profile: IUserProfile) => void;
  onLogout: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  token,
  profile,
  onLoginSuccess,
  onLogout,
}) => {
  const [email, setEmail] = useState<string>('an.lab@example.com');
  const [password, setPassword] = useState<string>('SinhVien@123');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      // 1. Gửi request đăng nhập nhận Access Token
      const loginRes = await apiClient.post('/api/auth/login', {
        email: email.trim(),
        password,
      });

      const accessToken = loginRes.data?.data?.accessToken;
      if (!accessToken) {
        throw new Error('Không nhận được Access Token từ máy chủ');
      }

      // 2. Gọi GET /api/auth/profile với header Bearer token để lấy thông tin người dùng
      const profileRes = await apiClient.get('/api/auth/profile', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const userProfile: IUserProfile = profileRes.data?.data;
      onLoginSuccess(accessToken, userProfile);
    } catch (err: any) {
      console.error('Lỗi khi đăng nhập:', err);
      if (err.response) {
        if (err.response.status === 401) {
          setErrorMessage('401 Unauthorized: Email hoặc mật khẩu không chính xác!');
        } else {
          setErrorMessage(`Lỗi máy chủ (${err.response.status}): ${err.response.data?.message || 'Đăng nhập thất bại'}`);
        }
      } else if (err.request) {
        setErrorMessage('Không thể kết nối máy chủ. Kiểm tra cổng Backend (5000) hoặc lỗi CORS!');
      } else {
        setErrorMessage(err.message || 'Lỗi không xác định');
      }
    } finally {
      setLoading(false);
    }
  };

  // Đã đăng nhập: Hiển thị Profile card
  if (token && profile) {
    return (
      <div className="card shadow-sm mb-4 border-success">
        <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">👤 Hồ Sơ Người Dùng Đang Đăng Nhập</h5>
          <button onClick={onLogout} className="btn btn-outline-light btn-sm">
            🚪 Đăng xuất
          </button>
        </div>
        <div className="card-body">
          <div className="d-flex align-items-center gap-3">
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                overflow: 'hidden',
                backgroundColor: '#e9ecef',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #198754',
              }}
            >
              {profile.avatarUrl ? (
                <img
                  src={`${apiClient.defaults.baseURL}${profile.avatarUrl}`}
                  alt="Avatar"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ fontSize: 28 }}>👤</span>
              )}
            </div>

            <div>
              <h5 className="mb-1 fw-bold">{profile.fullName}</h5>
              <p className="mb-1 text-muted small">📧 {profile.email}</p>
              <div>
                <span className={`badge ${profile.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                  Vai trò: {profile.role.toUpperCase()}
                </span>
                {profile.avatarUrl && (
                  <span className="badge bg-secondary ms-2 small">
                    URL Avatar: {profile.avatarUrl}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Chưa đăng nhập: Form nhập thông tin
  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header bg-dark text-white">
        <h5 className="mb-0">🔐 Đăng Nhập Hệ Thống (Xác thực JWT HS256)</h5>
      </div>
      <div className="card-body">
        {errorMessage && (
          <div className="alert alert-danger" role="alert">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Địa chỉ Email:</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="VD: an.lab@example.com hoặc admin@example.com"
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Mật khẩu:</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Mật khẩu của bạn"
            />
          </div>

          <div className="d-flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Đang xác thực...
                </>
              ) : (
                '🔑 Đăng nhập'
              )}
            </button>

            {/* Nút bấm nhanh để test Student và Admin */}
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => {
                setEmail('an.lab@example.com');
                setPassword('SinhVien@123');
              }}
            >
              Điền tài khoản Student
            </button>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={() => {
                setEmail('admin@example.com');
                setPassword('Admin@123');
              }}
            >
              Điền tài khoản Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
