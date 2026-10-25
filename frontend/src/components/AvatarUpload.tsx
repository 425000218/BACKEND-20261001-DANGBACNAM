import React, { useState } from 'react';
import { apiClient, API_BASE_URL } from '../api/client';

interface AvatarUploadProps {
  token: string | null;
  currentAvatarUrl?: string | null;
  onUploadSuccess: (newAvatarUrl: string) => void;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  token,
  currentAvatarUrl,
  onUploadSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB = 2.097.152 bytes

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStatusMessage(null);
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    const file = e.target.files[0];

    // 1. Kiểm tra định dạng sơ bộ ở client
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setStatusMessage({
        type: 'error',
        text: 'Chỉ chấp nhận file ảnh định dạng PNG hoặc JPEG (.png, .jpg, .jpeg)!',
      });
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    // 2. Kiểm tra kích thước file sơ bộ (≤ 2MB)
    if (file.size > MAX_FILE_SIZE) {
      setStatusMessage({
        type: 'error',
        text: `Kích thước file (${(file.size / (1024 * 1024)).toFixed(2)}MB) vượt quá giới hạn 2MB cho phép!`,
      });
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    setSelectedFile(file);
    // Tạo preview URL để người dùng xem trước trên trình duyệt
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setStatusMessage({ type: 'error', text: 'Vui lòng chọn một file ảnh trước khi bấm Tải lên!' });
      return;
    }

    if (!token) {
      setStatusMessage({ type: 'error', text: 'Yêu cầu đăng nhập trước khi tải ảnh đại diện!' });
      return;
    }

    setUploading(true);
    setStatusMessage(null);

    try {
      // 1. Đóng gói dữ liệu vào FormData theo quy chuẩn
      const formData = new FormData();
      // BẮT BUỘC field name là 'avatar' theo hợp đồng Multer backend
      formData.append('avatar', selectedFile);

      // 2. Gửi request POST tới /api/auth/me/avatar
      // Lưu ý: Không tự tay set Content-Type để Axios và Trình duyệt tự gán multipart/form-data kèm boundary
      const res = await apiClient.post('/api/auth/me/avatar', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Để Axios/browser tự điền: 'Content-Type': 'multipart/form-data; boundary=...'
        },
      });

      if (res.data?.success) {
        const newUrl = res.data?.data?.avatarUrl;
        setStatusMessage({
          type: 'success',
          text: `Tải ảnh đại diện thành công! URL: ${newUrl}`,
        });
        setSelectedFile(null);
        setPreviewUrl(null);
        onUploadSuccess(newUrl);
      }
    } catch (err: any) {
      console.error('Lỗi khi tải ảnh:', err);
      if (err.response) {
        if (err.response.status === 413) {
          setStatusMessage({
            type: 'error',
            text: '413 Payload Too Large: Kích thước file vượt quá 2MB!',
          });
        } else if (err.response.status === 400) {
          setStatusMessage({
            type: 'error',
            text: `400 Bad Request: ${err.response.data?.message || 'File không hợp lệ hoặc chữ ký nhị phân bị từ chối'}`,
          });
        } else if (err.response.status === 401) {
          setStatusMessage({
            type: 'error',
            text: '401 Unauthorized: Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại!',
          });
        } else {
          setStatusMessage({
            type: 'error',
            text: `Lỗi máy chủ (${err.response.status}): ${err.response.data?.message || 'Upload thất bại'}`,
          });
        }
      } else {
        setStatusMessage({
          type: 'error',
          text: err.message || 'Lỗi mạng khi tải file lên',
        });
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card shadow-sm mb-4 border-info">
      <div className="card-header bg-info text-dark d-flex justify-content-between align-items-center">
        <h5 className="mb-0">🖼️ Cập Nhật Ảnh Đại Diện (Multer Upload & Lưu Trữ Đĩa)</h5>
        <span className="badge bg-dark text-white">Giới hạn ≤ 2MB (JPEG / PNG)</span>
      </div>

      <div className="card-body">
        {statusMessage && (
          <div
            className={`alert ${statusMessage.type === 'success' ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`}
            role="alert"
          >
            {statusMessage.text}
            <button
              type="button"
              className="btn-close"
              onClick={() => setStatusMessage(null)}
            ></button>
          </div>
        )}

        <form onSubmit={handleUpload}>
          <div className="row align-items-center mb-3">
            <div className="col-auto">
              <div
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 8,
                  overflow: 'hidden',
                  backgroundColor: '#f8f9fa',
                  border: '2px dashed #0dcaf0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Xem trước"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : currentAvatarUrl ? (
                  <img
                    src={`${API_BASE_URL}${currentAvatarUrl}`}
                    alt="Ảnh hiện tại"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span className="text-muted small text-center p-1">Chưa có ảnh</span>
                )}
              </div>
            </div>

            <div className="col">
              <label className="form-label fw-semibold">
                Chọn file ảnh mới (PNG, JPEG):
              </label>
              <input
                type="file"
                className="form-control"
                accept="image/png,image/jpeg"
                onChange={handleFileChange}
                disabled={uploading || !token}
              />
              <div className="form-text">
                Server sẽ kiểm tra kích thước tối đa 2MB và chữ ký nhị phân (magic bytes) thực tế.
              </div>
            </div>
          </div>

          <div className="d-flex gap-2">
            <button
              type="submit"
              disabled={uploading || !selectedFile || !token}
              className="btn btn-info text-dark fw-semibold"
            >
              {uploading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Đang tải lên...
                </>
              ) : (
                '🚀 Tải ảnh lên Server'
              )}
            </button>
            {!token && (
              <span className="text-danger align-self-center small">
                ⚠️ Vui lòng đăng nhập ở trên để kích hoạt chức năng tải ảnh!
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
