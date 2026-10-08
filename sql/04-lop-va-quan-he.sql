-- =======================================================================
-- BÀI THỰC HÀNH BUỔI 4: KẾT NỐI SQL SERVER & SEQUELIZE ORM
-- File: sql/04-lop-va-quan-he.sql
-- Mục đích: Tạo bảng dbo.Lop, thiết lập quan hệ 1-N với dbo.SinhVien và cấp quyền
-- =======================================================================

USE QuanLySinhVienDB;
GO

-- 1. Tạo bảng dbo.Lop nếu chưa tồn tại
-- - maLop: NVARCHAR(50) là Khóa chính (PK)
-- - tenLop: NVARCHAR(150) tên lớp học (NOT NULL)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.Lop') AND type in (N'U'))
BEGIN
    CREATE TABLE dbo.Lop (
        maLop NVARCHAR(50) NOT NULL,
        tenLop NVARCHAR(150) NOT NULL,
        CONSTRAINT PK_Lop PRIMARY KEY (maLop)
    );
    PRINT N'Đã tạo bảng dbo.Lop thành công.';
END
ELSE
BEGIN
    PRINT N'Bảng dbo.Lop đã tồn tại sẵn, giữ nguyên.';
END
GO

-- 2. Đồng bộ dữ liệu: Tạo bản ghi Lop cho tất cả maLop DISTINCT đang có trong dbo.SinhVien
-- Dùng tên tạm tenLop = maLop để không bị vi phạm ràng buộc toàn vẹn khi tạo Foreign Key
INSERT INTO dbo.Lop (maLop, tenLop)
SELECT DISTINCT sv.maLop, sv.maLop
FROM dbo.SinhVien sv
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.Lop l WHERE l.maLop = sv.maLop
);
PRINT N'Đã đồng bộ các mã lớp hiện có từ bảng SinhVien vào bảng Lop.';
GO

-- 3. Cập nhật thêm tên lớp mẫu thân thiện hơn nếu cần
UPDATE dbo.Lop
SET tenLop = N'Lớp Công Nghệ Thông Tin K114'
WHERE maLop = N'25CT114' AND tenLop = N'25CT114';
GO

-- 4. Thêm Khóa ngoại (Foreign Key) từ dbo.SinhVien(maLop) tham chiếu dbo.Lop(maLop)
-- Không bật CASCADE DELETE để tránh vô tình xóa mất dữ liệu sinh viên khi xóa lớp
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = N'FK_SinhVien_Lop')
BEGIN
    ALTER TABLE dbo.SinhVien
    ADD CONSTRAINT FK_SinhVien_Lop
    FOREIGN KEY (maLop) REFERENCES dbo.Lop(maLop);
    PRINT N'Đã thiết lập Khóa ngoại FK_SinhVien_Lop thành công.';
END
ELSE
BEGIN
    PRINT N'Khóa ngoại FK_SinhVien_Lop đã tồn tại sẵn.';
END
GO

-- 5. Cấp quyền SELECT trên bảng dbo.Lop cho tài khoản ứng dụng sv_app
GRANT SELECT ON dbo.Lop TO sv_app;
PRINT N'Đã cấp quyền SELECT bảng dbo.Lop cho user sv_app.';
GO

-- 6. Truy vấn kiểm tra dữ liệu 2 bảng sau khi thiết lập quan hệ
SELECT l.maLop, l.tenLop, COUNT(sv.maSV) AS soLuongSinhVien
FROM dbo.Lop l
LEFT JOIN dbo.SinhVien sv ON l.maLop = sv.maLop
GROUP BY l.maLop, l.tenLop;
GO
