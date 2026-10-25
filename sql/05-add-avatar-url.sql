-- =======================================================================
-- BÀI THỰC HÀNH CHƯƠNG 07: UPLOAD HÌNH ẢNH & KẾT NỐI FRONTEND - BACKEND
-- File: sql/05-add-avatar-url.sql
-- Mục đích: Bổ sung an toàn cột avatarUrl vào bảng dbo.Users (Idempotent)
-- =======================================================================

USE QuanLySinhVienDB;
GO

-- 1. Kiểm tra sự tồn tại của bảng dbo.Users
IF OBJECT_ID(N'dbo.Users', N'U') IS NULL
BEGIN
    THROW 50001, N'Chưa có bảng dbo.Users. Hãy chạy các script trước đó!', 1;
END;
GO

-- 2. Thêm cột avatarUrl nếu chưa tồn tại (An toàn, không phá hủy dữ liệu)
IF COL_LENGTH('dbo.Users', 'avatarUrl') IS NULL
BEGIN
    ALTER TABLE dbo.Users
    ADD avatarUrl NVARCHAR(255) NULL;
    PRINT N'Đã thêm thành công cột avatarUrl NVARCHAR(255) NULL vào bảng dbo.Users.';
END
ELSE
BEGIN
    PRINT N'Cột avatarUrl đã tồn tại trong bảng dbo.Users, giữ nguyên cấu trúc.';
END;
GO

-- 3. Cấp quyền UPDATE (và các quyền cần thiết) trên bảng dbo.Users cho tài khoản sv_app
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.Users TO sv_app;
PRINT N'Đã đảm bảo tài khoản sv_app có quyền trên dbo.Users.';
GO

-- 4. Lệnh SELECT xác minh dữ liệu và cấu trúc bảng
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    CHARACTER_MAXIMUM_LENGTH, 
    IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Users' AND TABLE_SCHEMA = 'dbo';
GO

-- 5. Xem 10 bản ghi đầu tiên để chứng minh số lượng User cũ giữ nguyên
SELECT TOP (10) id, fullName, email, role, avatarUrl FROM dbo.Users;
GO
