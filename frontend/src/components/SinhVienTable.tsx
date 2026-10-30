import React, { useEffect, useState, useCallback } from 'react';
import { apiClient } from '../api/client';

export interface ISinhVien {
  maSV: string;
  hoTen: string;
  email: string;
  maLop: string;
}

export interface IPaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
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

  // Trạng thái Tìm kiếm & Phân trang tại SQL Server (Chương 08)
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(5);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeSearch, setActiveSearch] = useState<string>('');
  const [pagination, setPagination] = useState<IPaginationMeta | null>(null);

  const fetchDanhSach = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Hợp đồng API Chương 08:
      // GET /api/v1/sinh-vien?page=X&limit=Y&search=Z
      // Trả: { success: true, message: "...", data: [...], pagination: { page, limit, totalItems, totalPages } }
      const res = await apiClient.get('/api/v1/sinh-vien', {
        params: {
          page,
          limit,
          search: activeSearch || undefined,
        },
      });

      if (res.data && Array.isArray(res.data.data)) {
        setDanhSach(res.data.data);
      } else {
        setDanhSach([]);
      }

      if (res.data && res.data.pagination) {
        setPagination(res.data.pagination);
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
  }, [page, limit, activeSearch]);

  useEffect(() => {
    fetchDanhSach();
  }, [fetchDanhSach]);

  // Xử lý gửi tìm kiếm: reset về trang 1 để không bị rỗng
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setActiveSearch(searchTerm.trim());
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setActiveSearch('');
    setPage(1);
  };

  // Chuyển trang (Trước / Sau)
  const handlePrevPage = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination && page < pagination.totalPages) {
      setPage(prev => prev + 1);
    }
  };

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
  const totalPages = pagination?.totalPages ?? 1;
  const totalItems = pagination?.totalItems ?? 0;

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">📋 Quản Lý Sinh Viên (Phân Trang & Tìm Kiếm SQL Server)</h5>
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
        {/* Thanh tìm kiếm theo Họ Tên (Chương 08) */}
        <form onSubmit={handleSearchSubmit} className="row g-2 mb-3">
          <div className="col-sm-7 col-md-8">
            <div className="input-group">
              <span className="input-group-text bg-white">🔍</span>
              <input
                type="text"
                className="form-control"
                placeholder="Tìm kiếm theo họ tên (ví dụ: Anh, Mai, Nam)..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                maxLength={80}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleClearSearch}
                  title="Xóa tìm kiếm"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          <div className="col-sm-3 col-md-2">
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              Tìm kiếm
            </button>
          </div>
          <div className="col-sm-2 col-md-2">
            <select
              className="form-select"
              value={limit}
              onChange={e => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              title="Số bản ghi mỗi trang"
            >
              <option value={2}>2 / trang</option>
              <option value={5}>5 / trang</option>
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
            </select>
          </div>
        </form>

        {activeSearch && (
          <div className="mb-2">
            <span className="badge bg-info text-dark">
              Đang lọc theo tên: "{activeSearch}"
            </span>
            <button
              onClick={handleClearSearch}
              className="btn btn-link btn-sm text-decoration-none ms-1 p-0"
            >
              (Bỏ lọc)
            </button>
          </div>
        )}

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
            <p className="mt-2 text-muted">Đang truy vấn phân trang tại SQL Server...</p>
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
            <p className="mb-0">
              📭 {activeSearch ? `Không tìm thấy sinh viên nào phù hợp với từ khóa "${activeSearch}".` : 'Hiện tại chưa có sinh viên nào trong CSDL.'}
            </p>
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
          </div>
        )}

        {/* Điều khiển Phân trang (Pagination Controls - Phân trang thật tại Database) */}
        {!loading && !error && totalItems > 0 && (
          <div className="d-flex flex-wrap justify-content-between align-items-center mt-3 pt-2 border-top">
            <div className="text-muted small">
              Hiển thị trang <strong>{page}</strong> / <strong>{totalPages}</strong> (Tổng số: <strong>{totalItems}</strong> sinh viên)
              {isAdmin ? (
                <span className="badge bg-success ms-2">Quyền Admin</span>
              ) : (
                <span className="badge bg-secondary ms-2">Chế độ Public</span>
              )}
            </div>
            <nav aria-label="Phân trang sinh viên">
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={handlePrevPage}
                    disabled={page <= 1}
                  >
                    ◀ Trước
                  </button>
                </li>
                <li className="page-item active">
                  <span className="page-link">
                    Trang {page} / {totalPages}
                  </span>
                </li>
                <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={handleNextPage}
                    disabled={page >= totalPages}
                  >
                    Sau ▶
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};
