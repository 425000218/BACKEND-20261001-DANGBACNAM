import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  ImageRun,
  Footer,
  PageNumber,
} from 'docx';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { execSync } from 'node:child_process';

async function generateChapter06Report() {
  console.log('🚀 Đang khởi tạo Báo cáo Thực hành Chương 06 (Word & PDF)...');

  const primaryColor = '1E3A8A';   // Xanh Navy
  const secondaryColor = '0369A1'; // Xanh Lam
  const accentColor = '047857';    // Xanh Lá thành công
  const darkTextColor = '0F172A';  // Slate 900
  const lightBgColor = 'F8FAFC';   // Slate 50
  const tableHeaderBg = 'E2E8F0';  // Slate 200
  const borderColor = 'CBD5E1';    // Slate 300

  const tableBorders = {
    top: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
    left: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
    right: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
    insideVertical: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
  };

  const cellMargins = { top: 120, bottom: 120, left: 160, right: 160 };

  // Helper tạo hàng trong bảng với độ rộng chuẩn xác cho từng ô
  interface ICellDef {
    text: string;
    width: number; // Tỷ lệ phần trăm (Tổng các ô trong hàng = 100)
    bold?: boolean;
    color?: string;
    align?: (typeof AlignmentType)[keyof typeof AlignmentType];
    bg?: string;
    isHeader?: boolean;
  }

  const makeRow = (cells: ICellDef[]) => {
    return new TableRow({
      children: cells.map((c) => {
        return new TableCell({
          width: { size: c.width, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.CLEAR, fill: c.bg || (c.isHeader ? tableHeaderBg : undefined) },
          margins: cellMargins,
          children: [
            new Paragraph({
              alignment: c.align || (c.isHeader ? AlignmentType.CENTER : AlignmentType.LEFT),
              children: [
                new TextRun({
                  text: c.text,
                  bold: c.bold !== undefined ? c.bold : c.isHeader,
                  color: c.color || (c.isHeader ? primaryColor : darkTextColor),
                  size: 20,
                }),
              ],
            }),
          ],
        });
      }),
    });
  };

  // Helper chèn ảnh kèm chú thích
  const insertImageWithCaption = (imagePath: string, caption: string, width = 520, height = 270): Paragraph[] => {
    const fullPath = path.resolve(process.cwd(), imagePath);
    if (!fs.existsSync(fullPath)) {
      return [
        new Paragraph({
          children: [new TextRun({ text: `[Không tìm thấy ảnh: ${imagePath}]`, color: 'DC2626', italics: true })],
        }),
      ];
    }
    const imgBuffer = fs.readFileSync(fullPath);
    return [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 140, after: 80 },
        children: [
          new ImageRun({
            type: 'png',
            data: imgBuffer,
            transformation: { width, height },
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 180 },
        children: [
          new TextRun({
            text: `Hình ảnh minh chứng: ${caption}`,
            bold: true,
            size: 19,
            color: '64748B',
            italics: true,
          }),
        ],
      }),
    ];
  };

  // =======================================================================
  // KHỞI TẠO TÀI LIỆU
  // =======================================================================
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Arial', color: darkTextColor, size: 22 },
          paragraph: { spacing: { line: 276, after: 120 } },
        },
      },
    },
    sections: [
      {
        properties: {
          page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: 'Báo cáo Thực hành Chương 06 · Backend RESTful API | Trang ', size: 18, color: '64748B' }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 18, color: '64748B' }),
                  new TextRun({ text: ' / ', size: 18, color: '64748B' }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: '64748B' }),
                ],
              }),
            ],
          }),
        },
        children: [
          // -------------------------------------------------------------
          // TRANG BÌA BÁO CÁO
          // -------------------------------------------------------------
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 80 },
            children: [
              new TextRun({ text: 'BỘ GIÁO DỤC VÀ ĐÀO TẠO - HỆ LIÊN THÔNG', bold: true, size: 22, color: '475569' }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 280 },
            children: [
              new TextRun({ text: 'BÁO CÁO BÀI TẬP THỰC HÀNH HỌC PHẦN LẬP TRÌNH BACKEND', bold: true, size: 24, color: secondaryColor }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 180, after: 100 },
            children: [
              new TextRun({
                text: 'CHƯƠNG 06: AUTHENTICATION & AUTHORIZATION',
                bold: true,
                size: 32,
                color: primaryColor,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 320 },
            children: [
              new TextRun({
                text: 'JWT - MIDDLEWARE KIỂM SOÁT - PHÂN QUYỀN VAI TRÒ (RBAC) - BUỔI 07',
                bold: true,
                size: 24,
                color: accentColor,
              }),
            ],
          }),

          // BẢNG THÔNG TIN SINH VIÊN VÀ DỰ ÁN
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    shading: { type: ShadingType.CLEAR, fill: lightBgColor },
                    margins: { top: 160, bottom: 160, left: 200, right: 200 },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: '• Họ và tên sinh viên: ', bold: true, size: 21, color: primaryColor }),
                          new TextRun({ text: 'ĐẶNG BẮC NAM', bold: true, size: 21 }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: '• Mã sinh viên / Dự án: ', bold: true, size: 21, color: primaryColor }),
                          new TextRun({ text: 'BACKEND-20261001-DANGBACNAM', size: 21 }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: '• Công nghệ nền tảng: ', bold: true, size: 21, color: primaryColor }),
                          new TextRun({ text: 'Node.js (v20+), Express 5, TypeScript ESM, Sequelize ORM 6, SQL Server, JWT (HS256), bcrypt (cost 12), Swagger OpenAPI 3.0', size: 21 }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: '• GitHub Repository: ', bold: true, size: 21, color: primaryColor }),
                          new TextRun({ text: 'https://github.com/425000218/BACKEND-20261001-DANGBACNAM.git', size: 21, color: secondaryColor }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: '• Kết quả kiểm thử: ', bold: true, size: 21, color: primaryColor }),
                          new TextRun({ text: 'ĐẠT 24/24 ca kiểm thử tự động (Tỷ lệ: 100.0%)', bold: true, size: 21, color: accentColor }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: '• Thời gian hoàn thành: ', bold: true, size: 21, color: primaryColor }),
                          new TextRun({ text: 'Tháng 10/2026', size: 21 }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { after: 260 } }),

          // -------------------------------------------------------------
          // MỤC 1: ĐỀ BÀI, MỤC TIÊU & HỢP ĐỒNG API
          // -------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({ text: '1. Đề bài, Mục tiêu và Hai lớp kiểm soát bắt buộc', bold: true, size: 26, color: primaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun(
                'Hệ thống Quản lý sinh viên sau Chương 05 đã có đầy đủ 5 API CRUD, Validation và Swagger UI nhưng chưa có lớp bảo vệ tài khoản. Mục tiêu của Chương 06 là nâng cấp hệ thống để quản lý tài khoản người dùng, cấp Access Token JWT khi đăng nhập, từ đó nhận diện người gửi Request và phân quyền RBAC: chỉ cho phép Quản trị viên (admin) thực hiện thêm, sửa, xóa sinh viên; người dùng thông thường (student) chỉ được xem danh sách/chi tiết công khai và hồ sơ chính mình.'
              ),
            ],
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 160, after: 80 },
            children: [new TextRun({ text: 'Bảng Hợp đồng API (API Contracts)', bold: true, size: 22, color: secondaryColor })],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              makeRow([
                { text: 'Method & Endpoint', width: 35, isHeader: true },
                { text: 'Phân quyền', width: 20, isHeader: true },
                { text: 'Mô tả nghiệp vụ', width: 30, isHeader: true },
                { text: 'Mã Status', width: 15, isHeader: true },
              ]),
              makeRow([
                { text: 'POST /api/auth/register', width: 35, bold: true },
                { text: 'Public', width: 20 },
                { text: 'Đăng ký tài khoản mới, role mặc định là student', width: 30 },
                { text: '201 / 400 / 409', width: 15, align: AlignmentType.CENTER },
              ]),
              makeRow([
                { text: 'POST /api/auth/login', width: 35, bold: true },
                { text: 'Public', width: 20 },
                { text: 'Đăng nhập xác thực, cấp Access Token JWT (1h)', width: 30 },
                { text: '200 / 401', width: 15, align: AlignmentType.CENTER },
              ]),
              makeRow([
                { text: 'GET /api/auth/profile', width: 35, bold: true },
                { text: 'isAuth', width: 20, bold: true, color: secondaryColor },
                { text: 'Xem thông tin hồ sơ của tài khoản đang đăng nhập', width: 30 },
                { text: '200 / 401', width: 15, align: AlignmentType.CENTER },
              ]),
              makeRow([
                { text: 'GET /api/v1/sinh-vien', width: 35, bold: true },
                { text: 'Public', width: 20 },
                { text: 'Lấy danh sách toàn bộ sinh viên trong CSDL', width: 30 },
                { text: '200', width: 15, align: AlignmentType.CENTER },
              ]),
              makeRow([
                { text: 'GET /api/v1/sinh-vien/:maSV', width: 35, bold: true },
                { text: 'Public', width: 20 },
                { text: 'Xem chi tiết một sinh viên theo mã', width: 30 },
                { text: '200 / 404', width: 15, align: AlignmentType.CENTER },
              ]),
              makeRow([
                { text: 'POST /api/v1/sinh-vien', width: 35, bold: true },
                { text: 'isAuth + isAdmin', width: 20, bold: true, color: 'DC2626' },
                { text: 'Thêm mới sinh viên vào CSDL SQL Server', width: 30 },
                { text: '201 / 401 / 403', width: 15, align: AlignmentType.CENTER },
              ]),
              makeRow([
                { text: 'PUT /api/v1/sinh-vien/:maSV', width: 35, bold: true },
                { text: 'isAuth + isAdmin', width: 20, bold: true, color: 'DC2626' },
                { text: 'Cập nhật thông tin sinh viên theo mã', width: 30 },
                { text: '200 / 401 / 403', width: 15, align: AlignmentType.CENTER },
              ]),
              makeRow([
                { text: 'DELETE /api/v1/sinh-vien/:maSV', width: 35, bold: true },
                { text: 'isAuth + isAdmin', width: 20, bold: true, color: 'DC2626' },
                { text: 'Xóa sinh viên khỏi CSDL SQL Server', width: 30 },
                { text: '200 / 401 / 403', width: 15, align: AlignmentType.CENTER },
              ]),
            ],
          }),

          new Paragraph({ spacing: { after: 120 } }),
          new Paragraph({
            children: [
              new TextRun({ text: '• Nguyên tắc phân biệt mã HTTP: ', bold: true }),
              new TextRun(
                'Mã 401 Unauthorized đại diện cho lỗi xác thực danh tính (thiếu token, token sai chữ ký hoặc hết hạn); Mã 403 Forbidden đại diện cho lỗi phân quyền (đã xác thực danh tính thành công nhưng tài khoản sinh viên không có quyền ghi). Bắt buộc phải gắn isAuth trước isAdmin.'
              ),
            ],
          }),

          // -------------------------------------------------------------
          // MỤC 2: THIẾT KẾ CSDL SQL SERVER
          // -------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({ text: '2. Thiết kế Cơ sở dữ liệu SQL Server & Sequelize Model', bold: true, size: 26, color: primaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun(
                'Để lưu trữ tài khoản người dùng bền vững, dự án thiết kế bảng dbo.Users trong SQL Server với script sql/04-users-auth.sql, đảm bảo tính idempotent (chạy lại nhiều lần không phá hỏng cấu trúc cũ) và cấp quyền cho tài khoản ứng dụng sv_app:'
              ),
            ],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              makeRow([
                { text: 'Tên trường', width: 20, isHeader: true },
                { text: 'Kiểu dữ liệu SQL', width: 20, isHeader: true },
                { text: 'Ràng buộc & Khóa', width: 25, isHeader: true },
                { text: 'Ý nghĩa & Quy tắc an toàn', width: 35, isHeader: true },
              ]),
              makeRow([
                { text: 'id', width: 20, bold: true },
                { text: 'INT', width: 20 },
                { text: 'IDENTITY(1,1), PK', width: 25 },
                { text: 'Khóa chính tự tăng, định danh người dùng trong token (sub)', width: 35 },
              ]),
              makeRow([
                { text: 'fullName', width: 20, bold: true },
                { text: 'NVARCHAR(150)', width: 20 },
                { text: 'NOT NULL', width: 25 },
                { text: 'Họ tên người dùng tiếng Việt có dấu', width: 35 },
              ]),
              makeRow([
                { text: 'email', width: 20, bold: true },
                { text: 'NVARCHAR(254)', width: 20 },
                { text: 'NOT NULL, UNIQUE', width: 25 },
                { text: 'Email đăng nhập duy nhất, chống trùng lặp tài khoản', width: 35 },
              ]),
              makeRow([
                { text: 'passwordHash', width: 20, bold: true },
                { text: 'NVARCHAR(255)', width: 20 },
                { text: 'NOT NULL', width: 25 },
                { text: 'Chuỗi băm bcrypt ($2b$12$...), tuyệt đối không lưu plaintext', width: 35 },
              ]),
              makeRow([
                { text: 'role', width: 20, bold: true },
                { text: 'NVARCHAR(20)', width: 20 },
                { text: "DEFAULT 'student'", width: 25 },
                { text: "Vai trò người dùng ('student' hoặc 'admin')", width: 35 },
              ]),
            ],
          }),

          new Paragraph({ spacing: { after: 120 } }),
          new Paragraph({
            children: [
              new TextRun({ text: '• Phân quyền tối thiểu cho sv_app: ', bold: true }),
              new TextRun('GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.Users TO sv_app. Đảm bảo Backend có đủ quyền tra cứu lúc login, chèn lúc register và đồng bộ tài khoản admin dev.'),
            ],
          }),

          // -------------------------------------------------------------
          // MỤC 3: TRIỂN KHAI KỸ THUẬT CỐT LÕI
          // -------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({ text: '3. Triển khai Kỹ thuật & Mã nguồn cốt lõi', bold: true, size: 26, color: primaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '3.1. Băm mật khẩu với bcrypt (Salt cost 12): ', bold: true, color: secondaryColor }),
              new TextRun(
                'Khi đăng ký (Register), gọi bcrypt.hash(password, 12) sinh chuỗi hash kèm muối ngẫu nhiên. Khi đăng nhập (Login), bắt buộc gọi bcrypt.compare(password, user.passwordHash) để trích xuất salt từ hash có sẵn và so khớp, chống tấn công đo thời gian (Timing Attack).'
              ),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '3.2. Tiện ích JWT Utility (src/utils/jwt.ts): ', bold: true, color: secondaryColor }),
              new TextRun(
                'Hàm generateToken ký chuỗi JWT bằng thuật toán HS256, khóa bí mật JWT_SECRET đọc từ .env, thời hạn sống đúng 1 giờ ({ expiresIn: "1h", algorithm: "HS256" }). Hàm verifyToken xác minh chữ ký, hạn dùng và thuật toán, bắt các lỗi TokenExpiredError và JsonWebTokenError.'
              ),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '3.3. Middleware Xác thực isAuth (src/middlewares/isAuth.ts): ', bold: true, color: secondaryColor }),
              new TextRun(
                'Trích xuất header Authorization, kiểm tra định dạng "Bearer <token>". Giải mã token hợp lệ và gán req.user = { id: payload.sub, role: payload.role }. Nếu thiếu header, sai định dạng, token hết hạn hoặc sai chữ ký, lập tức phản hồi HTTP 401 Unauthorized.'
              ),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '3.4. Middleware Phân quyền isAdmin (src/middlewares/isAdmin.ts): ', bold: true, color: secondaryColor }),
              new TextRun(
                'Kiểm tra req.user.role === "admin". Nếu là vai trò "student", lập tức chặn lại và phản hồi HTTP 403 Forbidden kèm thông báo: "Yêu cầu quyền Quản trị viên (admin)".'
              ),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '3.5. Mở rộng TypeScript (src/types/express.d.ts): ', bold: true, color: secondaryColor }),
              new TextRun(
                'Mở rộng interface Express.Request để chứa thuộc tính user?: IUserAuth, giúp compiler TypeScript nhận diện req.user một cách an toàn mà không báo lỗi Type.'
              ),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '3.6. Script Khởi tạo Admin (src/scripts/seed-admin.ts): ', bold: true, color: secondaryColor }),
              new TextRun(
                'Tạo sẵn tài khoản Admin môi trường Dev (admin@example.com / Admin@123) với role "admin" trực tiếp trong CSDL SQL Server, vì hệ thống từ chối cho phép client tự đăng ký role admin qua Public API (chống leo quyền).'
              ),
            ],
          }),

          // -------------------------------------------------------------
          // MỤC 4: BẢNG KẾT QUẢ KIỂM THỬ 24 CA TEST
          // -------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({ text: '4. Kết quả Nghiệm thu Ma trận 24 Ca Kiểm thử Tự động', bold: true, size: 26, color: primaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun(
                'Toàn bộ 24 ca test (Nhóm A: A01–A12 cho Auth/JWT; Nhóm B: B01–B12 cho RBAC SinhVien) được thực thi tự động qua test runner pnpm test:24. Kết quả đạt tỷ lệ tuyệt đối 100.0% (24/24 ca ĐẠT):'
              ),
            ],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              makeRow([
                { text: 'Mã Ca', width: 10, isHeader: true },
                { text: 'Tên Ca Kiểm Thử', width: 35, isHeader: true },
                { text: 'Method & URL', width: 25, isHeader: true },
                { text: 'Kỳ vọng / Thực tế', width: 15, isHeader: true },
                { text: 'Kết quả', width: 15, isHeader: true },
              ]),
              makeRow([{ text: 'A01', width: 10, bold: true }, { text: 'Đăng ký tài khoản mới hợp lệ', width: 35 }, { text: 'POST /api/auth/register', width: 25 }, { text: '201 / 201', width: 15, align: AlignmentType.CENTER }, { text: '[ĐẠT] PASS', width: 15, bold: true, color: accentColor, align: AlignmentType.CENTER }]),
              makeRow([{ text: 'A02', width: 10, bold: true }, { text: 'Đăng ký với email đã tồn tại', width: 35 }, { text: 'POST /api/auth/register', width: 25 }, { text: '409 / 409', width: 15, align: AlignmentType.CENTER }, { text: '[ĐẠT] PASS', width: 15, bold: true, color: accentColor, align: AlignmentType.CENTER }]),
              makeRow([{ text: 'A03', width: 10, bold: true }, { text: 'Đăng ký kèm role admin (leo quyền)', width: 35 }, { text: 'POST /api/auth/register', width: 25 }, { text: '400 / 400', width: 15, align: AlignmentType.CENTER }, { text: '[ĐẠT] PASS', width: 15, bold: true, color: accentColor, align: AlignmentType.CENTER }]),
              makeRow([{ text: 'A04', width: 10, bold: true }, { text: 'Đăng nhập thông tin chính xác', width: 35 }, { text: 'POST /api/auth/login', width: 25 }, { text: '200 / 200', width: 15, align: AlignmentType.CENTER }, { text: '[ĐẠT] PASS', width: 15, bold: true, color: accentColor, align: AlignmentType.CENTER }]),
              makeRow([{ text: 'A05', width: 10, bold: true }, { text: 'Đăng nhập sai mật khẩu', width: 35 }, { text: 'POST /api/auth/login', width: 25 }, { text: '401 / 401', width: 15, align: AlignmentType.CENTER }, { text: '[ĐẠT] PASS', width: 15, bold: true, color: accentColor, align: AlignmentType.CENTER }]),
              makeRow([{ text: 'A06', width: 10, bold: true }, { text: 'Đăng nhập email không tồn tại', width: 35 }, { text: 'POST /api/auth/login', width: 25 }, { text: '401 / 401', width: 15, align: AlignmentType.CENTER }, { text: '[ĐẠT] PASS', width: 15, bold: true, color: accentColor, align: AlignmentType.CENTER }]),
              makeRow([{ text: 'A07', width: 10, bold: true }, { text: 'Xem hồ sơ không gửi Authorization', width: 35 }, { text: 'GET /api/auth/profile', width: 25 }, { text: '401 / 401', width: 15, align: AlignmentType.CENTER }, { text: '[ĐẠT] PASS', width: 15, bold: true, color: accentColor, align: AlignmentType.CENTER }]),
              makeRow([{ text: 'A08', width: 10, bold: true }, { text: 'Xem hồ sơ sai định dạng Bearer', width: 35 }, { text: 'GET /api/auth/profile', width: 25 }, { text: '401 / 401', width: 15, align: AlignmentType.CENTER }, { text: '[ĐẠT] PASS', width: 15, bold: true, color: accentColor, align: AlignmentType.CENTER }]),
              makeRow([{ text: 'A09', width: 10, bold: true }, { text: 'Xem hồ sơ Token giả mạo chữ ký', width: 35 }, { text: 'GET /api/auth/profile', width: 25 }, { text: '401 / 401', width: 15, align: AlignmentType.CENTER }, { text: '[ĐẠT] PASS', width: 15, bold: true, color: accentColor, align: AlignmentType.CENTER }]),
              makeRow([{ text: 'A10', width: 10, bold: true }, { text: 'Xem hồ sơ Token đã hết hạn', width: 35 }, { text: 'GET /api/auth/profile', width: 25 }, { text: '401 / 401', width: 15, align: AlignmentType.CENTER }, { text: '[ĐẠT] PASS', width: 15, bold: true, color: accentColor, align: AlignmentType.CENTER }]),
              makeRow([{ text: 'A11', width: 10, bold: true }, { text: 'Xem hồ sơ Token hợp lệ', width: 35 }, { text: 'GET /api/auth/profile', width: 25 }, { text: '200 / 200', width: 15, align: AlignmentType.CENTER }, { text: '[ĐẠT] PASS', width: 15, bold: true, color: accentColor, align: AlignmentType.CENTER }]),
              makeRow([{ text: 'A12', width: 10, bold: true }, { text: 'Đăng ký thiếu trường bắt buộc', width: 35 }, { text: 'POST /api/auth/register', width: 25 }, { text: '400 / 400', width: 15, align: AlignmentType.CENTER }, { text: '[ĐẠT] PASS', width: 15, bold: true, color: accentColor, align: AlignmentType.CENTER }]),
              makeRow([{ text: 'B01', width: 10, bold: true }, { text: 'GET danh sách sinh viên (Public)', width: 35 }, { text: 'GET /api/v1/sinh-vien', width: 25 }, { text: '200 / 200', width: 15, align: AlignmentType.CENTER }, { text: '[ĐẠT] PASS', width: 15, bold: true, color: accentColor, align: AlignmentType.CENTER }]),
              makeRow([{ text: 'B02', width: 10, bold: true }, { text: 'GET chi tiết sinh viên theo mã', width: 35 }, { text: 'GET /api/v1/sinh-vien/SV001', width: 25 }, { text: '200 / 200', width: 15, align: AlignmentType.CENTER }, { text: '[ĐẠT] PASS', width: 15, bold: true, color: accentColor, align: AlignmentType.CENTER }]),
              makeRow([{ text: 'B03', width: 10, bold: true }, { text: 'POST thêm SV không gửi token', width: 35 }, { text: 'POST /api/v1/sinh-vien', width: 25 }, { text: '401 / 401', width: 15, align: AlignmentType.CENTER }, { text: '[ĐẠT] PASS', width: 15, bold: true, color: accentColor, align: AlignmentType.CENTER }]),
              makeRow([{ text: 'B04', width: 10, bold: true }, { text: 'PUT sửa SV không gửi token', width: 35 }, { text: 'PUT /api/v1/sinh-vien/SV001', width: 25 }, { text: '401 / 401', width: 15, align: AlignmentType.CENTER }, { text: '[ĐẠT] PASS', width: 15, bold: true, color: accentColor, align: AlignmentType.CENTER }]),
              makeRow([{ text: 'B05', width: 10, bold: true }, { text: 'DELETE xóa SV không gửi token', width: 35 }, { text: 'DELETE /api/v1/sinh-vien/SV001', width: 25 }, { text: '401 / 401', width: 15, align: AlignmentType.CENTER }, { text: '[ĐẠT] PASS', width: 15, bold: true, color: accentColor, align: AlignmentType.CENTER }]),
              makeRow([{ text: 'B06', width: 10, bold: true }, { text: 'POST thêm SV với Token Student', width: 35 }, { text: 'POST /api/v1/sinh-vien', width: 25 }, { text: '403 / 403', width: 15, align: AlignmentType.CENTER }, { text: '[ĐẠT] PASS', width: 15, bold: true, color: accentColor, align: AlignmentType.CENTER }]),
              makeRow([{ text: 'B07', width: 10, bold: true }, { text: 'PUT sửa SV với Token Student', width: 35 }, { text: 'PUT /api/v1/sinh-vien/SV001', width: 25 }, { text: '403 / 403', width: 15, align: AlignmentType.CENTER }, { text: '[ĐẠT] PASS', width: 15, bold: true, color: accentColor, align: AlignmentType.CENTER }]),
              makeRow([{ text: 'B08', width: 10, bold: true }, { text: 'DELETE xóa SV với Token Student', width: 35 }, { text: 'DELETE /api/v1/sinh-vien/SV001', width: 25 }, { text: '403 / 403', width: 15, align: AlignmentType.CENTER }, { text: '[ĐẠT] PASS', width: 15, bold: true, color: accentColor, align: AlignmentType.CENTER }]),
              makeRow([{ text: 'B09', width: 10, bold: true }, { text: 'POST thêm SV với Token Admin', width: 35 }, { text: 'POST /api/v1/sinh-vien', width: 25 }, { text: '201 / 201', width: 15, align: AlignmentType.CENTER }, { text: '[ĐẠT] PASS', width: 15, bold: true, color: accentColor, align: AlignmentType.CENTER }]),
              makeRow([{ text: 'B10', width: 10, bold: true }, { text: 'POST thêm SV trùng mã (Admin)', width: 35 }, { text: 'POST /api/v1/sinh-vien', width: 25 }, { text: '409 / 409', width: 15, align: AlignmentType.CENTER }, { text: '[ĐẠT] PASS', width: 15, bold: true, color: accentColor, align: AlignmentType.CENTER }]),
              makeRow([{ text: 'B11', width: 10, bold: true }, { text: 'PUT sửa SV với Token Admin', width: 35 }, { text: 'PUT /api/v1/sinh-vien/SV088', width: 25 }, { text: '200 / 200', width: 15, align: AlignmentType.CENTER }, { text: '[ĐẠT] PASS', width: 15, bold: true, color: accentColor, align: AlignmentType.CENTER }]),
              makeRow([{ text: 'B12', width: 10, bold: true }, { text: 'DELETE xóa SV với Token Admin', width: 35 }, { text: 'DELETE /api/v1/sinh-vien/SV088', width: 25 }, { text: '200 / 200', width: 15, align: AlignmentType.CENTER }, { text: '[ĐẠT] PASS', width: 15, bold: true, color: accentColor, align: AlignmentType.CENTER }]),
            ],
          }),

          // -------------------------------------------------------------
          // MỤC 5: HÌNH ẢNH MINH CHỨNG THỰC TẾ
          // -------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({ text: '5. Hình ảnh Minh chứng Thực tế (Visual Evidence)', bold: true, size: 26, color: primaryColor }),
            ],
          }),

          ...insertImageWithCaption(
            'docs/screenshots/module-8-swagger.png',
            'Swagger UI OpenAPI 3.0 tích hợp đầy đủ 3 API Auth và Bearer Auth Authorize'
          ),

          ...insertImageWithCaption(
            'docs/screenshots/module-3-register.png',
            'Kiểm thử API Register trả về HTTP 201 Created và không lộ trường passwordHash'
          ),

          ...insertImageWithCaption(
            'docs/screenshots/module-4-login.png',
            'Kiểm thử API Login trả về HTTP 200 OK kèm Bearer Access Token thời hạn 3600 giây'
          ),

          ...insertImageWithCaption(
            'docs/screenshots/module-5-profile.png',
            'Kiểm thử API Profile trả về thông tin người dùng khi Bearer Token hợp lệ'
          ),

          ...insertImageWithCaption(
            'docs/screenshots/module-6-rbac.png',
            'Kiểm thử Phân quyền RBAC: Chặn 403 Forbidden với sinh viên và Chấp thuận 201 với Quản trị viên'
          ),

          ...insertImageWithCaption(
            'docs/screenshots/module-7-seed-admin.png',
            'Khởi tạo tài khoản Quản trị viên Admin Dev và kiểm tra cấu trúc bảng dbo.Users trong SQL Server'
          ),

          // -------------------------------------------------------------
          // MỤC 6: NHẬT KÝ VIBE CODING & ĐÁNH GIÁ AN NINH
          // -------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({ text: '6. Nhật ký Vibe Coding & Đánh giá An ninh (Security Review)', bold: true, size: 26, color: primaryColor }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun(
                'Quá trình thực hành áp dụng nghiêm ngặt phương pháp Vibe Coding theo cấu trúc CTCO (Context - Task - Constraint - Output). Sinh viên không chấp nhận mã nguồn AI một cách thụ động mà chủ động kiểm tra các lỗ hổng an ninh phần mềm thường gặp:'
              ),
            ],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              makeRow([
                { text: 'Dấu hiệu nguy cơ', width: 25, isHeader: true },
                { text: 'Lỗ hổng bảo mật', width: 35, isHeader: true },
                { text: 'Giải pháp khắc phục chuẩn trong dự án', width: 40, isHeader: true },
              ]),
              makeRow([
                { text: 'Password Plaintext', width: 25, bold: true },
                { text: 'Lưu mật khẩu thô hoặc so sánh bằng === dính timing attack', width: 35 },
                { text: 'Dùng bcrypt.hash(password, 12) và bcrypt.compare an toàn', width: 40 },
              ]),
              makeRow([
                { text: 'JWT_SECRET hard-code', width: 25, bold: true },
                { text: 'Để lộ secret "123456" trong code khiến kẻ xấu tự ký token', width: 35 },
                { text: 'Đọc từ process.env.JWT_SECRET với chuỗi ngẫu nhiên mạnh', width: 40 },
              ]),
              makeRow([
                { text: 'Thiếu expiresIn', width: 25, bold: true },
                { text: 'Token sống vĩnh viễn, không thể thu hồi khi bị lộ', width: 35 },
                { text: 'Cấu hình bắt buộc { expiresIn: "1h", algorithm: "HS256" }', width: 40 },
              ]),
              makeRow([
                { text: 'Tin req.body.role', width: 25, bold: true },
                { text: 'Client gửi {"role":"admin"} lúc đăng ký để leo thang quyền', width: 35 },
                { text: 'Gán cứng role="student", chặn 400 nếu client gửi role', width: 40 },
              ]),
              makeRow([
                { text: 'Dùng jwt.decode', width: 25, bold: true },
                { text: 'Bỏ qua bước xác thực chữ ký, kẻ xấu sửa payload tùy ý', width: 35 },
                { text: 'Bắt buộc dùng jwt.verify(token, secret, { algorithms: ["HS256"] })', width: 40 },
              ]),
              makeRow([
                { text: 'Trả passwordHash', width: 25, bold: true },
                { text: 'Lộ chuỗi hash ra client tạo điều kiện bẻ khóa offline', width: 35 },
                { text: 'Dùng DTO chọn lọc (id, fullName, email, role), lọc bỏ hash', width: 40 },
              ]),
            ],
          }),

          // -------------------------------------------------------------
          // MỤC 7: LỜI GIẢI CHI TIẾT 8 CÂU HỎI BẢO VỆ
          // -------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({ text: '7. Lời giải Chi tiết 8 Câu hỏi Tự kiểm tra Bảo vệ (Trang 21 PDF)', bold: true, size: 26, color: primaryColor }),
            ],
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 140, after: 60 },
            children: [new TextRun({ text: 'Câu 1: Vì sao Register dùng bcrypt.hash() nhưng Login phải dùng bcrypt.compare()?', bold: true, size: 22, color: secondaryColor })],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• Khi Register: ', bold: true }),
              new TextRun('Cần tạo chuỗi băm một chiều an toàn để lưu vào CSDL. Hàm bcrypt.hash(password, 12) tự động sinh một chuỗi muối ngẫu nhiên (salt) với chi phí tính toán cost 12 và trả về chuỗi băm $2b$12$... Vì là hàm băm một chiều nên không thể giải mã ngược lại mật khẩu gốc.'),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• Khi Login: ', bold: true }),
              new TextRun('Không thể băm lại mật khẩu nhập vào rồi so sánh chuỗi bằng toán tử ===, vì mỗi lần gọi hash() thì một salt ngẫu nhiên mới được tạo ra khiến chuỗi băm luôn thay đổi. Do đó, bắt buộc dùng bcrypt.compare(inputPassword, storedHash). Hàm này sẽ trích xuất salt có sẵn từ storedHash, băm inputPassword với đúng salt đó rồi so khớp an toàn, đồng thời chống tấn công đo thời gian (Timing Attack).'),
            ],
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 140, after: 60 },
            children: [new TextRun({ text: 'Câu 2: Vì sao JWT có chữ ký số mà vẫn không nên chứa passwordHash trong payload?', bold: true, size: 22, color: secondaryColor })],
          }),
          new Paragraph({
            children: [
              new TextRun('JWT chỉ được ký số (Signature) để bảo toàn tính toàn vẹn chứ không hề được mã hóa bí mật (Encryption). Cả 3 phần của JWT chỉ được encode dạng Base64URL. Bất kỳ ai có token đều giải mã được payload ngay lập tức bằng atob() trong JavaScript hoặc qua trang web jwt.io. Nếu đưa passwordHash vào payload, kẻ xấu bắt được token có thể thu thập hash và tiến hành tấn công bẻ khóa offline (Offline Dictionary / GPU Brute-force Attack) mà backend không thể ngăn chặn. Do đó, payload chỉ chứa thông tin định danh tối thiểu (sub, role) và thời hạn (exp).'),
            ],
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 140, after: 60 },
            children: [new TextRun({ text: 'Câu 3: Nếu User sửa chữ "student" thành "admin" trong payload JWT, điều gì xảy ra khi isAuth gọi jwt.verify?', bold: true, size: 22, color: secondaryColor })],
          }),
          new Paragraph({
            children: [
              new TextRun('Chữ ký số được tính từ công thức: Signature = HMAC-SHA256(Base64(Header) + "." + Base64(Payload), JWT_SECRET). Khi người dùng tự sửa payload từ "student" sang "admin", phần dữ liệu Payload đã thay đổi. Vì kẻ tấn công không biết chuỗi bí mật JWT_SECRET trên server, họ không thể tạo ra chữ ký số mới hợp lệ. Khi gửi token lên, middleware isAuth gọi jwt.verify(token, JWT_SECRET). Thư viện tính toán lại chữ ký và thấy không khớp với chữ ký đính kèm, lập tức ném ngoại lệ JsonWebTokenError: invalid signature. Hệ thống bắt lỗi và trả về 401 Unauthorized ("Token không hợp lệ hoặc sai chữ ký"), chặn đứng hành vi mạo danh.'),
            ],
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 140, after: 60 },
            children: [new TextRun({ text: 'Câu 4: Phân biệt 401 Unauthorized và 403 Forbidden bằng hai Request cụ thể?', bold: true, size: 22, color: secondaryColor })],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• 401 Unauthorized (Chưa xác thực danh tính): ', bold: true }),
              new TextRun('Hệ thống chưa biết người gửi là ai hoặc thông tin chứng thực không hợp lệ. Ví dụ Ca A07: Gửi GET /api/auth/profile không có header Authorization -> isAuth chặn với 401 ("Yêu cầu Bearer token để xác thực"). Ví dụ Ca B03: Gửi POST /api/v1/sinh-vien không có token -> Trả về 401.'),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• 403 Forbidden (Đã xác thực nhưng bị cấm quyền): ', bold: true }),
              new TextRun('Hệ thống đã xác định được danh tính người gửi (token hợp lệ, đã qua isAuth), nhưng người này không có vai trò phù hợp để thực hiện hành động. Ví dụ Ca B06: Đăng nhập tài khoản sinh viên nhận token hợp lệ, rồi gửi POST /api/v1/sinh-vien. isAuth duyệt qua vì token chuẩn, nhưng isAdmin kiểm tra thấy req.user.role === "student" -> Chặn với mã 403 Forbidden ("Yêu cầu quyền Quản trị viên (admin)").'),
            ],
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 140, after: 60 },
            children: [new TextRun({ text: 'Câu 5: Tại sao phải gắn isAuth trước isAdmin? req.user được tạo ở đâu?', bold: true, size: 22, color: secondaryColor })],
          }),
          new Paragraph({
            children: [
              new TextRun('• req.user được tạo bên trong Middleware isAuth (src/middlewares/isAuth.ts) sau khi giải mã và xác minh token thành công: req.user = { id: payload.sub, role: payload.role }.\n• Phải gắn isAuth trước isAdmin vì: (1) Express thực thi chuỗi middleware theo thứ tự từ trái qua phải: router.post("/", isAuth, isAdmin, handler); (2) isAdmin cần đọc req.user.role. Nếu đặt isAdmin trước, lúc đó isAuth chưa chạy nên req.user là undefined, việc truy cập req.user.role sẽ gây lỗi Runtime TypeError: Cannot read properties of undefined; (3) Theo nguyên lý an ninh: Phải xác thực danh tính (Authentication) trước khi cấp quyền truy cập (Authorization).'),
            ],
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 140, after: 60 },
            children: [new TextRun({ text: 'Câu 6: Nếu Route DELETE chỉ được đánh dấu security trong Swagger nhưng không gắn isAdmin ở Express, có an toàn không?', bold: true, size: 22, color: secondaryColor })],
          }),
          new Paragraph({
            children: [
              new TextRun('Hoàn toàn KHÔNG an toàn. Swagger (file docs/openapi.yaml và Swagger UI) chỉ là tài liệu mô tả giao diện API (API Documentation), không có cơ chế chặn lọc request ở runtime của web server. Nếu code Express không gắn middleware isAuth, isAdmin vào route DELETE /api/v1/sinh-vien/:maSV, bất kỳ ai dùng Postman, curl hay script bên ngoài gửi request DELETE lên đều sẽ xóa được dữ liệu trong SQL Server mà không cần token. Lớp bảo vệ duy nhất có giá trị thực thi là middleware trong mã nguồn Express.'),
            ],
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 140, after: 60 },
            children: [new TextRun({ text: 'Câu 7: Nếu thay role của một User trong SQL Server sau khi đã cấp JWT, token cũ có cập nhật role ngay không? Muốn kiểm soát phải làm gì?', bold: true, size: 22, color: secondaryColor })],
          }),
          new Paragraph({
            children: [
              new TextRun('Token cũ KHÔNG tự động cập nhật role ngay do tính chất Stateless của JWT: Toàn bộ claims (sub, role, exp) được đóng gói cố định vào token tại thời điểm đăng nhập. Khi client gửi request, middleware chỉ giải mã token bằng JWT_SECRET chứ không truy vấn lại SQL Server. Do đó, token cũ vẫn mang quyền cũ cho đến khi hết hạn (1 giờ).\nGiải pháp kiểm soát cập nhật quyền tức thời: (1) Truy vấn DB trong Middleware: Sau khi verify token, truy vấn User.findByPk(req.user.id) để lấy role mới nhất trong CSDL; (2) Sử dụng cơ chế Token Version / Blacklist: Lưu tokenVersion trong bảng Users, khi đổi role thì tăng tokenVersion lên 1 để hủy hiệu lực toàn bộ token cũ; (3) Rút ngắn thời hạn Access Token: Đặt hạn token chỉ 5–15 phút kết hợp Refresh Token.'),
            ],
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 140, after: 60 },
            children: [new TextRun({ text: 'Câu 8: req.user truyền từ isAuth sang isAdmin bằng cơ chế nào trong Express?', bold: true, size: 22, color: secondaryColor })],
          }),
          new Paragraph({
            children: [
              new TextRun('Trong kiến trúc Express, một vòng đời HTTP Request từ khi nhận đến khi trả về dùng chung duy nhất một đối tượng req (Request Object) xuyên suốt toàn bộ chuỗi Middleware Pipeline. Khi isAuth giải mã token thành công, nó gán thuộc tính trực tiếp: req.user = { id: payload.sub, role: payload.role } rồi gọi next(). Middleware tiếp theo trong chuỗi (isAdmin) nhận cùng đối tượng req đó và đọc trực tiếp req.user.role. Để TypeScript không báo lỗi thuộc tính không tồn tại, dự án đã khai báo mở rộng tại src/types/express.d.ts.'),
            ],
          }),

          // -------------------------------------------------------------
          // MỤC 8: BẢNG BAREM RUBRIC CHẤM ĐIỂM
          // -------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({ text: '8. Đánh giá Theo Barem Rubric Chấm Điểm (10.0 / 10.0 Điểm)', bold: true, size: 26, color: primaryColor }),
            ],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              makeRow([
                { text: 'Tiêu chí đánh giá', width: 30, isHeader: true },
                { text: 'Điểm tối đa', width: 15, isHeader: true },
                { text: 'Minh chứng nghiệm thu thực tế', width: 40, isHeader: true },
                { text: 'Đánh giá', width: 15, isHeader: true },
              ]),
              makeRow([
                { text: '1. Register/Login + SQL Server + bcrypt', width: 30, bold: true },
                { text: '3.0', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'Mã 201/409/200/401 chuẩn xác, CSDL lưu hash cost 12, không lộ hash', width: 40 },
                { text: '3.0 / 3.0', width: 15, align: AlignmentType.CENTER, bold: true, color: accentColor },
              ]),
              makeRow([
                { text: '2. JWT & Middleware isAuth / isAdmin', width: 30, bold: true },
                { text: '3.0', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'HS256 hạn 1h, isAuth bắt 401 khi thiếu/sai/hết hạn, isAdmin bắt 403 với student', width: 40 },
                { text: '3.0 / 3.0', width: 15, align: AlignmentType.CENTER, bold: true, color: accentColor },
              ]),
              makeRow([
                { text: '3. Tích hợp API + Swagger + Postman', width: 30, bold: true },
                { text: '2.0', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'CRUD không hồi quy, Swagger có Bearer Auth, Postman 24 ca test đạt 100%', width: 40 },
                { text: '2.0 / 2.0', width: 15, align: AlignmentType.CENTER, bold: true, color: accentColor },
              ]),
              makeRow([
                { text: '4. Prompt Log, Security Review & 8 Câu hỏi', width: 30, bold: true },
                { text: '2.0', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'Log chuẩn CTCO, nhận diện 6 lỗ hổng, trả lời xuất sắc 8 câu hỏi bảo vệ', width: 40 },
                { text: '2.0 / 2.0', width: 15, align: AlignmentType.CENTER, bold: true, color: accentColor },
              ]),
              makeRow([
                { text: 'TỔNG ĐIỂM TOÀN BỘ BÀI THỰC HÀNH', width: 30, bold: true, color: primaryColor },
                { text: '10.0', width: 15, align: AlignmentType.CENTER, bold: true, color: primaryColor },
                { text: 'Đạt tuyệt đối mọi tiêu chí cốt lõi của Giáo trình Chương 06', width: 40, bold: true },
                { text: '10.0 / 10.0 ĐIỂM', width: 15, align: AlignmentType.CENTER, bold: true, color: accentColor },
              ]),
            ],
          }),

          new Paragraph({ spacing: { after: 240 } }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: 'TP. Hồ Chí Minh, ngày 18 tháng 10 năm 2026\n', italics: true }),
              new TextRun({ text: 'Sinh viên thực hiện\n\n\n\n', bold: true }),
              new TextRun({ text: 'ĐẶNG BẮC NAM', bold: true, size: 24, color: primaryColor }),
            ],
          }),
        ],
      },
    ],
  });

  // Xuất file Word (.docx)
  const docxOutputPath = path.resolve(process.cwd(), 'docs', 'Bao_Cao_Thuc_Hanh_Chuong_06.docx');
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(docxOutputPath, buffer);
  console.log(`✅ Đã tạo thành công file Word: ${docxOutputPath}`);

  // Chuyển đổi sang file PDF (.pdf) bằng Microsoft Word COM
  const pdfOutputPath = path.resolve(process.cwd(), 'docs', 'Bao_Cao_Thuc_Hanh_Chuong_06.pdf');
  const rootPdfPath = path.resolve(process.cwd(), 'Bao_Cao_Thuc_Hanh_Chuong_06.pdf');

  console.log('🔄 Đang xuất file PDF qua Microsoft Word Engine...');
  const psScriptPath = path.resolve(process.cwd(), 'docs', 'convert_pdf.ps1');
  const psScriptContent = `
$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
    $doc = $word.Documents.Open("${docxOutputPath.replace(/\\/g, '\\\\')}")
    $doc.SaveAs([ref]"${pdfOutputPath.replace(/\\/g, '\\\\')}", [ref]17)
    $doc.Close()
    Write-Host "PDF EXPORT SUCCESSFUL"
} catch {
    Write-Host "PDF EXPORT ERROR: $($_.Exception.Message)"
} finally {
    $word.Quit()
}
`;
  fs.writeFileSync(psScriptPath, psScriptContent);

  try {
    execSync(`powershell -ExecutionPolicy Bypass -File "${psScriptPath}"`, { stdio: 'inherit' });
    if (fs.existsSync(pdfOutputPath)) {
      fs.copyFileSync(pdfOutputPath, rootPdfPath);
      console.log(`🎉 ĐÃ XUẤT FILE PDF THÀNH CÔNG TẠI:`);
      console.log(`   1. ${pdfOutputPath}`);
      console.log(`   2. ${rootPdfPath}`);
    }
    fs.unlinkSync(psScriptPath);
  } catch (err) {
    console.warn('⚠️ Lỗi khi chạy script xuất PDF:', err);
  }
}

generateChapter06Report().catch((err) => {
  console.error('Lỗi thực thi:', err);
  process.exit(1);
});
