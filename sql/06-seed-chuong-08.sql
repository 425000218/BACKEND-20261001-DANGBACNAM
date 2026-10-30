-- =======================================================================
-- BÀI THỰC HÀNH CHƯƠNG 08: TRUY VẤN NÂNG CAO & PHÂN TRANG
-- File: sql/06-seed-chuong-08.sql
-- Mục đích: Đảm bảo có ít nhất 6 sinh viên test, có ít nhất 2 tên chứa "Anh"
--           để phục vụ kiểm thử phân trang và tìm kiếm (P01-P17)
-- =======================================================================

USE QuanLySinhVienDB;
GO

-- 1. Đảm bảo lớp 25CT114 tồn tại
IF NOT EXISTS (SELECT 1 FROM dbo.Lop WHERE maLop = '25CT114')
BEGIN
    INSERT INTO dbo.Lop (maLop, tenLop)
    VALUES ('25CT114', N'Lớp Công Nghệ Thông Tin K114');
END
GO

-- 2. Thêm SV003 - Nguyễn Tuấn Anh (chứa chữ "Anh")
IF NOT EXISTS (SELECT 1 FROM dbo.SinhVien WHERE maSV = 'SV003')
BEGIN
    INSERT INTO dbo.SinhVien (maSV, hoTen, email, maLop)
    VALUES ('SV003', N'Nguyễn Tuấn Anh', N'tuananh@example.com', N'25CT114');
    PRINT N'Đã thêm sinh viên mẫu SV003 (Nguyễn Tuấn Anh).';
END
GO

-- 3. Thêm SV005 - Lê Hoàng Yến
IF NOT EXISTS (SELECT 1 FROM dbo.SinhVien WHERE maSV = 'SV005')
BEGIN
    INSERT INTO dbo.SinhVien (maSV, hoTen, email, maLop)
    VALUES ('SV005', N'Lê Hoàng Yến', N'hoangyen@example.com', N'25CT114');
    PRINT N'Đã thêm sinh viên mẫu SV005 (Lê Hoàng Yến).';
END
GO

-- 4. Thêm SV006 - Đỗ Quỳnh Anh (chứa chữ "Anh")
IF NOT EXISTS (SELECT 1 FROM dbo.SinhVien WHERE maSV = 'SV006')
BEGIN
    INSERT INTO dbo.SinhVien (maSV, hoTen, email, maLop)
    VALUES ('SV006', N'Đỗ Quỳnh Anh', N'quynhanh@example.com', N'25CT114');
    PRINT N'Đã thêm sinh viên mẫu SV006 (Đỗ Quỳnh Anh).';
END
GO

-- 5. Truy vấn kiểm tra tổng số lượng sinh viên hiện tại
SELECT COUNT(*) AS totalStudents FROM dbo.SinhVien;
SELECT maSV, hoTen, email, maLop FROM dbo.SinhVien ORDER BY maSV ASC;
GO
