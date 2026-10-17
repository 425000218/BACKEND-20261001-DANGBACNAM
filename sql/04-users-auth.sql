-- =======================================================================
-- BÀI THỰC HÀNH CHƯƠNG 06: AUTHENTICATION & AUTHORIZATION
-- File: sql/04-users-auth.sql
-- Mục đích: Tạo bảng dbo.Users và phân quyền truy cập cho sv_app
-- =======================================================================

USE QuanLySinhVienDB;
GO

-- 1. Tạo bảng dbo.Users nếu chưa tồn tại (An toàn, không DROP, không phá dữ liệu)
-- Ghi chú thiết kế theo tài liệu Chương 06:
-- - id: INT IDENTITY(1,1) là Khóa chính (PK), tự tăng.
-- - fullName: NVARCHAR(150) bắt buộc, không rỗng.
-- - email: NVARCHAR(254) bắt buộc, UNIQUE, chuẩn hóa nhất quán.
-- - passwordHash: NVARCHAR(255) lưu mã hash bcrypt, không lưu mật khẩu gốc.
-- - role: NVARCHAR(20) mặc định 'student', chỉ chấp nhận 'student' hoặc 'admin'.
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.Users') AND type in (N'U'))
BEGIN
    CREATE TABLE dbo.Users (
        id INT IDENTITY(1,1) NOT NULL,
        fullName NVARCHAR(150) NOT NULL,
        email NVARCHAR(254) NOT NULL,
        passwordHash NVARCHAR(255) NOT NULL,
        role NVARCHAR(20) NOT NULL CONSTRAINT DF_Users_Role DEFAULT 'student',
        CONSTRAINT PK_Users PRIMARY KEY CLUSTERED (id ASC),
        CONSTRAINT UQ_Users_Email UNIQUE (email)
    );
    PRINT N'Đã tạo mới bảng dbo.Users thành công.';
END
ELSE
BEGIN
    PRINT N'Bảng dbo.Users đã tồn tại sẵn trong CSDL, giữ nguyên cấu trúc.';
END
GO

-- 2. Cấp quyền truy cập tối thiểu cho tài khoản sv_app
-- Cần SELECT (tra cứu lúc login), INSERT (thêm lúc register) trên bảng Users
GRANT SELECT, INSERT ON dbo.Users TO sv_app;
PRINT N'Đã cấp quyền SELECT và INSERT trên bảng dbo.Users cho sv_app.';
GO

-- 3. Câu lệnh xác minh cấu trúc bảng dbo.Users
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    CHARACTER_MAXIMUM_LENGTH, 
    IS_NULLABLE, 
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Users' AND TABLE_SCHEMA = 'dbo';
GO
