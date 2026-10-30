-- =======================================================================
-- BÀI THỰC HÀNH CHƯƠNG 08: MỞ RỘNG BUỔI 10 - STORED PROCEDURE
-- File: sql/07-sp-thong-ke.sql
-- Mục đích: Tạo thủ tục chỉ đọc dbo.sp_ThongKeSinhVienTheoLop
-- =======================================================================

USE QuanLySinhVienDB;
GO

IF OBJECT_ID('dbo.sp_ThongKeSinhVienTheoLop', 'P') IS NOT NULL
BEGIN
    DROP PROCEDURE dbo.sp_ThongKeSinhVienTheoLop;
END
GO

CREATE PROCEDURE dbo.sp_ThongKeSinhVienTheoLop
AS
BEGIN
    SET NOCOUNT ON;
    SELECT maLop, COUNT(*) AS totalStudents
    FROM dbo.SinhVien
    GROUP BY maLop
    ORDER BY maLop ASC;
END;
GO
