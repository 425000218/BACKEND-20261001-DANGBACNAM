# Script tự động cấu hình SQL Server SQLEXPRESS cho Buổi 4
# Cần chạy với quyền Administrator (Run as Administrator)

Write-Host "Dang cau hinh SQL Server SQLEXPRESS..." -ForegroundColor Cyan

# 1. Bật TCP/IP
Set-ItemProperty -Path 'HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQLServer\SuperSocketNetLib\Tcp' -Name 'Enabled' -Value 1

# 2. Cấu hình IPAll lắng nghe tại cổng TCP 1433
Set-ItemProperty -Path 'HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQLServer\SuperSocketNetLib\Tcp\IPAll' -Name 'TcpPort' -Value '1433'
Set-ItemProperty -Path 'HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQLServer\SuperSocketNetLib\Tcp\IPAll' -Name 'TcpDynamicPorts' -Value ''

# 3. Bật chế độ xác thực Mixed Mode (SQL Server and Windows Authentication)
Set-ItemProperty -Path 'HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQLServer' -Name 'LoginMode' -Value 2

# 4. Khởi động lại dịch vụ SQL Server để áp dụng
Write-Host "Dang khoi dong lai dich vu MSSQL`$SQLEXPRESS..." -ForegroundColor Yellow
Restart-Service -Name 'MSSQL$SQLEXPRESS' -Force

Write-Host "Hoan tat cau hinh! Cong 1433 va Mixed Mode da san sang." -ForegroundColor Green
