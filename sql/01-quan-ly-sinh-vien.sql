-- =======================================================================
-- BÀI THỰC HÀNH BUỔI 4: KẾT NỐI SQL SERVER & SEQUELIZE ORM
-- File: sql/01-quan-ly-sinh-vien.sql
-- Mục đích: Tạo Cơ sở dữ liệu QuanLySinhVienDB và bảng dbo.SinhVien
-- =======================================================================

-- 1. Tạo Cơ sở dữ liệu QuanLySinhVienDB nếu chưa tồn tại
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'QuanLySinhVienDB')
BEGIN
    CREATE DATABASE QuanLySinhVienDB;
    PRINT N'Đã tạo mới Cơ sở dữ liệu QuanLySinhVienDB.';
END
ELSE
BEGIN
    PRINT N'Cơ sở dữ liệu QuanLySinhVienDB đã tồn tại sẵn, giữ nguyên.';
END
GO

-- 2. Chuyển ngữ cảnh làm việc sang QuanLySinhVienDB
USE QuanLySinhVienDB;
GO

-- 3. Tạo bảng dbo.SinhVien nếu chưa tồn tại
-- Ghi chú thiết kế:
-- - maSV: VARCHAR(5) là Khóa chính (PK), định danh duy nhất (ví dụ: SV001). Không dùng id tự tăng.
-- - hoTen: NVARCHAR(150) hỗ trợ gõ tiếng Việt có dấu.
-- - email: NVARCHAR(254) lưu email tối đa 254 ký tự theo chuẩn RFC.
-- - maLop: NVARCHAR(50) lưu mã lớp (ví dụ: 25CT114).
-- - Không thêm cột timestamps (createdAt, updatedAt) theo đúng yêu cầu đề bài.
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.SinhVien') AND type in (N'U'))
BEGIN
    CREATE TABLE dbo.SinhVien (
        maSV VARCHAR(5) NOT NULL,
        hoTen NVARCHAR(150) NOT NULL,
        email NVARCHAR(254) NOT NULL,
        maLop NVARCHAR(50) NOT NULL,
        CONSTRAINT PK_SinhVien PRIMARY KEY (maSV)
    );
    PRINT N'Đã tạo bảng dbo.SinhVien thành công.';
END
ELSE
BEGIN
    PRINT N'Bảng dbo.SinhVien đã tồn tại sẵn, giữ nguyên cấu trúc.';
END
GO
