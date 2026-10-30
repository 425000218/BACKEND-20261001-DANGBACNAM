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

async function generateChapter07Report() {
  console.log('🚀 Đang khởi tạo Báo cáo Thực hành Chương 07 (Word & PDF)...');

  const primaryColor = '1E3A8A';   // Xanh Navy
  const secondaryColor = '0369A1'; // Xanh Lam
  const accentColor = '047857';    // Xanh Lá
  const darkTextColor = '0F172A';  // Slate 900
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

  interface ICellDef {
    text: string;
    width: number;
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
                  new TextRun({ text: 'Báo Cáo Thực Hành Chương 07 - Đặng Bắc Nam | Trang ', size: 18, color: '94A3B8' }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 18, color: '94A3B8' }),
                  new TextRun({ text: ' / ', size: 18, color: '94A3B8' }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: '94A3B8' }),
                ],
              }),
            ],
          }),
        },
        children: [
          // =============================================================
          // TRANG BÌA BÁO CÁO
          // =============================================================
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 60 },
            children: [
              new TextRun({ text: 'HỌC PHẦN: LẬP TRÌNH BACKEND', bold: true, size: 28, color: primaryColor }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 180 },
            children: [
              new TextRun({ text: 'BỘ MÔN CÔNG NGHỆ THÔNG TIN · DỰ ÁN RESTFUL API', size: 20, color: secondaryColor }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 100 },
            children: [
              new TextRun({ text: 'BÁO CÁO KẾT QUẢ THỰC HÀNH', bold: true, size: 36, color: primaryColor }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: 'CHƯƠNG 07: UPLOAD HÌNH ẢNH & KẾT NỐI FRONTEND – BACKEND',
                bold: true,
                size: 26,
                color: secondaryColor,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 360 },
            children: [
              new TextRun({
                text: 'MULTER · VITE · REACT · AXIOS · CORS · JWT RBAC',
                bold: true,
                size: 20,
                color: accentColor,
              }),
            ],
          }),

          // BẢNG THÔNG TIN SINH VIÊN & HỆ THỐNG
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              makeRow([
                { text: 'Thông Tin Dự Án & Tác Giả', width: 100, isHeader: true, align: AlignmentType.CENTER },
              ]),
              makeRow([
                { text: 'Sinh viên thực hiện:', width: 35, bold: true },
                { text: 'ĐẶNG BẮC NAM', width: 65, bold: true, color: primaryColor },
              ]),
              makeRow([
                { text: 'Mã số sinh viên / Dự án:', width: 35, bold: true },
                { text: 'BACKEND-20261001-DANGBACNAM', width: 65, bold: true },
              ]),
              makeRow([
                { text: 'Nền tảng công nghệ Backend:', width: 35, bold: true },
                { text: 'Node.js (v24), Express 5, TypeScript (ESM NodeNext), SQL Server, Sequelize ORM, Multer', width: 65 },
              ]),
              makeRow([
                { text: 'Nền tảng công nghệ Frontend:', width: 35, bold: true },
                { text: 'React 19, Vite, TypeScript, Axios Client, Bootstrap UI (Chạy cổng 5173)', width: 65 },
              ]),
              makeRow([
                { text: 'Chính sách bảo mật áp dụng:', width: 35, bold: true },
                { text: 'JWT HS256, RBAC (isAuth, isAdmin), CORS Allowlist, Magic Bytes Verifier, Giới hạn 2MB', width: 65 },
              ]),
              makeRow([
                { text: 'Công cụ kiểm thử nghiệm thu:', width: 35, bold: true },
                { text: 'Postman Collection, DevTools Network, Automated Test Suite (12 Upload + 12 Frontend)', width: 65 },
              ]),
            ],
          }),

          new Paragraph({ spacing: { after: 360 } }),

          // -------------------------------------------------------------
          // MỤC 1: TỔNG QUAN KIẾN TRÚC & HAI LUỒNG XỬ LÝ
          // -------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({ text: '1. Tổng Quan Kiến Trúc & Hai Luồng Xử Lý Nghiệp Vụ', bold: true, size: 26, color: primaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Hệ thống Quản lý sinh viên trong Chương 07 được mở rộng toàn diện từ nền tảng xác thực JWT và phân quyền RBAC của Chương 06. Dự án hiện thực hóa việc phân tách kiến trúc rõ ràng giữa Client (Frontend React Vite tại cổng 5173), Server (Express API tại cổng 5000), File System (thư mục lưu trữ vật lý public/uploads/) và Database (Microsoft SQL Server).',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Kiến trúc hệ thống vận hành xoay quanh hai luồng nghiệp vụ cốt lõi:', bold: true }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Luồng A — Cập nhật Ảnh đại diện của Người dùng (Avatar Upload): ', bold: true }),
              new TextRun({
                text: 'Người dùng chọn ảnh tại giao diện React → Đóng gói FormData với key "avatar" → Gửi Axios POST kèm Bearer JWT → Express định tuyến qua isAuth (xác minh danh tính) → Multer (tiếp nhận file ≤ 2MB) → Kiểm tra chữ ký nhị phân Magic Bytes → Service cập nhật URL vào dbo.Users → File lưu tại public/uploads/, CSDL chỉ giữ chuỗi URL tương đối /uploads/<uuid>.<ext> → Giao diện hiển thị ảnh mới.',
              }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Luồng B — Xem và Xóa Sinh Viên trên Giao Diện (RBAC Data Access): ', bold: true }),
              new TextRun({
                text: 'React gọi Axios GET /api/v1/sinh-vien (công khai) → Nhận mảng đối tượng tại res.data.data → Render bảng 4 cột kèm xử lý Loading/Empty/Error/Retry. Khi người dùng đăng nhập tài khoản Quản trị viên (Admin), bảng kích hoạt nút Xóa ở từng dòng; khi bấm Xóa, hộp thoại xác nhận hiển thị mã SV → Gửi Axios DELETE có Bearer JWT → isAuth và isAdmin kiểm tra quyền → Xóa bản ghi trong SQL Server → Bảng tự động tải lại dữ liệu mới nhất.',
              }),
            ],
          }),

          // BẢNG SO SÁNH KHÁI NIỆM KỸ THUẬT
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              makeRow([
                { text: 'Thành phần', width: 25, isHeader: true },
                { text: 'Vai trò kỹ thuật trong hệ thống', width: 45, isHeader: true },
                { text: 'Nguyên tắc bất biến áp dụng', width: 30, isHeader: true },
              ]),
              makeRow([
                { text: 'application/json', width: 25, bold: true },
                { text: 'Truyền tải dữ liệu văn bản UTF-8 có cấu trúc cho Login, Register, CRUD', width: 45 },
                { text: 'Đọc bằng express.json(); không dùng truyền file', width: 30 },
              ]),
              makeRow([
                { text: 'multipart/form-data', width: 25, bold: true },
                { text: 'Đóng gói nhiều part phân tách bởi boundary để truyền file nhị phân', width: 45 },
                { text: 'Xử lý bằng Multer; req.file lưu metadata', width: 30 },
              ]),
              makeRow([
                { text: 'CORS Allowlist', width: 25, bold: true },
                { text: 'Chính sách bảo mật trình duyệt kiểm soát request từ Origin khác', width: 45 },
                { text: 'Chỉ cho phép localhost:5173; không dùng wildcard', width: 30 },
              ]),
              makeRow([
                { text: 'JWT & RBAC', width: 25, bold: true },
                { text: 'isAuth xác minh danh tính; isAdmin phân quyền thao tác ghi dữ liệu', width: 45 },
                { text: 'Chặn 401 khi thiếu/sai token; chặn 403 với student', width: 30 },
              ]),
            ],
          }),

          new Paragraph({ spacing: { after: 200 } }),

          // -------------------------------------------------------------
          // MỤC 2: THIẾT KẾ CƠ SỞ DỮ LIỆU SQL SERVER & MODEL
          // -------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({ text: '2. Thiết Kế Cơ Sở Dữ Liệu SQL Server & Model', bold: true, size: 26, color: primaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Hồ sơ người dùng được quản lý tập trung tại bảng dbo.Users trong CSDL QuanLySinhVienDB. Nhằm phục vụ chức năng ảnh đại diện, kịch bản nâng cấp schema ',
              }),
              new TextRun({ text: 'sql/05-add-avatar-url.sql', bold: true }),
              new TextRun({
                text: ' được thiết kế với tính chất lũy kế an toàn (Idempotent), đảm bảo không làm mất dữ liệu người dùng cũ và không gây lỗi khi chạy lặp lại.',
              }),
            ],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              makeRow([
                { text: 'Tên Cột (Column)', width: 22, isHeader: true },
                { text: 'Kiểu Dữ Liệu', width: 20, isHeader: true },
                { text: 'Nullable', width: 18, isHeader: true },
                { text: 'Ràng buộc & Ý nghĩa nghiệp vụ', width: 40, isHeader: true },
              ]),
              makeRow([
                { text: 'id', width: 22, bold: true },
                { text: 'INT IDENTITY(1,1)', width: 20 },
                { text: 'NOT NULL', width: 18, align: AlignmentType.CENTER },
                { text: 'Khóa chính (PK), định danh duy nhất người dùng', width: 40 },
              ]),
              makeRow([
                { text: 'fullName', width: 22, bold: true },
                { text: 'NVARCHAR(150)', width: 20 },
                { text: 'NOT NULL', width: 18, align: AlignmentType.CENTER },
                { text: 'Họ tên hiển thị của tài khoản', width: 40 },
              ]),
              makeRow([
                { text: 'email', width: 22, bold: true },
                { text: 'NVARCHAR(254)', width: 20 },
                { text: 'NOT NULL', width: 18, align: AlignmentType.CENTER },
                { text: 'Tài khoản đăng nhập, ràng buộc UNIQUE', width: 40 },
              ]),
              makeRow([
                { text: 'passwordHash', width: 22, bold: true },
                { text: 'NVARCHAR(255)', width: 20 },
                { text: 'NOT NULL', width: 18, align: AlignmentType.CENTER },
                { text: 'Chuỗi băm bcrypt cost 12, không lưu plaintext', width: 40 },
              ]),
              makeRow([
                { text: 'role', width: 22, bold: true },
                { text: 'NVARCHAR(20)', width: 20 },
                { text: 'NOT NULL', width: 18, align: AlignmentType.CENTER },
                { text: 'Vai trò: student (mặc định) hoặc admin', width: 40 },
              ]),
              makeRow([
                { text: 'avatarUrl (Mới)', width: 22, bold: true, color: primaryColor },
                { text: 'NVARCHAR(255)', width: 20, bold: true },
                { text: 'YES (NULL)', width: 18, align: AlignmentType.CENTER, bold: true, color: accentColor },
                { text: 'Đường dẫn tĩnh tương đối dạng /uploads/<uuid>.<ext>', width: 40, bold: true },
              ]),
            ],
          }),

          new Paragraph({ spacing: { after: 120 } }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Nguyên Tắc Phân Tách Lưu Trữ: ', bold: true, color: primaryColor }),
              new TextRun({
                text: 'Hệ thống tuyệt đối không lưu dữ liệu nhị phân (BLOB) vào SQL Server để tránh làm phình to kích thước database và suy giảm hiệu năng sao lưu. Thay vào đó, tệp ảnh thực tế được lưu vào thư mục vật lý public/uploads/ trên ổ đĩa máy chủ, còn SQL Server chỉ giữ chuỗi URL tương đối. Sequelize Model User tại src/models/user.model.ts được cập nhật ánh xạ thuộc tính avatarUrl nullable một cách chuẩn xác.',
              }),
            ],
          }),

          new Paragraph({ spacing: { after: 200 } }),

          // -------------------------------------------------------------
          // MỤC 3: CẤU HÌNH MIDDLEWARE MULTER & AN TOÀN FILE
          // -------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({ text: '3. Cấu Hình Middleware Multer & Kiểm Soát An Toàn File', bold: true, size: 26, color: primaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Middleware upload tại src/middlewares/upload.middleware.ts được xây dựng dựa trên 4 lớp bảo vệ an ninh nghiêm ngặt nhằm ngăn chặn các nguy cơ tấn công qua tệp tin:',
              }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Lớp 1 — Giới Hạn Dung Lượng: ', bold: true }),
              new TextRun({ text: 'Cấu hình limits: { fileSize: 2 * 1024 * 1024 } (chính xác 2.097.152 bytes). Khi vượt quá giới hạn, Multer kích hoạt lỗi LIMIT_FILE_SIZE và error.middleware.ts trả về mã ' }),
              new TextRun({ text: 'HTTP 413 Payload Too Large', bold: true, color: primaryColor }),
              new TextRun({ text: ' kèm thông báo rõ ràng.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Lớp 2 — Bộ Lọc Định Dạng Sơ Bộ: ', bold: true }),
              new TextRun({ text: 'Cấu hình fileFilter kiểm tra phần mở rộng (.png, .jpg, .jpeg) và mimetype (image/png, image/jpeg). Từ chối các định dạng khác (như .gif, .exe, .sh) với mã 400 Bad Request.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Lớp 3 — Đặt Tên File An Toàn Bằng UUID: ', bold: true }),
              new TextRun({ text: 'Tuyệt đối không dùng originalname từ client; server sinh chuỗi định danh duy nhất ' }),
              new TextRun({ text: '`${randomUUID()}${ext}`', bold: true }),
              new TextRun({ text: ' để triệt tiêu hoàn toàn nguy cơ tấn công duyệt thư mục (Path Traversal) và chống ghi đè tệp tin ngẫu nhiên.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Lớp 4 — Kiểm Tra Chữ Ký Nhị Phân Thực Tế (Magic Bytes): ', bold: true }),
              new TextRun({ text: 'Hàm verifyImageSignature() đọc 8 byte đầu của tệp tin trên đĩa. Đối với PNG, 8 byte đầu bắt buộc phải là ' }),
              new TextRun({ text: '89 50 4E 47 0D 0A 1A 0A', bold: true }),
              new TextRun({ text: '; đối với JPEG là ' }),
              new TextRun({ text: 'FF D8 FF', bold: true }),
              new TextRun({ text: '. Nếu phát hiện tệp văn bản hoặc mã độc đổi đuôi thành .png, hệ thống lập tức từ chối và ' }),
              new TextRun({ text: 'xóa sạch tệp rác khỏi ổ đĩa ngay lập tức', bold: true, color: accentColor }),
              new TextRun({ text: '.' }),
            ],
          }),

          new Paragraph({ spacing: { after: 200 } }),

          // -------------------------------------------------------------
          // MỤC 4: BỘ TUYẾN ĐƯỜNG & NGHIỆP VỤ BACKEND
          // -------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({ text: '4. Bộ Tuyến Đường & Nghiệp Vụ Backend', bold: true, size: 26, color: primaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Tuyến đường tải ảnh đại diện được đăng ký tại src/routes/auth.routes.ts với cấu trúc pipeline tuần tự:',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'router.post("/me/avatar", isAuth, uploadAvatarMiddleware, uploadAvatar);',
                bold: true,
                color: primaryColor,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Nguyên Tắc Phòng Vệ Chống Sửa Chéo (IDOR / BOLA): ', bold: true, color: primaryColor }),
              new TextRun({
                text: 'Trong Controller uploadAvatar (src/controllers/auth.controller.ts), ID người dùng được lấy duy nhất từ req.user.id (trích xuất từ JWT hợp lệ sau khi qua isAuth). Hệ thống tuyệt đối bỏ qua và không tin tưởng bất kỳ tham số req.body.userId nào từ client. Nhờ đó, tài khoản Student A không bao giờ có thể can thiệp hoặc thay đổi ảnh đại diện của Student B.',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Phục Vụ Tệp Tĩnh Đúng Mức: ', bold: true }),
              new TextRun({
                text: 'Trong src/server.ts, Express chỉ công khai đúng thư mục ảnh đã qua kiểm duyệt: app.use("/uploads", express.static("public/uploads")), kết hợp cùng header crossOriginResourcePolicy: { policy: "cross-origin" } để giao diện React tại cổng 5173 hiển thị ảnh mượt mà.',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Đặc Tả Swagger OpenAPI 3.0: ', bold: true }),
              new TextRun({
                text: 'File docs/openapi.yaml được cập nhật đầy đủ endpoint POST /api/auth/me/avatar với kiểu content: multipart/form-data, trường avatar định dạng binary và ổ khóa bảo mật bearerAuth. Schema UserDTO và phản hồi Profile bổ sung thuộc tính avatarUrl.',
              }),
            ],
          }),

          new Paragraph({ spacing: { after: 200 } }),

          // -------------------------------------------------------------
          // MỤC 5: ỨNG DỤNG FRONTEND REACT VITE & KẾT NỐI AXIOS CORS
          // -------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({ text: '5. Ứng Dụng Frontend React Vite & Kết Nối Axios CORS', bold: true, size: 26, color: primaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Ứng dụng Frontend độc lập được tổ chức trong thư mục frontend/ sử dụng React 19, TypeScript, Vite và thư viện Axios:',
              }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Cấu hình CORS Allowlist: ', bold: true }),
              new TextRun({ text: 'Backend cho phép chính xác Origin http://localhost:5173 và http://127.0.0.1:5173. Trình duyệt tự động kiểm tra chính sách SOP; các request từ domain lạ ngoài danh sách sẽ bị chặn đứng (Ca F12).' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Component SinhVienTable (Bảng Sinh Viên): ', bold: true }),
              new TextRun({ text: 'Gọi API thật GET /api/v1/sinh-vien, đọc mảng dữ liệu tại res.data.data và hiển thị 4 cột (Mã SV, Họ tên, Email, Mã lớp). Xử lý trọn vẹn 4 trạng thái: Loading spinner, Empty state (danh sách rỗng), Error alert khi máy chủ ngoại tuyến và nút "Thử lại" phục hồi kết nối tức thì.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Component LoginForm (Đăng Nhập & Hồ Sơ): ', bold: true }),
              new TextRun({ text: 'Gửi email và mật khẩu tới /api/auth/login, nhận JWT token và lưu trữ an toàn trong React in-memory state (tránh rủi ro XSS so với localStorage). Tự động gọi GET /api/auth/profile hiển thị Card hồ sơ cá nhân có ảnh đại diện, email, vai trò và nút Đăng xuất.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Phân Quyền Nút Xóa Sinh Viên (RBAC): ', bold: true }),
              new TextRun({ text: 'Nút "Xóa" chỉ xuất hiện ở từng dòng khi profile.role === "admin" (ẩn hoàn toàn với Student). Trước khi gửi DELETE /api/v1/sinh-vien/:maSV có Bearer JWT, hộp thoại xác nhận hiển thị chính xác mã sinh viên cần xóa. Khi thành công, bảng tự động reload dữ liệu từ CSDL.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Component AvatarUpload (Tải Ảnh Đại Diện): ', bold: true }),
              new TextRun({ text: 'Thẻ <input type="file"> chấp nhận PNG/JPEG, kiểm tra sơ bộ ≤ 2MB, tạo URL xem trước (preview). Đóng gói FormData với key "avatar", gửi Axios POST kèm Bearer token để trình duyệt tự đính kèm boundary. Sau khi nhận 200 OK, tự động cập nhật avatarUrl mới trên giao diện.' }),
            ],
          }),

          new Paragraph({ spacing: { after: 200 } }),

          // -------------------------------------------------------------
          // MỤC 6: MINH CHỨNG KIỂM THỬ POSTMAN TOÀN DIỆN
          // -------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({ text: '6. Minh Chứng Kiểm Thử Postman Toàn Diện (Bộ Sưu Tập Chuẩn)', bold: true, size: 26, color: primaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Bộ sưu tập Postman Collection Chuong07-Upload-Avatar.postman_collection.json đã thực thi kiểm thử toàn diện các tình huống theo hợp đồng API. Dưới đây là hình ảnh minh chứng thực tế thu nhận từ hệ thống:',
              }),
            ],
          }),

          ...insertImageWithCaption(
            'docs/screenshots/postman-c7-01-upload-valid-200.png',
            'Ca U01 — Upload Avatar PNG hợp lệ thành công (200 OK, trả avatarUrl)',
            540,
            290
          ),
          ...insertImageWithCaption(
            'docs/screenshots/postman-c7-02-profile-avatar-200.png',
            'Ca U12 — GET Profile xác minh avatarUrl được cập nhật bền vững trong SQL Server (200 OK)',
            540,
            290
          ),
          ...insertImageWithCaption(
            'docs/screenshots/postman-c7-03-upload-401-unauth.png',
            'Ca U03 — Chặn 401 Unauthorized khi upload thiếu Bearer Token (Không sinh file rác)',
            540,
            290
          ),
          ...insertImageWithCaption(
            'docs/screenshots/postman-c7-04-upload-413-oversize.png',
            'Ca U07 — Chặn 413 Payload Too Large khi file vượt quá 2MB (Bắt đúng mã chuẩn lab)',
            540,
            290
          ),
          ...insertImageWithCaption(
            'docs/screenshots/postman-c7-05-upload-400-magicbytes.png',
            'Ca U08 — Phát hiện file văn bản giả mạo .png qua Magic Bytes (400 Bad Request, dọn sạch đĩa)',
            540,
            290
          ),
          ...insertImageWithCaption(
            'docs/screenshots/postman-c7-06-delete-403-student.png',
            'Ca F09 — Phân quyền RBAC Backend: Chặn 403 Forbidden khi tài khoản Student cố tình xóa sinh viên',
            540,
            290
          ),

          new Paragraph({ spacing: { after: 200 } }),

          // -------------------------------------------------------------
          // MỤC 7: MINH CHỨNG GIAO DIỆN NGƯỜI DÙNG FRONTEND REACT
          // -------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({ text: '7. Minh Chứng Giao Diện Người Dùng Frontend React', bold: true, size: 26, color: primaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Ứng dụng Frontend React Vite kết nối trơn tru với Backend Express và CSDL SQL Server, thể hiện đầy đủ các luồng hiển thị danh sách, phân quyền vai trò và cập nhật ảnh đại diện:',
              }),
            ],
          }),

          ...insertImageWithCaption(
            'docs/screenshots/ui-c7-01-overview.png',
            'Giao diện tổng quan ứng dụng React Vite (Cột trái: Form Login & Upload; Cột phải: Bảng Sinh viên 4 cột)',
            540,
            300
          ),
          ...insertImageWithCaption(
            'docs/screenshots/ui-c7-02-student-profile.png',
            'Đăng nhập tài khoản Student thành công — Card hồ sơ hiển thị đầy đủ avatar, email và vai trò',
            540,
            300
          ),
          ...insertImageWithCaption(
            'docs/screenshots/ui-c7-03-avatar-preview.png',
            'Component Tải ảnh đại diện — Hiển thị preview ảnh chọn và thông báo cập nhật thành công vào CSDL',
            540,
            300
          ),
          ...insertImageWithCaption(
            'docs/screenshots/ui-c7-04-admin-delete.png',
            'Tài khoản Quản trị viên (Admin) — Bảng sinh viên kích hoạt nút Xóa kèm hộp thoại xác nhận an toàn',
            540,
            300
          ),

          new Paragraph({ spacing: { after: 200 } }),

          // -------------------------------------------------------------
          // MỤC 8: BẢNG KỊCH BẢN KIỂM THỬ & HIỆN TRẠNG PHẢN HỒI
          // -------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({ text: '8. Bảng Kịch Bản Kiểm Thử & Hiện Trạng Phản Hồi', bold: true, size: 26, color: primaryColor }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Bảng 1: Kịch bản kiểm thử Upload tệp & Middleware Multer (U01 đến U12)', bold: true, color: primaryColor }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              makeRow([
                { text: 'Mã Ca', width: 10, isHeader: true },
                { text: 'Tình huống kiểm thử', width: 35, isHeader: true },
                { text: 'HTTP Kỳ vọng', width: 15, isHeader: true },
                { text: 'HTTP Thực tế', width: 15, isHeader: true },
                { text: 'Hiện trạng phản hồi', width: 25, isHeader: true },
              ]),
              makeRow([
                { text: 'U01', width: 10, bold: true },
                { text: 'Avatar PNG hợp lệ + Student JWT', width: 35 },
                { text: '200', width: 15, align: AlignmentType.CENTER },
                { text: '200', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'CSDL cập nhật đường dẫn avatarUrl', width: 25, color: accentColor, bold: true },
              ]),
              makeRow([
                { text: 'U02', width: 10, bold: true },
                { text: 'Avatar JPEG hợp lệ + Mở qua HTTP', width: 35 },
                { text: '200', width: 15, align: AlignmentType.CENTER },
                { text: '200', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'Phục vụ ảnh tĩnh HTTP 200 OK', width: 25, color: accentColor, bold: true },
              ]),
              makeRow([
                { text: 'U03', width: 10, bold: true },
                { text: 'Không có Authorization header', width: 35 },
                { text: '401', width: 15, align: AlignmentType.CENTER },
                { text: '401', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'Chặn 401, không lưu tệp vào đĩa', width: 25, color: accentColor, bold: true },
              ]),
              makeRow([
                { text: 'U04', width: 10, bold: true },
                { text: 'JWT sai hoặc đã hết hạn', width: 35 },
                { text: '401', width: 15, align: AlignmentType.CENTER },
                { text: '401', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'Chặn 401, middleware isAuth bắt', width: 25, color: accentColor, bold: true },
              ]),
              makeRow([
                { text: 'U05', width: 10, bold: true },
                { text: 'Body form-data thiếu file', width: 35 },
                { text: '400', width: 15, align: AlignmentType.CENTER },
                { text: '400', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'Báo lỗi 400, thiếu trường tệp tải lên', width: 25, color: accentColor, bold: true },
              ]),
              makeRow([
                { text: 'U06', width: 10, bold: true },
                { text: 'Tên field là photo thay vì avatar', width: 35 },
                { text: '400', width: 15, align: AlignmentType.CENTER },
                { text: '400', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'Báo lỗi 400 LIMIT_UNEXPECTED_FILE', width: 25, color: accentColor, bold: true },
              ]),
              makeRow([
                { text: 'U07', width: 10, bold: true },
                { text: 'Kích thước file vượt quá 2MB (2.2MB)', width: 35 },
                { text: '413', width: 15, align: AlignmentType.CENTER },
                { text: '413', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'Báo lỗi 413 LIMIT_FILE_SIZE (>2MB)', width: 25, color: accentColor, bold: true },
              ]),
              makeRow([
                { text: 'U08', width: 10, bold: true },
                { text: 'File TXT giả mạo đuôi .png (Magic bytes)', width: 35 },
                { text: '400', width: 15, align: AlignmentType.CENTER },
                { text: '400', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'Báo lỗi 400 sai Magic Bytes, dọn tệp rác', width: 25, color: accentColor, bold: true },
              ]),
              makeRow([
                { text: 'U09', width: 10, bold: true },
                { text: 'Đuôi .gif không trong danh sách', width: 35 },
                { text: '400', width: 15, align: AlignmentType.CENTER },
                { text: '400', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'Báo lỗi 400 fileFilter chặn định dạng lạ', width: 25, color: accentColor, bold: true },
              ]),
              makeRow([
                { text: 'U10', width: 10, bold: true },
                { text: 'Upload 2 lần cùng tài khoản', width: 35 },
                { text: '200', width: 15, align: AlignmentType.CENTER },
                { text: '200', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'Cập nhật URL mới UUID thành công', width: 25, color: accentColor, bold: true },
              ]),
              makeRow([
                { text: 'U11', width: 10, bold: true },
                { text: 'Student A gửi kèm userId của B trong body', width: 35 },
                { text: '200', width: 15, align: AlignmentType.CENTER },
                { text: '200', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'Chỉ cập nhật theo JWT, bảo toàn user khác', width: 25, color: accentColor, bold: true },
              ]),
              makeRow([
                { text: 'U12', width: 10, bold: true },
                { text: 'GET Profile kiểm chứng độ bền vững', width: 35 },
                { text: '200', width: 15, align: AlignmentType.CENTER },
                { text: '200', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'Dữ liệu lưu trữ bền vững trong SQL Server', width: 25, color: accentColor, bold: true },
              ]),
            ],
          }),

          new Paragraph({ spacing: { after: 180 } }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Bảng 2: Kịch bản kiểm thử Frontend React & Tích hợp CORS (F01 đến F12)', bold: true, color: primaryColor }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              makeRow([
                { text: 'Mã Ca', width: 10, isHeader: true },
                { text: 'Tình huống kiểm thử', width: 35, isHeader: true },
                { text: 'Kỳ vọng giao diện & mạng', width: 30, isHeader: true },
                { text: 'Hiện trạng phản hồi', width: 25, isHeader: true },
              ]),
              makeRow([
                { text: 'F01', width: 10, bold: true },
                { text: 'Vite chạy, Backend bật & CORS allowlist', width: 35 },
                { text: 'Status 200, Header Allow-Origin 5173', width: 30 },
                { text: 'Kết nối thành công qua CORS allowlist', width: 25, color: accentColor, bold: true },
              ]),
              makeRow([
                { text: 'F02', width: 10, bold: true },
                { text: 'GET danh sách hiển thị bảng 4 cột', width: 35 },
                { text: 'Render đủ maSV, hoTen, email, maLop', width: 30 },
                { text: 'Đọc và hiển thị dữ liệu res.data.data', width: 25, color: accentColor, bold: true },
              ]),
              makeRow([
                { text: 'F03', width: 10, bold: true },
                { text: 'Xử lý danh sách rỗng (Empty state)', width: 35 },
                { text: 'Hiển thị alert thông báo rỗng, không crash', width: 30 },
                { text: 'Hiển thị trạng thái rỗng, không sập trang', width: 25, color: accentColor, bold: true },
              ]),
              makeRow([
                { text: 'F04', width: 10, bold: true },
                { text: 'Backend tắt khi gọi API (Network Error)', width: 35 },
                { text: 'Hiện alert lỗi, tắt spinner, hiện nút Thử lại', width: 30 },
                { text: 'Hiển thị lỗi kết nối và nút Thử lại', width: 25, color: accentColor, bold: true },
              ]),
              makeRow([
                { text: 'F05', width: 10, bold: true },
                { text: 'Bật lại Backend và bấm "Thử lại"', width: 35 },
                { text: 'Khôi phục tải bảng thành công (200 OK)', width: 30 },
                { text: 'Khôi phục tải dữ liệu bảng sau khi thử lại', width: 25, color: accentColor, bold: true },
              ]),
              makeRow([
                { text: 'F06', width: 10, bold: true },
                { text: 'Đăng nhập Student hợp lệ', width: 35 },
                { text: 'Cấp JWT, hiển thị Profile Card sinh viên', width: 30 },
                { text: 'Lưu trữ JWT an toàn trong bộ nhớ React state', width: 25, color: accentColor, bold: true },
              ]),
              makeRow([
                { text: 'F07', width: 10, bold: true },
                { text: 'Đăng nhập sai mật khẩu', width: 35 },
                { text: 'Báo lỗi 401 Unauthorized, token rỗng', width: 30 },
                { text: 'Bắt mã lỗi 401, hiển thị thông báo lỗi', width: 25, color: accentColor, bold: true },
              ]),
              makeRow([
                { text: 'F08', width: 10, bold: true },
                { text: 'Xem Profile khi chưa đăng nhập', width: 35 },
                { text: 'Chặn 401, yêu cầu đăng nhập lại', width: 30 },
                { text: 'Chặn truy cập Profile khi chưa đăng nhập', width: 25, color: accentColor, bold: true },
              ]),
              makeRow([
                { text: 'F09', width: 10, bold: true },
                { text: 'Student ép gọi DELETE qua DevTools', width: 35 },
                { text: 'Chặn 403 Forbidden, CSDL không đổi', width: 30 },
                { text: 'Backend chặn mã 403 Forbidden', width: 25, color: accentColor, bold: true },
              ]),
              makeRow([
                { text: 'F10', width: 10, bold: true },
                { text: 'Admin Xóa sinh viên thành công', width: 35 },
                { text: 'Trả 200 OK, CSDL xóa, UI tự reload', width: 30 },
                { text: 'Xóa thành công và làm mới bảng dữ liệu', width: 25, color: accentColor, bold: true },
              ]),
              makeRow([
                { text: 'F11', width: 10, bold: true },
                { text: 'Upload Avatar từ React FormData', width: 35 },
                { text: 'Trả 200 OK, ảnh hiển thị tức thì trên Card', width: 30 },
                { text: 'Gửi FormData và cập nhật ảnh đại diện', width: 25, color: accentColor, bold: true },
              ]),
              makeRow([
                { text: 'F12', width: 10, bold: true },
                { text: 'Request từ Origin ngoài allowlist', width: 35 },
                { text: 'Trình duyệt chặn CORS, không cấp header', width: 30 },
                { text: 'Trình duyệt chặn Origin ngoài allowlist', width: 25, color: accentColor, bold: true },
              ]),
            ],
          }),

          new Paragraph({ spacing: { after: 200 } }),

          // -------------------------------------------------------------
          // MỤC 9: SECURITY REVIEW & PHẢN BIỆN MÃ ĐỘC HẠI
          // -------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({ text: '9. Security Review & Phản Biện Mã Độc Hại', bold: true, size: 26, color: primaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Trong quá trình phát triển hệ thống, lập trình viên đã tiến hành rà soát an ninh và phản biện mẫu mã nguồn tiềm ẩn nhiều lỗ hổng nghiêm trọng do các công cụ AI tự động tạo ra thiếu kiểm soát:',
              }),
            ],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              makeRow([
                { text: 'Lỗ Hổng Phát Hiện', width: 25, isHeader: true },
                { text: 'Nguy Cơ Bảo Mật (OWASP)', width: 40, isHeader: true },
                { text: 'Bản Vá Kỹ Thuật Đã Áp Dụng', width: 35, isHeader: true },
              ]),
              makeRow([
                { text: 'Bỏ qua isAuth', width: 25, bold: true },
                { text: 'Broken Authentication: Ai cũng có thể upload file gây tràn ổ đĩa (DoS)', width: 40 },
                { text: 'Đặt isAuth trước Multer trong chuỗi middleware', width: 35 },
              ]),
              makeRow([
                { text: 'Tin req.body.userId', width: 25, bold: true },
                { text: 'BOLA / IDOR: Người dùng A sửa chéo avatar của người dùng B tùy tiện', width: 40 },
                { text: 'Chỉ lấy ID từ req.user.id đã đóng dấu trong JWT', width: 35 },
              ]),
              makeRow([
                { text: 'Dùng originalname', width: 25, bold: true },
                { text: 'Path Traversal & Ghi đè file ngẫu nhiên khi trùng tên', width: 40 },
                { text: 'Server sinh tên UUID duy nhất ngẫu nhiên', width: 35 },
              ]),
              makeRow([
                { text: 'Thiếu giới hạn size', width: 25, bold: true },
                { text: 'Resource Exhaustion: Tải lên file hàng trăm MB làm tê liệt server', width: 40 },
                { text: 'Cấu hình limits 2MB và bắt lỗi 413 chuẩn xác', width: 35 },
              ]),
              makeRow([
                { text: 'Không kiểm tra nội dung', width: 25, bold: true },
                { text: 'Malicious File Upload: Đổi đuôi tệp mã độc (webshell) thành .png', width: 40 },
                { text: 'Kiểm tra chữ ký nhị phân Magic Bytes thực tế', width: 35 },
              ]),
              makeRow([
                { text: 'CORS wildcard cors()', width: 25, bold: true },
                { text: 'Security Misconfiguration: Mọi website lạ đều có thể gọi ngầm API', width: 40 },
                { text: 'Chỉ cho phép Origin http://localhost:5173', width: 35 },
              ]),
              makeRow([
                { text: 'Lưu tên file thô', width: 25, bold: true },
                { text: 'Broken Functionality: Client không thể truy cập ảnh tĩnh qua HTTP', width: 40 },
                { text: 'Lưu đường dẫn chuẩn /uploads/<uuid>.<ext>', width: 35 },
              ]),
            ],
          }),

          new Paragraph({ spacing: { after: 120 } }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Đoạn Văn Giải Thích Phản Biện Chuyên Sâu: ', bold: true, color: primaryColor }),
              new TextRun({
                text: 'Đoạn mã do AI đề xuất ban đầu chứa đựng hàng loạt sai lầm bảo mật nghiêm trọng khi lập trình viên thiếu kiến thức kiểm chứng nền tảng. Việc thiếu vắng middleware isAuth biến một chức năng cá nhân thành endpoint công cộng, cho phép bất kỳ ai cũng có thể đẩy dữ liệu lên máy chủ gây cạn kiệt tài nguyên lưu trữ. Nguy hiểm hơn, việc tin tưởng tham số userId từ body vi phạm trực tiếp nguyên tắc kiểm soát truy cập đối tượng (BOLA/IDOR - OWASP Top 1), tạo kẽ hở cho kẻ xấu sửa chéo hồ sơ của người khác. Việc sử dụng trực tiếp originalname tiềm ẩn nguy cơ tấn công duyệt thư mục (Path Traversal) và xung đột ghi đè tệp tin khi có nhiều người cùng tên ảnh. Bên cạnh đó, việc không giới hạn dung lượng và không thẩm định chữ ký nhị phân thực tế (Magic bytes) mở đường cho các cuộc tấn công từ chối dịch vụ và tải lên mã độc giả mạo đuôi ảnh. Cấu hình cors() mặc định cho phép mọi Origin truy cập tùy tiện, làm vô hiệu hóa hàng rào phòng thủ nguồn gốc của trình duyệt. Do đó, đoạn code này đã bị loại bỏ hoàn toàn và thay thế bằng kiến trúc đa lớp an toàn: xác thực JWT chính chủ, sinh tên file UUID ngẫu nhiên, kiểm soát chặt chẽ dung lượng 2MB và magic bytes, lưu trữ URL tương đối và giới hạn CORS allowlist nghiêm ngặt.',
              }),
            ],
          }),

          new Paragraph({ spacing: { after: 200 } }),

          // -------------------------------------------------------------
          // MỤC 10: TRẢ LỜI CHI TIẾT 12 CÂU HỎI BẢO VỆ BÀI THỰC HÀNH
          // -------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({ text: '10. Trả Lời Chi Tiết 12 Câu Hỏi Bảo Vệ Bài Thực Hành', bold: true, size: 26, color: primaryColor }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Câu 1: application/json khác multipart/form-data ở điểm nào? Vì sao express.json() không đủ cho file?', bold: true, color: secondaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'application/json là định dạng dữ liệu thuần văn bản (text-based) UTF-8 dưới dạng các cặp key-value, rất nhẹ và tối ưu cho dữ liệu thông thường nhưng không thể truyền tải luồng nhị phân lớn. multipart/form-data là chuẩn MIME cho phép chia body thành nhiều phần riêng biệt phân tách bởi boundary delimiter, mỗi phần có thể là chuỗi hoặc luồng byte nhị phân của tệp tin. Middleware express.json() chỉ parse chuỗi JSON văn bản qua JSON.parse(), hoàn toàn không thể bóc tách luồng nhị phân và boundary của multipart, khiến req.file không tồn tại. Do đó bắt buộc phải sử dụng Multer để phân tích luồng stream multipart.',
              }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Câu 2: Điều gì xảy ra khi FormData dùng "photo" nhưng Multer cấu hình single("avatar")?', bold: true, color: secondaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Multer sẽ quét các phần dữ liệu trong request để tìm trường có tên "avatar". Khi tên gửi lên là "photo", Multer coi đây là trường ngoài ý muốn và ném lỗi MulterError: LIMIT_UNEXPECTED_FILE. Bộ xử lý lỗi error.middleware.ts nhận diện lỗi này và trả về mã HTTP 400 Bad Request kèm thông báo: "Tên trường file không hợp lệ (yêu cầu field name là avatar)". Tệp tin không được lưu vào ổ đĩa và CSDL không bị thay đổi.',
              }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Câu 3: req.file và req.body nằm ở đâu sau Multer? req.user xuất hiện ở bước nào?', bold: true, color: secondaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Sau khi qua Multer, req.file chứa toàn bộ metadata của tệp tin tải lên (filename UUID, path, size, mimetype,...); req.body chứa các trường văn bản text field gửi kèm trong FormData. Thuộc tính req.user xuất hiện ở bước thực thi middleware isAuth diễn ra TRƯỚC khi chạm tới Multer: isAuth giải mã Bearer JWT và gán req.user = { id, role } vào request object.',
              }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Câu 4: Vì sao gọi isAuth trước Multer? Có cần isAdmin để User đổi Avatar chính mình không?', bold: true, color: secondaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Gọi isAuth trước Multer nhằm bảo vệ tài nguyên máy chủ: Quá trình tiếp nhận và ghi file xuống đĩa rất tốn bộ nhớ và I/O; nếu không có JWT hợp lệ, isAuth chặn đứng ngay với mã 401 Unauthorized trước khi tệp tin được xử lý, triệt tiêu nguy cơ tấn công làm tràn ổ đĩa (Disk Exhaustion DoS). Không cần isAdmin cho /me/avatar vì đổi ảnh đại diện cá nhân là quyền tự phục vụ (Self-service) của mọi tài khoản hợp lệ (student và admin).',
              }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Câu 5: Vì sao không nhận userId trong body cho endpoint /me/avatar?', bold: true, color: secondaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Nếu nhận userId từ body, một tài khoản hợp lệ có thể gửi ID của tài khoản khác trong body để sửa chéo ảnh của họ, gây ra lỗ hổng bảo mật nghiêm trọng BOLA / IDOR (OWASP Top 1). Để triệt tiêu nguy cơ này, định danh tài khoản bắt buộc phải lấy duy nhất từ req.user.id đã được đóng dấu bảo mật bên trong chữ ký JWT do server cấp.',
              }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Câu 6: Ổ đĩa chứa dữ liệu nào, còn dbo.Users.avatarUrl chứa giá trị gì?', bold: true, color: secondaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Ổ đĩa vật lý (public/uploads/) lưu trữ các khối byte nhị phân thực tế của hình ảnh dưới tên tệp UUID (ví dụ: cb4a1e66-7ce1.png). Cột dbo.Users.avatarUrl trong SQL Server chỉ lưu trữ chuỗi đường dẫn tương đối dạng /uploads/cb4a1e66-7ce1.png (NVARCHAR(255)). Mô hình này giúp database nhỏ gọn, tốc độ sao lưu cực nhanh và việc phục vụ ảnh tĩnh do Web Server đảm nhiệm.',
              }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Câu 7: 2MB tương ứng bao nhiêu byte? File 2.200.000 byte nên trả status nào?', bold: true, color: secondaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: '2MB tương ứng với chính xác 2 × 1024 × 1024 = 2.097.152 bytes. File dung lượng 2.200.000 bytes vượt quá ngưỡng cho phép, Multer bắt lỗi LIMIT_FILE_SIZE và máy chủ bắt buộc phải trả về mã HTTP 413 Payload Too Large. Không được trả mã lỗi 500 (vì đây là lỗi dữ liệu từ client) và không trả 400 chung chung khi đã có mã chuyên biệt 413.',
              }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Câu 8: Chỉ kiểm tra mimetype và đuôi .png có đủ để khẳng định file là ảnh PNG hợp lệ không?', bold: true, color: secondaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Hoàn toàn không đủ. Đuôi .png có thể đổi tùy ý bằng cách đổi tên file; mimetype là chuỗi do client tự khai báo trong header và có thể dễ dàng bị can thiệp làm giả. Để khẳng định ảnh hợp lệ, hệ thống bắt buộc phải kiểm tra chữ ký nhị phân thực tế (Magic bytes) của 8 byte đầu (PNG: 89 50 4E 47 0D 0A 1A 0A). Nếu sai chữ ký, máy chủ từ chối với mã 400 và xóa ngay file rác.',
              }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Câu 9: CORS kiểm soát điều gì? Vì sao Postman gọi API được nhưng browser lại báo CORS?', bold: true, color: secondaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'CORS là cơ chế an ninh do trình duyệt thực thi nhằm kiểm soát việc một trang web chạy tại Origin này (localhost:5173) có được đọc dữ liệu từ Origin khác (localhost:5000) hay không. Postman là ứng dụng desktop chạy trực tiếp trên hệ điều hành, không bị ràng buộc bởi chính sách Same-Origin Policy (SOP) của trình duyệt nên luôn nhận được dữ liệu. Ngược lại, trình duyệt sẽ chủ động chặn dữ liệu nếu server không trả về header Access-Control-Allow-Origin khớp với Origin gọi tới.',
              }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Câu 10: Axios GET /api/v1/sinh-vien nên đọc mảng ở response.data hay response.data.data?', bold: true, color: secondaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Bắt buộc phải đọc tại response.data.data. Lý do: Axios tự động gán toàn bộ body JSON vào response.data; theo chuẩn API Envelope Pattern của dự án, response có cấu trúc { success, message, data: [...] }. Do đó, response.data là đối tượng bọc ngoài, còn response.data.data mới chính là mảng danh sách sinh viên thực tế.',
              }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Câu 11: Vì sao Student bị ẩn nút Xóa vẫn phải bị chặn DELETE ở Backend?', bold: true, color: secondaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Ẩn nút Xóa trên giao diện chỉ là giải pháp trải nghiệm người dùng (UI/UX), hoàn toàn không phải cơ chế an ninh. Người dùng có thể dễ dàng dùng DevTools Console, cURL hoặc Postman gửi thẳng request DELETE kèm token Student. Nếu Backend không có middleware isAdmin chặn đứng với mã HTTP 403 Forbidden, dữ liệu trong CSDL sẽ bị xóa trái phép. Bảo mật thực tế phải luôn nằm tại Backend.',
              }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Câu 12: Trình bày ba bằng chứng cần có để chứng minh upload Avatar thật sự thành công.', bold: true, color: secondaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Ba lớp bằng chứng độc lập (3-Tier Evidence) bắt buộc phải có:\n' +
                  '1. Bằng chứng HTTP: Request trả về status 200 OK kèm JSON data.avatarUrl dạng /uploads/<uuid>.<ext>.\n' +
                  '2. Bằng chứng Ổ đĩa: Trong thư mục public/uploads/ xuất hiện tệp ảnh mới với tên UUID trùng khớp, mở đường dẫn tĩnh trên trình duyệt trả về HTTP 200 OK.\n' +
                  '3. Bằng chứng CSDL: Chạy truy vấn SELECT trong SQL Server thấy cột avatarUrl của đúng User đã được cập nhật, tài khoản khác không bị ảnh hưởng và dữ liệu tồn tại bền vững qua restart server.',
              }),
            ],
          }),

          new Paragraph({ spacing: { after: 140 } }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Giải Pháp Cho Các Bài Tập Mở Rộng: ', bold: true, color: primaryColor }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Thu dọn Avatar cũ: ', bold: true }),
              new TextRun({ text: 'Trong service updateUserAvatar, trước khi cập nhật CSDL, lấy đường dẫn ảnh cũ user.avatarUrl. Khi CSDL update thành công, gọi fs.unlinkSync() xóa ảnh cũ trên đĩa để tránh tệp mồ côi.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Chuyển sang Cloud Object Storage: ', bold: true }),
              new TextRun({ text: 'Dùng multer-s3 upload luồng stream trực tiếp lên AWS S3 hoặc Google Cloud Storage; cột dbo.Users.avatarUrl lưu URL tuyệt đối từ CDN. Database vẫn chỉ lưu chuỗi URL, giữ kiến trúc serverless stateless hoàn hảo.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Axios Progress Bar & AbortController: ', bold: true }),
              new TextRun({ text: 'Sử dụng cấu hình onUploadProgress tính toán tỷ lệ % tải lên và AbortController hủy request tải file khi người dùng chuyển trang để tiết kiệm băng thông.' }),
            ],
          }),

          new Paragraph({ spacing: { after: 200 } }),

          // -------------------------------------------------------------
          // MỤC 11: KẾT LUẬN & HƯỚNG DẪN VẬN HÀNH HỆ THỐNG
          // -------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({ text: '11. Kết Luận & Hướng Dẫn Vận Hành Hệ Thống', bold: true, size: 26, color: primaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Bài thực hành Chương 07 đã hoàn thành đầy đủ các mục tiêu kỹ thuật đề ra. Hệ thống kết nối trơn tru end-to-end từ giao diện người dùng React Vite tới API Express 5 và CSDL SQL Server, bảo vệ an toàn đối với tệp tin tải lên và tuân thủ nghiêm ngặt chuẩn mực phân quyền RBAC.',
              }),
            ],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              makeRow([
                { text: 'Bước thực hiện', width: 30, isHeader: true },
                { text: 'Lệnh thực thi dòng lệnh (Command)', width: 45, isHeader: true },
                { text: 'Mục đích & Đầu ra kiểm tra', width: 25, isHeader: true },
              ]),
              makeRow([
                { text: '1. Khởi động Backend', width: 30, bold: true },
                { text: 'pnpm run dev', width: 45 },
                { text: 'Chạy tại http://localhost:5000', width: 25 },
              ]),
              makeRow([
                { text: '2. Khởi động Frontend', width: 30, bold: true },
                { text: 'pnpm run dev:frontend', width: 45 },
                { text: 'Mở http://localhost:5173', width: 25 },
              ]),
              makeRow([
                { text: '3. Kiểm thử kịch bản Upload', width: 30, bold: true },
                { text: 'pnpm run test:upload', width: 45 },
                { text: 'Kiểm tra kịch bản tải lên avatar', width: 25 },
              ]),
              makeRow([
                { text: '4. Kiểm thử Frontend & CORS', width: 30, bold: true },
                { text: 'pnpm run test:frontend', width: 45 },
                { text: 'Kiểm tra giao diện và kết nối CORS', width: 25 },
              ]),
              makeRow([
                { text: '5. Biên dịch mã nguồn', width: 30, bold: true },
                { text: 'pnpm build && pnpm build:frontend', width: 45 },
                { text: 'Kiểm tra biên dịch TypeScript', width: 25 },
              ]),
            ],
          }),

          new Paragraph({ spacing: { after: 240 } }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: 'Người lập báo cáo: ', bold: true }),
              new TextRun({ text: 'ĐẶNG BẮC NAM\n', bold: true, color: primaryColor }),
              new TextRun({ text: 'Mã dự án: BACKEND-20261001-DANGBACNAM', italics: true, color: '64748B' }),
            ],
          }),
        ],
      },
    ],
  });

  const docxOutputPath = path.resolve(process.cwd(), 'docs', 'Bao_Cao_Thuc_Hanh_Chuong_07.docx');
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(docxOutputPath, buffer);
  console.log(`✅ Đã tạo thành công file Word: ${docxOutputPath}`);

  const pdfOutputPath = path.resolve(process.cwd(), 'docs', 'Bao_Cao_Thuc_Hanh_Chuong_07.pdf');
  const rootPdfPath = path.resolve(process.cwd(), 'Bao_Cao_Thuc_Hanh_Chuong_07.pdf');

  console.log('🔄 Đang xuất file PDF qua Microsoft Word Engine...');
  const psScriptPath = path.resolve(process.cwd(), 'docs', 'convert_pdf_c7.ps1');
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
      console.log(`🎉 ĐÃ XUẤT FILE PDF THÀNH CÔNG TẠI:`);
      console.log(`   1. ${pdfOutputPath}`);
      try {
        fs.copyFileSync(pdfOutputPath, rootPdfPath);
        console.log(`   2. ${rootPdfPath}`);
      } catch (copyErr: any) {
        console.log(`   ℹ️ File tại thư mục gốc: ${rootPdfPath}`);
      }
    }
    if (fs.existsSync(psScriptPath)) {
      fs.unlinkSync(psScriptPath);
    }
  } catch (err) {
    console.warn('⚠️ Lỗi khi chạy script xuất PDF:', err);
  }
}

generateChapter07Report().catch((err) => {
  console.error('Lỗi thực thi:', err);
  process.exit(1);
});
