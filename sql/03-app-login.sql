-- =======================================================================
-- BÀI THỰC HÀNH BUỔI 4: KẾT NỐI SQL SERVER & SEQUELIZE ORM
-- File: sql/03-app-login.sql
-- Mục đích: Tạo tài khoản chuyên dụng sv_app và phân quyền tối thiểu (SELECT, INSERT)
-- =======================================================================

-- Lưu ý: Hãy chạy script này bằng tài khoản Quản trị (sa hoặc Windows Authentication)

-- 1. Tạo Login sv_app ở cấp độ Server (nằm trong master)
USE master;
GO

IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = N'sv_app')
BEGIN
    -- Thay 'MAT_KHAU_LOCAL_CUA_BAN' bằng mật khẩu local của bạn trước khi chạy
    CREATE LOGIN sv_app WITH PASSWORD = N'MAT_KHAU_LOCAL_CUA_BAN', CHECK_POLICY = OFF;
    PRINT N'Đã tạo mới Login sv_app.';
END
ELSE
BEGIN
    PRINT N'Login sv_app đã tồn tại sẵn, giữ nguyên.';
END
GO

-- 2. Tạo User sv_app trong Database QuanLySinhVienDB và cấp quyền
USE QuanLySinhVienDB;
GO

IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = N'sv_app')
BEGIN
    CREATE USER sv_app FOR LOGIN sv_app;
    PRINT N'Đã tạo mới User sv_app trong Database QuanLySinhVienDB.';
END
ELSE
BEGIN
    PRINT N'User sv_app đã tồn tại sẵn trong Database QuanLySinhVienDB.';
END
GO

-- 3. Cấp quyền truy cập cho ứng dụng: Đầy đủ 4 thao tác CRUD (SELECT, INSERT, UPDATE, DELETE) trên dbo.SinhVien
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.SinhVien TO sv_app;
PRINT N'Đã cấp quyền SELECT, INSERT, UPDATE, DELETE trên bảng dbo.SinhVien cho sv_app thành công.';
GO
