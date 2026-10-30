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

async function generateChapter09Report() {
  console.log('🚀 Đang khởi tạo Báo cáo Thực hành Chương 09 theo đặc tả giáo trình (Word & PDF)...');

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

  const insertImageWithCaption = (imagePath: string, caption: string, width = 530, height = 280): Paragraph[] => {
    const fullPath = path.resolve(process.cwd(), imagePath);
    if (!fs.existsSync(fullPath)) {
      console.warn(`⚠️ Không tìm thấy ảnh tại: ${fullPath}`);
      return [
        new Paragraph({
          children: [new TextRun({ text: `[Không tìm thấy ảnh: ${imagePath}]`, italics: true, color: 'DC2626' })],
        }),
      ];
    }
    const imageBuffer = fs.readFileSync(fullPath);
    return [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 180, after: 80 },
        children: [
          new ImageRun({
            data: imageBuffer,
            transformation: { width, height },
            type: 'png',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 180 },
        children: [
          new TextRun({
            text: `Hình minh chứng: ${caption}`,
            italics: true,
            size: 18,
            color: '475569',
          }),
        ],
      }),
    ];
  };

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Times New Roman',
            size: 24, // 12pt
            color: darkTextColor,
          },
          paragraph: {
            spacing: { line: 276, before: 60, after: 60 }, // 1.15 line spacing
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }, // 1 inch = 1440 twips
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: 'Báo cáo Thực hành Chương 09 | Trang ', size: 18, color: '64748B' }),
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
          // TIÊU ĐỀ TRANG BÌA BÁO CÁO
          // -------------------------------------------------------------
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: 'HỌC VIỆN / KHOA CÔNG NGHỆ THÔNG TIN',
                bold: true,
                size: 24,
                color: '475569',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 },
            children: [
              new TextRun({
                text: 'HỌC PHẦN: LẬP TRÌNH BACKEND CHUYÊN SÂU',
                bold: true,
                size: 26,
                color: secondaryColor,
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 100 },
            children: [
              new TextRun({
                text: 'BÁO CÁO KẾT QUẢ THỰC HÀNH',
                bold: true,
                size: 36,
                color: primaryColor,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: 'CHƯƠNG 09: KIỂM THỬ, BẢO MẬT & TRIỂN KHAI HỆ THỐNG BACKEND',
                bold: true,
                size: 28,
                color: secondaryColor,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: 'Jest · Supertest · Helmet · Rate Limiting · SQL Server · Docker Compose',
                italics: true,
                size: 22,
                color: '475569',
              }),
            ],
          }),

          // BẢNG THÔNG TIN SINH VIÊN
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              makeRow([
                { text: 'Thông Tin Đề Án & Tác Giả', width: 100, isHeader: true, align: AlignmentType.CENTER },
              ]),
              makeRow([
                { text: 'Họ và tên sinh viên:', width: 35, bold: true },
                { text: 'ĐẶNG BẮC NAM', width: 65, bold: true, color: primaryColor },
              ]),
              makeRow([
                { text: 'Mã dự án (Repository):', width: 35, bold: true },
                { text: 'BACKEND-20261001-DANGBACNAM', width: 65, bold: true },
              ]),
              makeRow([
                { text: 'Công nghệ áp dụng:', width: 35, bold: true },
                { text: 'Node.js (v24), Express 5, TypeScript (ESM), Sequelize 6, SQL Server, Jest, Supertest, Helmet, Docker', width: 65 },
              ]),
              makeRow([
                { text: 'Phạm vi triển khai:', width: 35, bold: true },
                { text: 'Buổi 12: Automated Testing (Jest/Supertest); Buổi 13: Security & SQL Optimization; Buổi 14: Dockerization & Deployment', width: 65 },
              ]),
            ],
          }),

          new Paragraph({ spacing: { after: 240 } }),

          // -------------------------------------------------------------
          // MỤC 1: ĐỊNH HƯỚNG, MỤC TIÊU & KHẢO SÁT ĐẦU VÀO
          // -------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({ text: '1. Định Hướng, Mục Tiêu & Khảo Sát Đầu Vào (Slide 01 – 06)', bold: true, size: 26, color: primaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Chương 09 là giai đoạn hoàn thiện toàn diện hệ thống backend-quan-ly-sinh-vien sau khi đã xây dựng xong các phân hệ CRUD, xác thực JWT, upload ảnh đại diện Multer, và phân trang tìm kiếm ở các chương trước. Quy trình thực hiện gồm 4 trụ cột cốt lõi: TEST → SECURE → DOCKER → DEPLOY.',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Lộ trình 3 buổi thực hành chính thức:', bold: true }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Buổi 12 (Lab 1 - Automated Testing): ', bold: true }),
              new TextRun({ text: 'Xây dựng bộ kiểm thử đơn vị (Unit Test) cho logic Đăng nhập bằng Jest và Mock; xây dựng bộ kiểm thử API bằng Supertest kiểm tra trạng thái HTTP (200, 400, 401, 500) và sự có mặt của JWT.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Buổi 13 (Lab 2 - Security & SQL Optimization): ', bold: true }),
              new TextRun({ text: 'Tích hợp HTTP security headers với Helmet; thiết lập giới hạn tần suất yêu cầu (Rate Limiting) cho POST /api/auth/login nhận HTTP 429; rà soát an toàn mã nguồn và đo lường truy vấn SQL Server bằng STATISTICS IO/TIME.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Buổi 14 (Lab 3 - Dockerization & Deployment): ', bold: true }),
              new TextRun({ text: 'Đóng gói ứng dụng bằng Dockerfile đa tầng (multi-stage build); khai báo cụm dịch vụ với Docker Compose; kiểm chứng cơ chế dữ liệu bền vững (Named Volume Persistence).' }),
            ],
          }),

          new Paragraph({ spacing: { after: 120 } }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Bảng kiểm tra trạng thái ban đầu của hệ thống (Slide 06):', bold: true, color: secondaryColor }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              makeRow([
                { text: 'Mã kiểm tra', width: 20, isHeader: true },
                { text: 'Thành phần kiểm tra', width: 45, isHeader: true },
                { text: 'Kết quả hệ thống ghi nhận', width: 35, isHeader: true },
              ]),
              makeRow([
                { text: 'C08-01', width: 20, bold: true },
                { text: 'GET danh sách sinh viên', width: 45 },
                { text: 'HTTP 200, trả về mảng dữ liệu và metadata pagination', width: 35 },
              ]),
              makeRow([
                { text: 'C08-02', width: 20, bold: true },
                { text: 'GET ?search=Anh', width: 45 },
                { text: 'HTTP 200, lọc chính xác tại SQL Server', width: 35 },
              ]),
              makeRow([
                { text: 'C08-03', width: 20, bold: true },
                { text: 'GET ?page=-1 (Validation)', width: 45 },
                { text: 'HTTP 400 Bad Request, thông báo lỗi rõ ràng', width: 35 },
              ]),
              makeRow([
                { text: 'C08-04', width: 20, bold: true },
                { text: 'POST /api/auth/login đúng', width: 45 },
                { text: 'HTTP 200, cấp Access Token Bearer hợp lệ', width: 35 },
              ]),
              makeRow([
                { text: 'C08-05', width: 20, bold: true },
                { text: 'GET /api/auth/profile thiếu JWT', width: 45 },
                { text: 'HTTP 401 Unauthorized', width: 35 },
              ]),
              makeRow([
                { text: 'C08-06', width: 20, bold: true },
                { text: 'Student gọi DELETE sinh viên', width: 45 },
                { text: 'HTTP 403 Forbidden theo phân quyền RBAC', width: 35 },
              ]),
              makeRow([
                { text: 'C08-07', width: 20, bold: true },
                { text: 'Upload avatar Multer', width: 45 },
                { text: 'Phục vụ tĩnh /uploads bình thường', width: 35 },
              ]),
              makeRow([
                { text: 'C08-08', width: 20, bold: true },
                { text: 'Biên dịch mã nguồn (pnpm build)', width: 45 },
                { text: 'Biên dịch TypeScript hoàn tất không lỗi', width: 35 },
              ]),
            ],
          }),

          new Paragraph({ spacing: { after: 180 } }),

          // -------------------------------------------------------------
          // MỤC 2: BẢN ĐỒ DỰ ÁN & TÁCH APP/SERVER
          // -------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({ text: '2. Bản Đồ Dự Án & Phân Tách Kiến Trúc app.ts / server.ts (Slide 05, 13)', bold: true, size: 26, color: primaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Theo chỉ dẫn kỹ thuật tại Slide 05 và Slide 13, để Supertest có thể gửi HTTP request trực tiếp vào Express app mà không cần mở cổng mạng thật (tránh xung đột cổng khi chạy song song), dự án thực hiện tái cấu trúc phân tách rõ ràng:',
              }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'src/app.ts: ', bold: true }),
              new TextRun({ text: 'Khởi tạo Express app, cấu hình logger, helmet, cors, body parser, đăng ký toàn bộ router (/api/auth, /api/v1/sinh-vien, /api-docs, /uploads), fallback 404 và middleware xử lý lỗi tập trung errorMiddleware. Cuối file thực hiện export { app } và export default app.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'src/server.ts: ', bold: true }),
              new TextRun({ text: 'Chịu trách nhiệm nạp biến môi trường, xác thực kết nối CSDL SQL Server (sequelize.authenticate()), và gọi app.listen(PORT) để lắng nghe kết nối từ bên ngoài.' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Cấu trúc này đảm bảo các lệnh dev, build, start hiện có hoạt động bình thường, đồng thời cho phép file kiểm thử tests/api/auth.api.test.ts import app và thực thi nhanh chóng.',
                italics: true,
              }),
            ],
          }),

          new Paragraph({ spacing: { after: 180 } }),

          // -------------------------------------------------------------
          // MỤC 3: BUỔI 12 - LAB 1: KIỂM THỬ TỰ ĐỘNG (JEST & SUPERTEST)
          // -------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({ text: '3. Buổi 12 — Lab 1: Kiểm Thử Tự Động Với Jest & Supertest (Slide 07 – 16)', bold: true, size: 26, color: primaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '3.1. Thiết lập môi trường kiểm thử Jest cho TypeScript ESM:', bold: true, color: secondaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Do dự án cấu hình NodeNext ESM ("type": "module" trong package.json), việc chạy Jest đòi hỏi cấu hình tương thích đặc thù:\n',
              }),
              new TextRun({ text: '- Tạo file cấu hình: ', bold: true }),
              new TextRun({ text: 'jest.config.mjs với moduleNameMapper xử lý phần mở rộng .js trong TypeScript, và ts-jest sử dụng tùy chọn useESM: true.\n' }),
              new TextRun({ text: '- Tạo file cấu hình TypeScript riêng: ', bold: true }),
              new TextRun({ text: 'tsconfig.spec.json mở rộng từ tsconfig.json gốc, bổ sung thư mục tests/ vào phạm vi biên dịch và kích hoạt isolatedModules: true.\n' }),
              new TextRun({ text: '- Script chạy kiểm thử: ', bold: true }),
              new TextRun({ text: '"test": "node --experimental-vm-modules node_modules/jest/bin/jest.js".' }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: '3.2. Triển khai 5 Unit Test cho logic Đăng nhập (T01 – T05):', bold: true, color: secondaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'File kiểm thử tests/unit/login.test.ts kiểm tra trực tiếp hàm loginUser(input) trong src/services/auth.service.ts theo mô hình Arrange - Act - Assert (AAA). Các phụ thuộc bên ngoài được Mock có kiểm soát bằng jest.spyOn:',
              }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'T01 (Tài khoản tồn tại, mật khẩu đúng): ', bold: true }),
              new TextRun({ text: 'Mock User.findOne trả về thông tin user; mock bcrypt.compare trả về true. Kết quả kiểm tra nhận được accessToken chuỗi và tokenType là Bearer.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'T02 (Tài khoản tồn tại, mật khẩu sai): ', bold: true }),
              new TextRun({ text: 'Mock bcrypt.compare trả về false. Hàm ném lỗi AppError với statusCode = 401 và thông báo "Email hoặc mật khẩu không chính xác".' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'T03 (Tài khoản không tồn tại): ', bold: true }),
              new TextRun({ text: 'Mock User.findOne trả về null. Hàm ném lỗi AppError 401 với cùng thông điệp chung nhằm chống dò quét tài khoản.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'T04 (Thiếu trường email hoặc mật khẩu): ', bold: true }),
              new TextRun({ text: 'Kiểm tra dữ liệu rỗng hoặc sai kiểu; validation chặn lại và ném AppError với statusCode = 400.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'T05 (Lỗi phát sinh từ Database): ', bold: true }),
              new TextRun({ text: 'Mock User.findOne trả về Promise bị reject với lỗi kết nối CSDL. Hàm xử lý ném lỗi an toàn, không làm crash tiến trình.' }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: '3.3. Triển khai 7 API Test với Supertest (A01 – A07):', bold: true, color: secondaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'File kiểm thử tests/api/auth.api.test.ts gửi HTTP request trực tiếp vào app để kiểm chứng hợp đồng API:',
              }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'A01: ', bold: true }),
              new TextRun({ text: 'POST /api/auth/login thông tin chính xác → HTTP 200 OK, cấp accessToken.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'A02: ', bold: true }),
              new TextRun({ text: 'POST /api/auth/login sai mật khẩu → HTTP 401 Unauthorized, không có JWT.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'A03: ', bold: true }),
              new TextRun({ text: 'POST /api/auth/login email không tồn tại → HTTP 401 Unauthorized.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'A04: ', bold: true }),
              new TextRun({ text: 'POST /api/auth/login thiếu mật khẩu → HTTP 400 Bad Request.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'A05: ', bold: true }),
              new TextRun({ text: 'GET /api/auth/profile không gửi Token → HTTP 401 Unauthorized.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'A06: ', bold: true }),
              new TextRun({ text: 'GET /api/auth/profile có Bearer Token hợp lệ → HTTP 200 OK, trả thông tin hồ sơ và không chứa trường passwordHash.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'A07: ', bold: true }),
              new TextRun({ text: 'GET /api/v1/sinh-vien/test-500 → HTTP 500 Internal Server Error, không rò rỉ chuỗi kết nối hay mật khẩu trong body.' }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: '3.4. Thử nghiệm kiểm thử FAIL có chủ đích (Slide 12):', bold: true, color: secondaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Trong quá trình thực nghiệm, tiến hành cố tình sửa điều kiện assertion trong ca T02 từ kỳ vọng mã lỗi 401 thành 200. Jest đã bắt đúng sai lệch này và báo lỗi FAIL cụ thể: "Expected statusCode: 200, Received: 401". Sau khi khôi phục assertion về đúng 401, test suite chuyển trạng thái PASS hoàn toàn. Thử nghiệm này chứng minh bộ test thực sự kiểm tra logic nghiệp vụ chứ không tạo ra kết quả giả định.',
              }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: '3.5. Bài tập mở rộng: Unit Test cho logic tính tổng giỏ hàng (Slide 16):', bold: true, color: secondaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'File tests/unit/cart.test.ts hiện thực hàm calculateCartTotal và kiểm thử 5 tình huống (C01–C05): giỏ hàng rỗng (trả về 0), nhiều sản phẩm (tính đúng subtotal), áp dụng giảm giá hợp lệ 10% và 50%, chặn tỷ lệ giảm giá âm hoặc > 100%, và ném lỗi khi số lượng hoặc giá tiền mang giá trị âm.',
              }),
            ],
          }),

          new Paragraph({ spacing: { after: 180 } }),

          // -------------------------------------------------------------
          // MỤC 4: BUỔI 13 - LAB 2: BẢO MẬT API & TỐI ƯU HÓA SQL
          // -------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({ text: '4. Buổi 13 — Lab 2: Bảo Mật API & Tối Ưu Hóa Truy Vấn SQL (Slide 17 – 25)', bold: true, size: 26, color: primaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '4.1. Cấu hình Helmet bổ sung Security Headers:', bold: true, color: secondaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Middleware helmet() được tích hợp trong src/app.ts giúp thiết lập tự động các header phòng thủ: loại bỏ X-Powered-By, gắn X-Content-Type-Options: nosniff chống tấn công suy đoán MIME, gắn X-Frame-Options: SAMEORIGIN chống Clickjacking, và HSTS bắt buộc kết nối bảo mật.',
              }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: '4.2. Cấu hình Rate Limiter riêng cho endpoint Đăng nhập:', bold: true, color: secondaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'File src/middlewares/rate-limit.middleware.ts khai báo loginLimiter với cửa sổ windowMs = 60 * 1000 (60 giây), limit = 5 (tối đa 5 yêu cầu/IP), sử dụng chuẩn header draft-7. Yêu cầu thứ 6 trong cùng cửa sổ lập tức nhận phản hồi HTTP 429 Too Many Requests theo cấu trúc JSON chuẩn: { success: false, status: 429, message: "Bạn đã gửi quá nhiều yêu cầu", data: null }.',
              }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: '4.3. Báo cáo Rà soát Bảo mật Hệ thống (docs/security-report.md):', bold: true, color: secondaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Báo cáo chi tiết đã kiểm tra 6 nhóm rủi ro: SQL Injection (toàn bộ truy vấn dùng Sequelize ORM hoặc bind parameter), XSS (React tự động escape dữ liệu), Information Disclosure (lỗi 500 che giấu stack trace khi production), Privilege Escalation (từ chối client gửi role khi đăng ký), User Enumeration (dùng chung thông báo lỗi 401), và Brute-force Login (bảo vệ bởi loginLimiter).',
              }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: '4.4. Đo lường và phân tích hiệu năng SQL Server (docs/sql-optimization.md):', bold: true, color: secondaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Sử dụng lệnh SET STATISTICS IO ON; SET STATISTICS TIME ON; trong SQL Server để đo lường thực tế câu lệnh tìm kiếm sinh viên. Kết quả đo được: câu lệnh chưa tối ưu quét toàn bộ bảng và nạp thừa các cột không cần thiết; câu lệnh tối ưu chỉ định cụ thể 4 cột (maSV, hoTen, email, maLop), áp dụng ORDER BY maSV ASC và OFFSET/FETCH, giúp chèn thêm toán tử Top vào Execution Plan, giảm tải I/O và tối ưu bộ nhớ đệm Buffer Cache của CSDL.',
              }),
            ],
          }),

          new Paragraph({ spacing: { after: 180 } }),

          // -------------------------------------------------------------
          // MỤC 5: BUỔI 14 - LAB 3: ĐÓNG GÓI DOCKER & DỮ LIỆU BỀN VỮNG
          // -------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({ text: '5. Buổi 14 — Lab 3: Đóng Gói Docker & Dữ Liệu Bền Vững (Slide 26 – 36)', bold: true, size: 26, color: primaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '5.1. Dockerfile Multi-Stage Build & .dockerignore:', bold: true, color: secondaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Dockerfile được phân tách thành 2 giai đoạn: Stage 1 (Build) biên dịch TypeScript bằng pnpm; Stage 2 (Runtime) dựa trên node:22-bookworm-slim chỉ nạp dependencies production và thư mục dist/ đã biên dịch. Tệp .dockerignore loại bỏ triệt để node_modules, .env, .git khỏi build context.',
              }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: '5.2. Khai báo cụm dịch vụ với Docker Compose (compose.yaml):', bold: true, color: secondaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Khai báo dịch vụ backend (cổng 5000) và dịch vụ sqlserver (image mcr.microsoft.com/mssql/server:2022-latest). Kết nối giữa 2 container thông qua tên dịch vụ DB_HOST=sqlserver. Cơ chế healthcheck bảo đảm backend chỉ khởi động khi SQL Server đã sẵn sàng nhận kết nối.',
              }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: '5.3. Xác minh tính bền vững của dữ liệu (Data Persistence):', bold: true, color: secondaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Sử dụng Named Volume sqlserver-data lưu trữ thư mục /var/opt/mssql và uploads-data lưu trữ ảnh đại diện. Khi thực hiện lệnh docker compose down (không dùng cờ -v) để xóa container và mạng, sau đó chạy lại docker compose up -d, toàn bộ dữ liệu người dùng và file tải lên vẫn tồn tại nguyên vẹn.',
              }),
            ],
          }),

          new Paragraph({ spacing: { after: 180 } }),

          // -------------------------------------------------------------
          // MỤC 6: MINH CHỨNG THỰC NGHIỆM HÌNH ẢNH
          // -------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({ text: '6. Minh Chứng Thực Nghiệm Hình Ảnh', bold: true, size: 26, color: primaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Dưới đây là hình ảnh chụp trực tiếp từ công cụ Postman, cửa sổ dòng lệnh Terminal, công cụ đo lường CSDL và kiến trúc Docker:',
              }),
            ],
          }),

          ...insertImageWithCaption(
            'docs/screenshots/postman-c9-01-rate-limit-429.png',
            'Ca S02 — Postman kiểm thử Rate Limiting: Gửi request lần thứ 6 trong 60s nhận HTTP 429 Too Many Requests',
            540,
            260
          ),
          ...insertImageWithCaption(
            'docs/screenshots/postman-c9-02-rate-limit-headers.png',
            'Ca S05 — Response Headers minh chứng Helmet Security Headers và RateLimit Draft-7',
            540,
            260
          ),
          ...insertImageWithCaption(
            'docs/screenshots/postman-c9-03-supertest-api-a01.png',
            'Ca A01 — Supertest API Test: POST /api/auth/login thành công HTTP 200 OK và cấp Token',
            540,
            230
          ),
          ...insertImageWithCaption(
            'docs/screenshots/postman-c9-04-supertest-api-a06-profile.png',
            'Ca A06 — Supertest API Test: GET /api/auth/profile với Bearer Token HTTP 200 OK',
            540,
            230
          ),
          ...insertImageWithCaption(
            'docs/screenshots/terminal-c9-01-jest-unit-tests.png',
            'Terminal Jest Test Runner: 5 Unit Tests Login (T01 – T05) thực thi thành công với Mock',
            540,
            250
          ),
          ...insertImageWithCaption(
            'docs/screenshots/terminal-c9-02-jest-coverage.png',
            'Báo cáo Test Coverage: Độ bao phủ kiểm thử các module src/app, auth.service, error.middleware',
            540,
            250
          ),
          ...insertImageWithCaption(
            'docs/screenshots/ssms-c9-01-sql-statistics.png',
            'Đo lường SQL Server: Kết quả STATISTICS IO, TIME ON thực tế',
            540,
            200
          ),
          ...insertImageWithCaption(
            'docs/screenshots/docker-c9-01-compose-architecture.png',
            'Kiến trúc Dockerfile Multi-Stage và khai báo Orchestration compose.yaml',
            540,
            260
          ),

          new Paragraph({ spacing: { after: 180 } }),

          // -------------------------------------------------------------
          // MỤC 7: MA TRẬN KỊCH BẢN KIỂM THỬ THỰC TẾ
          // -------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({ text: '7. Bảng Kịch Bản Kiểm Thử & Hiện Trạng Phản Hồi (Slide 39)', bold: true, size: 26, color: primaryColor }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Bảng 1: Nhóm Unit Testing cho logic Đăng nhập (T01 đến T05)', bold: true, color: primaryColor }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              makeRow([
                { text: 'Mã Ca', width: 10, isHeader: true },
                { text: 'Tình huống kiểm thử', width: 35, isHeader: true },
                { text: 'Kỳ vọng kỹ thuật', width: 25, isHeader: true },
                { text: 'Hiện trạng phản hồi thực tế', width: 30, isHeader: true },
              ]),
              makeRow([
                { text: 'T01', width: 10, bold: true },
                { text: 'Tài khoản có, mật khẩu đúng', width: 35 },
                { text: 'Xác thực thành công, trả Token', width: 25 },
                { text: 'Cấp accessToken chuỗi, tokenType: Bearer, hạn 3600s', width: 30 },
              ]),
              makeRow([
                { text: 'T02', width: 10, bold: true },
                { text: 'Tài khoản có, mật khẩu sai', width: 35 },
                { text: 'Từ chối, ném lỗi 401', width: 25 },
                { text: 'Ném AppError(401, "Email hoặc mật khẩu không chính xác")', width: 30 },
              ]),
              makeRow([
                { text: 'T03', width: 10, bold: true },
                { text: 'Tài khoản không tồn tại', width: 35 },
                { text: 'Từ chối, ném lỗi 401', width: 25 },
                { text: 'Ném AppError(401), cùng thông báo như T02', width: 30 },
              ]),
              makeRow([
                { text: 'T04', width: 10, bold: true },
                { text: 'Thiếu email hoặc password', width: 35 },
                { text: 'Bị chặn tại validation (400)', width: 25 },
                { text: 'Ném AppError(400, "Cần cung cấp đầy đủ email và password")', width: 30 },
              ]),
              makeRow([
                { text: 'T05', width: 10, bold: true },
                { text: 'Lỗi Database / logic xác thực', width: 35 },
                { text: 'Ném ngoại lệ an toàn', width: 25 },
                { text: 'Promise reject được bắt giữ, không lộ secret', width: 30 },
              ]),
            ],
          }),

          new Paragraph({ spacing: { after: 140 } }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Bảng 2: Nhóm API Testing với Supertest (A01 đến A07)', bold: true, color: primaryColor }),
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
                { text: 'A01', width: 10, bold: true },
                { text: 'POST /api/auth/login hợp lệ', width: 35 },
                { text: '200', width: 15, align: AlignmentType.CENTER },
                { text: '200', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'Trả về accessToken và tokenType: Bearer', width: 25 },
              ]),
              makeRow([
                { text: 'A02', width: 10, bold: true },
                { text: 'POST /api/auth/login sai mật khẩu', width: 35 },
                { text: '401', width: 15, align: AlignmentType.CENTER },
                { text: '401', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'Không có JWT, status=401, data=null', width: 25 },
              ]),
              makeRow([
                { text: 'A03', width: 10, bold: true },
                { text: 'POST /api/auth/login user không tồn tại', width: 35 },
                { text: '401', width: 15, align: AlignmentType.CENTER },
                { text: '401', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'Không có JWT, status=401, data=null', width: 25 },
              ]),
              makeRow([
                { text: 'A04', width: 10, bold: true },
                { text: 'POST /api/auth/login thiếu password', width: 35 },
                { text: '400', width: 15, align: AlignmentType.CENTER },
                { text: '400', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'Bắt lỗi validation, status=400', width: 25 },
              ]),
              makeRow([
                { text: 'A05', width: 10, bold: true },
                { text: 'GET /api/auth/profile không gửi Token', width: 35 },
                { text: '401', width: 15, align: AlignmentType.CENTER },
                { text: '401', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'isAuth chặn: thiếu Bearer Token', width: 25 },
              ]),
              makeRow([
                { text: 'A06', width: 10, bold: true },
                { text: 'GET /api/auth/profile có Bearer Token', width: 35 },
                { text: '200', width: 15, align: AlignmentType.CENTER },
                { text: '200', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'Trả đúng thông tin, không lộ passwordHash', width: 25 },
              ]),
              makeRow([
                { text: 'A07', width: 10, bold: true },
                { text: 'Lỗi hệ thống mô phỏng test-500', width: 35 },
                { text: '500', width: 15, align: AlignmentType.CENTER },
                { text: '500', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'Không lộ chuỗi kết nối, secret hay mật khẩu', width: 25 },
              ]),
            ],
          }),

          new Paragraph({ spacing: { after: 140 } }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Bảng 3: Nhóm Bảo mật & Giới hạn tần suất (S01 đến S07)', bold: true, color: primaryColor }),
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
                { text: 'S01', width: 10, bold: true },
                { text: '5 Login requests đầu trong 60 giây', width: 35 },
                { text: '200', width: 15, align: AlignmentType.CENTER },
                { text: '200', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'Được xử lý bình thường, trừ dần hạn mức', width: 25 },
              ]),
              makeRow([
                { text: 'S02', width: 10, bold: true },
                { text: 'Login request thứ 6 trong cùng 60 giây', width: 35 },
                { text: '429', width: 15, align: AlignmentType.CENTER },
                { text: '429', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'Bị chặn: "Bạn đã gửi quá nhiều yêu cầu"', width: 25 },
              ]),
              makeRow([
                { text: 'S03', width: 10, bold: true },
                { text: 'Đợi hết cửa sổ 60 giây và gửi lại', width: 35 },
                { text: '200', width: 15, align: AlignmentType.CENTER },
                { text: '200', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'Hạn mức được làm mới về 5 yêu cầu', width: 25 },
              ]),
              makeRow([
                { text: 'S04', width: 10, bold: true },
                { text: 'GET /api/v1/sinh-vien không bị giới hạn', width: 35 },
                { text: '200', width: 15, align: AlignmentType.CENTER },
                { text: '200', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'loginLimiter chỉ gắn riêng cho route login', width: 25 },
              ]),
              makeRow([
                { text: 'S05', width: 10, bold: true },
                { text: 'Kiểm tra Helmet Security Headers', width: 35 },
                { text: '200', width: 15, align: AlignmentType.CENTER },
                { text: '200', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'Có x-content-type-options: nosniff, ẩn x-powered-by', width: 25 },
              ]),
              makeRow([
                { text: 'S06', width: 10, bold: true },
                { text: 'Login sai mật khẩu trước hạn mức', width: 35 },
                { text: '401', width: 15, align: AlignmentType.CENTER },
                { text: '401', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: '401 Unauthorized, không cấp JWT', width: 25 },
              ]),
              makeRow([
                { text: 'S07', width: 10, bold: true },
                { text: 'Student token gọi DELETE sinh viên', width: 35 },
                { text: '403', width: 15, align: AlignmentType.CENTER },
                { text: '403', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'isAdmin chặn 403 Forbidden theo RBAC', width: 25 },
              ]),
            ],
          }),

          new Paragraph({ spacing: { after: 140 } }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Bảng 4: Nhóm Đóng gói Docker & Triển khai (D01 đến D09)', bold: true, color: primaryColor }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              makeRow([
                { text: 'Mã Ca', width: 10, isHeader: true },
                { text: 'Nội dung kiểm tra', width: 40, isHeader: true },
                { text: 'Trạng thái kỳ vọng', width: 25, isHeader: true },
                { text: 'Hiện trạng phản hồi', width: 25, isHeader: true },
              ]),
              makeRow([
                { text: 'D01', width: 10, bold: true },
                { text: 'Backend container', width: 40 },
                { text: 'Trạng thái chạy hợp lệ (Up)', width: 25 },
                { text: 'Image build đa tầng, cổng 5000 mở', width: 25 },
              ]),
              makeRow([
                { text: 'D02', width: 10, bold: true },
                { text: 'SQL Server container', width: 40 },
                { text: 'Database sẵn sàng kết nối', width: 25 },
                { text: 'Healthcheck healthy trên cổng 1433', width: 25 },
              ]),
              makeRow([
                { text: 'D03', width: 10, bold: true },
                { text: 'GET danh sách SinhVien', width: 40 },
                { text: 'HTTP 200 + dữ liệu SQL thật', width: 25 },
                { text: 'Đọc đúng bảng dbo.SinhVien', width: 25 },
              ]),
              makeRow([
                { text: 'D04', width: 10, bold: true },
                { text: 'Login đúng', width: 40 },
                { text: 'HTTP 200 + JWT', width: 25 },
                { text: 'Cấp Access Token Bearer', width: 25 },
              ]),
              makeRow([
                { text: 'D05', width: 10, bold: true },
                { text: 'Login sai', width: 40 },
                { text: 'HTTP 401, không có JWT', width: 25 },
                { text: 'Chặn 401 Unauthorized', width: 25 },
              ]),
              makeRow([
                { text: 'D06', width: 10, bold: true },
                { text: 'Gọi vượt Rate Limit', width: 40 },
                { text: 'HTTP 429 Too Many Requests', width: 25 },
                { text: 'Chặn request thứ 6 trong 60s', width: 25 },
              ]),
              makeRow([
                { text: 'D07', width: 10, bold: true },
                { text: 'Phân trang ?page=2&limit=2', width: 40 },
                { text: 'Phân trang như Chương 08', width: 25 },
                { text: 'Sắp xếp ổn định theo maSV', width: 25 },
              ]),
              makeRow([
                { text: 'D08', width: 10, bold: true },
                { text: 'Profile thiếu JWT', width: 40 },
                { text: 'HTTP 401 Unauthorized', width: 25 },
                { text: 'Bảo vệ bởi middleware isAuth', width: 25 },
              ]),
              makeRow([
                { text: 'D09', width: 10, bold: true },
                { text: 'Lỗi hệ thống / log container', width: 40 },
                { text: 'Response không lộ secret', width: 25 },
                { text: 'Ẩn stack trace và connection string', width: 25 },
              ]),
            ],
          }),

          new Paragraph({ spacing: { after: 140 } }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Bảng 5: Nhóm Kiểm thử Hồi quy các chức năng cũ (R01 đến R05)', bold: true, color: primaryColor }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              makeRow([
                { text: 'Mã Ca', width: 10, isHeader: true },
                { text: 'Mục tiêu kiểm thử hồi quy', width: 40, isHeader: true },
                { text: 'Kết quả kỳ vọng', width: 25, isHeader: true },
                { text: 'Hiện trạng phản hồi', width: 25, isHeader: true },
              ]),
              makeRow([
                { text: 'R01', width: 10, bold: true },
                { text: 'CRUD SinhVien theo phân quyền', width: 40 },
                { text: 'GET public, POST/PUT/DELETE Admin', width: 25 },
                { text: 'Quyền RBAC hoạt động chính xác', width: 25 },
              ]),
              makeRow([
                { text: 'R02', width: 10, bold: true },
                { text: 'Pagination & Search Chương 08', width: 40 },
                { text: 'page, limit, search, totalItems', width: 25 },
                { text: 'Lọc đúng họ tên, metadata đầy đủ', width: 25 },
              ]),
              makeRow([
                { text: 'R03', width: 10, bold: true },
                { text: 'Global Error Middleware', width: 40 },
                { text: '400, 404, 500 cấu trúc JSON chuẩn', width: 25 },
                { text: 'Định dạng lỗi đồng nhất, data: null', width: 25 },
              ]),
              makeRow([
                { text: 'R04', width: 10, bold: true },
                { text: 'Avatar Upload & Phục vụ tĩnh', width: 40 },
                { text: 'Upload ảnh <= 2MB, mở qua /uploads', width: 25 },
                { text: 'Lưu CSDL và file đĩa bình thường', width: 25 },
              ]),
              makeRow([
                { text: 'R05', width: 10, bold: true },
                { text: 'Giao diện React Vite + Axios', width: 40 },
                { text: 'Đăng nhập, hiển thị bảng, phân trang', width: 25 },
                { text: 'Kết nối API mượt mà, không lỗi CORS', width: 25 },
              ]),
            ],
          }),

          new Paragraph({ spacing: { after: 180 } }),

          // -------------------------------------------------------------
          // MỤC 8: DANH MỤC HỒ SƠ BÀN GIAO & VẬN HÀNH
          // -------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({ text: '8. Danh Mục Hồ Sơ Bàn Giao & Hướng Dẫn Vận Hành (Slide 40)', bold: true, size: 26, color: primaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Toàn bộ hồ sơ kiểm thử, tài liệu báo cáo và mã nguồn đã được tổ chức hoàn chỉnh tại repository:',
              }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              makeRow([
                { text: 'Hạng mục hồ sơ', width: 30, isHeader: true },
                { text: 'Đường dẫn tệp / Thư mục', width: 40, isHeader: true },
                { text: 'Nội dung kỹ thuật bàn giao', width: 30, isHeader: true },
              ]),
              makeRow([
                { text: '1. Mã nguồn', width: 30, bold: true },
                { text: 'src/, package.json, tsconfig.json', width: 40 },
                { text: 'Express 5, TypeScript ESM, Sequelize 6', width: 30 },
              ]),
              makeRow([
                { text: '2. Kiểm thử tự động', width: 30, bold: true },
                { text: 'tests/unit/, tests/api/, jest.config.mjs', width: 40 },
                { text: 'Jest, Supertest, ts-jest, tsconfig.spec.json', width: 30 },
              ]),
              makeRow([
                { text: '3. Kết quả test', width: 30, bold: true },
                { text: 'docs/test-results.md', width: 40 },
                { text: 'Ma trận đối chiếu chi tiết các kịch bản', width: 30 },
              ]),
              makeRow([
                { text: '4. Bảo mật API', width: 30, bold: true },
                { text: 'docs/security-report.md + rate-limit', width: 40 },
                { text: 'Helmet headers, loginLimiter HTTP 429', width: 30 },
              ]),
              makeRow([
                { text: '5. Tối ưu SQL', width: 30, bold: true },
                { text: 'docs/sql-optimization.md', width: 40 },
                { text: 'Số đo STATISTICS IO/TIME trước và sau', width: 30 },
              ]),
              makeRow([
                { text: '6. Docker & Compose', width: 30, bold: true },
                { text: 'Dockerfile, .dockerignore, compose.yaml', width: 40 },
                { text: 'Multi-stage build, healthcheck, named volume', width: 30 },
              ]),
              makeRow([
                { text: '7. Báo cáo triển khai', width: 30, bold: true },
                { text: 'docs/deployment-report.md', width: 40 },
                { text: 'Quy trình vận hành và kiểm chứng persistence', width: 30 },
              ]),
              makeRow([
                { text: '8. Postman Collection', width: 30, bold: true },
                { text: 'docs/Chuong09-Test-Security-Docker.json', width: 40 },
                { text: 'Toàn bộ request S01-S07, A01-A07, R01-R05', width: 30 },
              ]),
              makeRow([
                { text: '9. Báo cáo PDF & Word', width: 30, bold: true },
                { text: 'docs/Bao_Cao_Thuc_Hanh_Chuong_09.pdf (.docx)', width: 40 },
                { text: 'Báo cáo kỹ thuật chuẩn mực không tự chấm điểm', width: 30 },
              ]),
            ],
          }),

          new Paragraph({ spacing: { after: 140 } }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Bảng tổng hợp các lệnh kiểm thử và vận hành:', bold: true, color: secondaryColor }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              makeRow([
                { text: 'Mục đích kiểm thử', width: 35, isHeader: true },
                { text: 'Lệnh thực thi dòng lệnh (Command)', width: 65, isHeader: true },
              ]),
              makeRow([
                { text: 'Chạy toàn bộ Jest Test', width: 35, bold: true },
                { text: 'pnpm test (hoặc node --experimental-vm-modules node_modules/jest/bin/jest.js)', width: 65 },
              ]),
              makeRow([
                { text: 'Kiểm tra Test Coverage', width: 35, bold: true },
                { text: 'pnpm test:coverage', width: 65 },
              ]),
              makeRow([
                { text: 'Kiểm thử Live Security & Rate Limit', width: 35, bold: true },
                { text: 'npx tsx src/scripts/run-chapter9-tests.ts', width: 65 },
              ]),
              makeRow([
                { text: 'Đo lường SQL Server thực tế', width: 35, bold: true },
                { text: 'npx tsx src/scripts/measure-sql.ts', width: 65 },
              ]),
              makeRow([
                { text: 'Biên dịch toàn bộ mã nguồn', width: 35, bold: true },
                { text: 'pnpm build && pnpm build:frontend', width: 65 },
              ]),
            ],
          }),

          new Paragraph({ spacing: { after: 240 } }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: 'Báo cáo hoàn thành và được lưu trữ chính thức tại thư mục docs/.', italics: true, size: 20, color: '64748B' }),
            ],
          }),
        ],
      },
    ],
  });

  const docxPath = path.resolve(process.cwd(), 'docs/Bao_Cao_Thuc_Hanh_Chuong_09.docx');
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(docxPath, buffer);
  console.log(`✅ Đã tạo thành công file Word: ${docxPath}`);

  // Xuất file PDF bằng Word COM Object qua PowerShell
  console.log('🔄 Đang xuất file PDF qua Microsoft Word Engine...');
  const pdfDocsPath = path.resolve(process.cwd(), 'docs/Bao_Cao_Thuc_Hanh_Chuong_09.pdf');
  const pdfRootPath = path.resolve(process.cwd(), 'Bao_Cao_Thuc_Hanh_Chuong_09.pdf');

  const psScriptPath = path.resolve(process.cwd(), 'src/scripts/export-pdf-temp-c9.ps1');
  const psScriptContent = `
$ErrorActionPreference = "Stop"
try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $docPath = "${docxPath.replace(/\\/g, '\\\\')}"
    $pdfPath = "${pdfDocsPath.replace(/\\/g, '\\\\')}"
    $doc = $word.Documents.Open($docPath)
    $wdFormatPDF = 17
    $doc.SaveAs([ref]$pdfPath, [ref]$wdFormatPDF)
    $doc.Close()
    $word.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
    Copy-Item -Path $pdfPath -Destination "${pdfRootPath.replace(/\\/g, '\\\\')}" -Force
    Write-Host "PDF EXPORT SUCCESSFUL"
} catch {
    Write-Error $_.Exception.Message
    if ($word) { $word.Quit() }
    exit 1
}
`;
  fs.writeFileSync(psScriptPath, psScriptContent, 'utf-8');

  try {
    execSync(`powershell -ExecutionPolicy Bypass -File "${psScriptPath}"`, { stdio: 'inherit' });
    console.log('🎉 ĐÃ XUẤT FILE PDF THÀNH CÔNG TẠI:');
    console.log(`   1. ${pdfDocsPath}`);
    console.log(`   2. ${pdfRootPath}`);
  } catch (err) {
    console.error('❌ Lỗi khi chuyển đổi PDF qua Word COM:', err);
  } finally {
    if (fs.existsSync(psScriptPath)) {
      fs.unlinkSync(psScriptPath);
    }
  }
}

generateChapter09Report().catch((err) => {
  console.error('Lỗi sinh báo cáo Chương 09:', err);
  process.exit(1);
});
