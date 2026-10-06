-- =======================================================================
-- BÀI THỰC HÀNH BUỔI 4: KẾT NỐI SQL SERVER & SEQUELIZE ORM
-- File: sql/02-seed.sql
-- Mục đích: Khởi tạo dữ liệu mẫu cho bảng dbo.SinhVien (SV001, SV002)
-- =======================================================================

USE QuanLySinhVienDB;
GO

-- 1. Chèn sinh viên mẫu SV001 (chỉ chèn nếu chưa tồn tại mã này)
IF NOT EXISTS (SELECT 1 FROM dbo.SinhVien WHERE maSV = 'SV001')
BEGIN
    INSERT INTO dbo.SinhVien (maSV, hoTen, email, maLop)
    VALUES ('SV001', N'Minh Nhật', N'minhnhat@example.com', N'25CT114');
    PRINT N'Đã thêm sinh viên mẫu SV001.';
END
ELSE
BEGIN
    PRINT N'Sinh viên SV001 đã có trong bảng, bỏ qua không chèn đè.';
END
GO

-- 2. Chèn sinh viên mẫu SV002 (chỉ chèn nếu chưa tồn tại mã này)
IF NOT EXISTS (SELECT 1 FROM dbo.SinhVien WHERE maSV = 'SV002')
BEGIN
    INSERT INTO dbo.SinhVien (maSV, hoTen, email, maLop)
    VALUES ('SV002', N'Lan Anh', N'lananh@example.com', N'25CT114');
    PRINT N'Đã thêm sinh viên mẫu SV002.';
END
ELSE
BEGIN
    PRINT N'Sinh viên SV002 đã có trong bảng, bỏ qua không chèn đè.';
END
GO

-- 3. Truy vấn kiểm tra kết quả dữ liệu trong bảng sau khi seed
SELECT maSV, hoTen, email, maLop
FROM dbo.SinhVien
ORDER BY maSV ASC;
GO
