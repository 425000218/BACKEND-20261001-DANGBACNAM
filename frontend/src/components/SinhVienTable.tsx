import React, { useEffect, useState, useCallback } from 'react';
import { apiClient } from '../api/client';

export interface ISinhVien {
  maSV: string;
  hoTen: string;
  email: string;
  maLop: string;
}

interface SinhVienTableProps {
  token: string | null;
  userRole?: string | null;
}

export const SinhVienTable: React.FC<SinhVienTableProps> = ({ token, userRole }) => {
  const [danhSach, setDanhSach] = useState<ISinhVien[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingMaSV, setDeletingMaSV] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchDanhSach = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Hợp đồng API: GET /api/v1/sinh-vien trả { success: true, message: "...", data: [...] }
      const res = await apiClient.get('/api/v1/sinh-vien');
      if (res.data && Array.isArray(res.data.data)) {
        setDanhSach(res.data.data);
      } else {
        setDanhSach([]);
      }
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách sinh viên:', err);
      if (err.response) {
        setError(`Lỗi máy chủ (${err.response.status}): ${err.response.data?.message || 'Không thể tải danh sách'}`);
      } else if (err.request) {
        setError('Không thể kết nối tới Backend (ERR_CONNECTION_REFUSED hoặc lỗi mạng). Hãy đảm bảo server đang bật.');
      } else {
        setError(err.message || 'Lỗi không xác định khi gọi API');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDanhSach();
  }, [fetchDanhSach]);

  // Xử lý Xóa sinh viên (Chỉ Admin mới có quyền)
  const handleDelete = async (maSV: string) => {
    const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa sinh viên mang mã [${maSV}] không?\nLưu ý: Thao tác này sẽ xóa vĩnh viễn trong CSDL.`);
    if (!confirmed) return;

    setDeletingMaSV(maSV);
    setActionMessage(null);

    try {
      const res = await apiClient.delete(`/api/v1/sinh-vien/${maSV}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data?.success) {
        setActionMessage({ type: 'success', text: `Xóa sinh viên ${maSV} thành công!` });
        // Tải lại danh sách từ CSDL thật để đảm bảo tính nhất quán
        await fetchDanhSach();
      }
    } catch (err: any) {
      console.error('Lỗi khi xóa sinh viên:', err);
      if (err.response?.status === 401) {
        setActionMessage({ type: 'error', text: '401 Unauthorized: Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại!' });
      } else if (err.response?.status === 403) {
        setActionMessage({ type: 'error', text: '403 Forbidden: Bạn không có quyền Quản trị viên (Admin) để xóa sinh viên!' });
      } else if (err.response?.status === 404) {
        setActionMessage({ type: 'error', text: `404 Not Found: Sinh viên ${maSV} không tồn tại trong hệ thống!` });
      } else {
        setActionMessage({ type: 'error', text: `Lỗi: ${err.response?.data?.message || err.message}` });
      }
    } finally {
      setDeletingMaSV(null);
    }
  };

  const isAdmin = userRole === 'admin';

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">📋 Danh Sách Sinh Viên (Gọi API Thật từ SQL Server)</h5>
        <button
          onClick={fetchDanhSach}
          disabled={loading}
          className="btn btn-sm btn-light"
          title="Làm mới danh sách"
        >
          {loading ? 'Đang tải...' : '🔄 Tải lại'}
        </button>
      </div>

      <div className="card-body">
        {/* Thông báo thao tác */}
        {actionMessage && (
          <div className={`alert ${actionMessage.type === 'success' ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`} role="alert">
            {actionMessage.text}
            <button type="button" className="btn-close" onClick={() => setActionMessage(null)}></button>
          </div>
        )}

        {/* Trạng thái Loading */}
        {loading && (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="mt-2 text-muted">Đang kết nối Backend và truy vấn SQL Server...</p>
          </div>
        )}

        {/* Trạng thái Lỗi */}
        {!loading && error && (
          <div className="alert alert-danger my-3" role="alert">
            <h6 className="alert-heading fw-bold">⚠️ Có lỗi xảy ra khi tải dữ liệu!</h6>
            <p className="mb-2">{error}</p>
            <button onClick={fetchDanhSach} className="btn btn-danger btn-sm">
              🔄 Thử lại
            </button>
          </div>
        )}

        {/* Trạng thái Rỗng */}
        {!loading && !error && danhSach.length === 0 && (
          <div className="alert alert-warning text-center my-3" role="alert">
            <p className="mb-0">📭 Hiện tại chưa có sinh viên nào trong Cơ sở dữ liệu.</p>
          </div>
        )}

        {/* Hiển thị Bảng 4 cột */}
        {!loading && !error && danhSach.length > 0 && (
          <div className="table-responsive">
            <table className="table table-striped table-hover align-middle border">
              <thead className="table-dark">
                <tr>
                  <th scope="col" style={{ width: '15%' }}>Mã SV</th>
                  <th scope="col" style={{ width: '35%' }}>Họ và Tên</th>
                  <th scope="col" style={{ width: '25%' }}>Email</th>
                  <th scope="col" style={{ width: '15%' }}>Mã Lớp</th>
                  {isAdmin && <th scope="col" style={{ width: '10%' }} className="text-center">Thao tác</th>}
                </tr>
              </thead>
              <tbody>
                {danhSach.map((sv) => (
                  <tr key={sv.maSV}>
                    <td><span className="badge bg-secondary font-monospace">{sv.maSV}</span></td>
                    <td className="fw-semibold">{sv.hoTen}</td>
                    <td>{sv.email}</td>
                    <td><span className="badge bg-info text-dark">{sv.maLop}</span></td>
                    {isAdmin && (
                      <td className="text-center">
                        <button
                          onClick={() => handleDelete(sv.maSV)}
                          disabled={deletingMaSV === sv.maSV}
                          className="btn btn-outline-danger btn-sm"
                          title={`Xóa sinh viên ${sv.maSV}`}
                        >
                          {deletingMaSV === sv.maSV ? 'Đang xóa...' : '🗑️ Xóa'}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-muted small mt-2">
              Tổng số sinh viên: <strong>{danhSach.length}</strong>
              {isAdmin ? (
                <span className="badge bg-success ms-2">Quyền Admin: Cho phép xóa sinh viên</span>
              ) : (
                <span className="badge bg-secondary ms-2">Chế độ xem Public / Student</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
