# =======================================================================
# SCRIPT TỰ ĐỘNG THIẾT LẬP CƠ SỞ DỮ LIỆU SQL SERVER - CHƯƠNG 06
# Dự án: Backend Quản Lý Sinh Viên (Authentication & RBAC)
# Chức năng:
#   1. Cấu hình TCP/IP, Cổng mạng và Mixed Mode cho SQLEXPRESS
#   2. Tự động thực thi toàn bộ script SQL (01 -> 04-users-auth.sql)
#   3. Seed tài khoản Admin (admin@example.com / Admin@123)
#   4. Kiểm tra kết nối CSDL với Sequelize
# =======================================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "Setup SQL Server - Chuong 06 (Auth & RBAC)"

Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host "   HE THONG THIET LAP CO SO DU LIEU SQL SERVER - CHUONG 06            " -ForegroundColor Cyan
Write-Host "   Backend Quan Ly Sinh Vien (JWT - Middleware - Phan Quyen RBAC)    " -ForegroundColor Cyan
Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host ""

# Thư mục gốc dự án
$ProjectRoot = $PSScriptRoot
if (-not $ProjectRoot) { $ProjectRoot = Get-Location }

# Đọc cấu hình từ file .env nếu có
$EnvFile = Join-Path $ProjectRoot ".env"
$DbPort = "14333"
$DbHost = "127.0.0.1"
$DbName = "QuanLySinhVienDB"

if (Test-Path $EnvFile) {
    Write-Host "[INFO] Dang doc cau hinh tu file .env..." -ForegroundColor Yellow
    Get-Content $EnvFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#")) {
            if ($line -match "^DB_PORT\s*=\s*(.+)$") { $DbPort = $matches[1].Trim('"''') }
            if ($line -match "^DB_HOST\s*=\s*(.+)$") { $DbHost = $matches[1].Trim('"''') }
            if ($line -match "^DB_NAME\s*=\s*(.+)$") { $DbName = $matches[1].Trim('"''') }
        }
    }
}

Write-Host "[INFO] Cong ket noi CSDL du kien: $DbPort" -ForegroundColor Green
Write-Host "[INFO] Ten CSDL: $DbName" -ForegroundColor Green
Write-Host ""

# -----------------------------------------------------------------------
# BƯỚC 1: CẤU HÌNH REGISTRY & DỊCH VỤ SQL SERVER (NẾU CÓ QUYỀN ADMIN)
# -----------------------------------------------------------------------
Write-Host "--- BUOC 1: KIEM TRA & CAU HINH DICH VU SQL SERVER ---" -ForegroundColor Cyan

$IsAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
$ServiceRestarted = $false

# Tìm đường dẫn Registry của instance SQLEXPRESS
$RegBases = @(
    'HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL16.SQLEXPRESS',
    'HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL15.SQLEXPRESS',
    'HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL14.SQLEXPRESS'
)

$FoundReg = $null
foreach ($base in $RegBases) {
    if (Test-Path $base) {
        $FoundReg = $base
        break
    }
}

if ($IsAdmin -and $FoundReg) {
    try {
        Write-Host "[1.1] Bat giao thuc TCP/IP..." -ForegroundColor Yellow
        Set-ItemProperty -Path "$FoundReg\MSSQLServer\SuperSocketNetLib\Tcp" -Name 'Enabled' -Value 1 -ErrorAction SilentlyContinue

        Write-Host "[1.2] Cau hinh cong TCP $DbPort va tat Dynamic Ports..." -ForegroundColor Yellow
        Set-ItemProperty -Path "$FoundReg\MSSQLServer\SuperSocketNetLib\Tcp\IPAll" -Name 'TcpPort' -Value $DbPort -ErrorAction SilentlyContinue
        Set-ItemProperty -Path "$FoundReg\MSSQLServer\SuperSocketNetLib\Tcp\IPAll" -Name 'TcpDynamicPorts' -Value '' -ErrorAction SilentlyContinue

        Write-Host "[1.3] Bat che do xac thuc hon hop (Mixed Mode: SQL & Windows)..." -ForegroundColor Yellow
        Set-ItemProperty -Path "$FoundReg\MSSQLServer\MSSQLServer" -Name 'LoginMode' -Value 2 -ErrorAction SilentlyContinue

        # Kiểm tra trạng thái service và khởi động lại nếu đang chạy
        $SqlService = Get-Service -Name 'MSSQL$SQLEXPRESS' -ErrorAction SilentlyContinue
        if ($SqlService) {
            Write-Host "[1.4] Khoi dong lai dich vu MSSQL`$SQLEXPRESS de ap dung..." -ForegroundColor Yellow
            Restart-Service -Name 'MSSQL$SQLEXPRESS' -Force
            $ServiceRestarted = $true
            Write-Host "[OK] Da khoi dong lai dich vu SQL Server thanh cong!" -ForegroundColor Green
        }
    } catch {
        Write-Warning "Khong the cap nhat Registry hoac khoi dong lai Service: $($_.Exception.Message)"
    }
} else {
    if (-not $IsAdmin) {
        Write-Host "[NOTE] Script dang chay khong co quyen Admin, bo qua buoc sua Registry (CSDL hien tai van hoat dong)." -ForegroundColor Gray
    }
}

# -----------------------------------------------------------------------
# BƯỚC 2: CHẠY CÁC SCRIPT TẠO BẢNG & PHÂN QUYỀN TRỌNG TÂM CHƯƠNG 06
# -----------------------------------------------------------------------
Write-Host ""
Write-Host "--- BUOC 2: THUC THI CAC SCRIPT CSDL CHUONG 06 ---" -ForegroundColor Cyan

$SqlCmdExe = (Get-Command sqlcmd -ErrorAction SilentlyContinue).Source
if (-not $SqlCmdExe) {
    $DefaultSqlCmd = "C:\Program Files\Microsoft SQL Server\Client SDK\ODBC\170\Tools\Binn\SQLCMD.EXE"
    if (Test-Path $DefaultSqlCmd) { $SqlCmdExe = $DefaultSqlCmd }
}

if (-not $SqlCmdExe) {
    Write-Warning "Khong tim thay cong cu sqlcmd tren may. Vui long mo SSMS va chay lan luot cac file trong thu muc sql/."
} else {
    Write-Host "[INFO] Su dung sqlcmd tai: $SqlCmdExe" -ForegroundColor Gray
    $ServerParam = "127.0.0.1,$DbPort"

    $SqlScripts = @(
        @{ Name = "01-quan-ly-sinh-vien.sql"; Desc = "Tao CSDL & Bang dbo.SinhVien" },
        @{ Name = "02-seed.sql";              Desc = "Nap du lieu mau SinhVien" },
        @{ Name = "03-app-login.sql";         Desc = "Tao Login & User sv_app cap quyen" },
        @{ Name = "04-lop-va-quan-he.sql";    Desc = "Bang dbo.Lop & Khoa ngoai FK" },
        @{ Name = "04-users-auth.sql";        Desc = "[TRONG TAM CHUONG 06] Bang dbo.Users & Cap quyen sv_app" }
    )

    foreach ($item in $SqlScripts) {
        $filePath = Join-Path $ProjectRoot "sql\$($item.Name)"
        if (Test-Path $filePath) {
            Write-Host "[SQL] Dang chay $($item.Name) ($($item.Desc))..." -ForegroundColor Yellow
            try {
                # Chạy sqlcmd với Windows Authentication (-E)
                $output = & $SqlCmdExe -S $ServerParam -E -i $filePath -b 2>&1
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "      -> Thanh cong!" -ForegroundColor Green
                } else {
                    # Thử lại với tài khoản sv_app
                    Write-Host "      -> Thu lai voi tai khoan sv_app..." -ForegroundColor Gray
                    $output2 = & $SqlCmdExe -S $ServerParam -U sv_app -P "AppPassword123!" -i $filePath -b 2>&1
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "      -> Thanh cong qua sv_app!" -ForegroundColor Green
                    } else {
                        Write-Host "      -> Canh bao / Bo qua neu da ton tai: $output" -ForegroundColor Gray
                    }
                }
            } catch {
                Write-Host "      -> Loi: $($_.Exception.Message)" -ForegroundColor Red
            }
        } else {
            Write-Warning "Khong tim thay file: $filePath"
        }
    }
}

# -----------------------------------------------------------------------
# BƯỚC 3: SEED TÀI KHOẢN ADMIN (admin@example.com / Admin@123)
# -----------------------------------------------------------------------
Write-Host ""
Write-Host "--- BUOC 3: SEED TAI KHOAN QUAN TRI VIEN (ADMIN) ---" -ForegroundColor Cyan

$SeedAdminScript = Join-Path $ProjectRoot "src\scripts\seed-admin.ts"
if (Test-Path $SeedAdminScript) {
    Write-Host "[SEED] Dang tao/cap nhat tai khoan Admin trong CSDL..." -ForegroundColor Yellow
    try {
        if (Get-Command pnpm -ErrorAction SilentlyContinue) {
            & pnpm seed:admin
        } else {
            & npm run seed:admin
        }
        Write-Host "[OK] Da hoan tat seed tai khoan Admin!" -ForegroundColor Green
    } catch {
        Write-Warning "Khong the chay seed:admin tu dong: $($_.Exception.Message)"
    }
}

# -----------------------------------------------------------------------
# BƯỚC 4: KIỂM TRA KẾT NỐI TOÀN DIỆN VỚI SEQUELIZE
# -----------------------------------------------------------------------
Write-Host ""
Write-Host "--- BUOC 4: KIEM TRA KET NOI CSDL & TRANG THAI MODEL ---" -ForegroundColor Cyan

try {
    if (Get-Command pnpm -ErrorAction SilentlyContinue) {
        & pnpm check:db
    } else {
        & npm run check:db
    }
} catch {
    Write-Warning "Loi khi kiem tra check:db: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "=======================================================================" -ForegroundColor Green
Write-Host " HOAN TAT THIET LAP CSDL CHO BAI TAP CHUONG 06 (AUTH & RBAC)!" -ForegroundColor Green
Write-Host "   - CSDL: $DbName (Port: $DbPort)" -ForegroundColor Green
Write-Host "   - Bang da san sang: dbo.SinhVien, dbo.Lop, dbo.Users" -ForegroundColor Green
Write-Host "   - Tai khoan Admin: admin@example.com / Admin@123 (role: admin)" -ForegroundColor Green
Write-Host "   - Khoi dong server: pnpm dev (hoac npm run dev)" -ForegroundColor Green
Write-Host "=======================================================================" -ForegroundColor Green
Write-Host ""
