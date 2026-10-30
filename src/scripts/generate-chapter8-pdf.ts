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

async function generateChapter08Report() {
  console.log('🚀 Đang khởi tạo Báo cáo Thực hành Chương 08 theo đặc tả giáo trình (Word & PDF)...');

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
                  new TextRun({ text: 'Báo cáo Thực hành Chương 08 | Trang ', size: 18, color: '64748B' }),
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
                text: 'CHƯƠNG 08: TRUY VẤN NÂNG CAO & PHÂN TRANG - XỬ LÝ LỖI TẬP TRUNG',
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
                text: 'Sequelize ORM · SQL Server · Express 5 Async Error Flow · React Vite',
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
                { text: 'Node.js (v24), Express 5, TypeScript (ESM), Sequelize 6, SQL Server, Vite, React 19, Axios', width: 65 },
              ]),
              makeRow([
                { text: 'Phạm vi triển khai:', width: 35, bold: true },
                { text: 'Lab 1: Phân trang + Search tại DB; Lab 2: Global Error Middleware; Mở rộng: Stored Procedure, Raw Query, JOIN', width: 65 },
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
              new TextRun({ text: '1. Định Hướng, Mục Tiêu & Khảo Sát Đầu Vào (Slide 01, 04, 05)', bold: true, size: 26, color: primaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Chương 08 phát triển trực tiếp nối tiếp từ dự án backend-quan-ly-sinh-vien đã hoàn thành ở Chương 07 (bao gồm xác thực JWT, phân quyền RBAC và upload ảnh đại diện đại diện Multer). Toàn bộ cơ sở dữ liệu SQL Server, các bảng dbo.SinhVien, dbo.Users, dbo.Lop, các middleware xác thực và giao diện React Vite được giữ nguyên cấu trúc.',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Mục tiêu kỹ thuật của bài thực hành gồm các nội dung cốt lõi:',
              }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Phân trang & Tìm kiếm tại Database (Lab 1): ', bold: true }),
              new TextRun({ text: 'Thực hiện phân trang trực tiếp tại SQL Server bằng Sequelize findAndCountAll với offset và limit. Sắp xếp ổn định ORDER BY maSV ASC. Kết hợp lọc theo họ tên (hoTen) bằng toán tử Op.like trước khi đếm tổng bản ghi và chia trang. Không dùng Array.slice() ở phía client.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Xử lý Lỗi Toàn Cục & Express 5 (Lab 2): ', bold: true }),
              new TextRun({ text: 'Sử dụng cơ chế chuyển lỗi tự động của Express 5; chuẩn hóa cấu trúc phản hồi lỗi { success: false, status, message, data: null }. Đảm bảo che giấu thông tin nhạy cảm (SQL text, secrets, stack trace) khi chạy môi trường production.' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Ba quy tắc bất biến trong kiến trúc:', bold: true }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'pnpm + TypeScript + ESM/NodeNext: ', bold: true }),
              new TextRun({ text: 'Giữ nguyên cấu trúc module ESM với phần mở rộng .js khi import nội bộ.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Cơ sở dữ liệu SQL Server: ', bold: true }),
              new TextRun({ text: 'Không dùng sync({ force: true }) hay sync({ alter: true }); không drop dữ liệu thực tế.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Bảo toàn Auth & Upload: ', bold: true }),
              new TextRun({ text: 'Giữ nguyên middleware isAuth, isAdmin và chức năng upload avatar của Chương 06 và Chương 07.' }),
            ],
          }),

          new Paragraph({ spacing: { after: 180 } }),

          // -------------------------------------------------------------
          // MỤC 2: HỢP ĐỒNG API & HAI LUỒNG NGHIỆP VỤ XUYÊN SUỐT
          // -------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({ text: '2. Hợp Đồng API & Hai Luồng Nghiệp Vụ Xuyên Suốt (Slide 02, 03)', bold: true, size: 26, color: primaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Hệ thống thực hiện phân định rõ hai luồng điều phối request xuyên suốt ứng dụng:',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Luồng A — Xem trang danh sách có phân trang & tìm kiếm:', bold: true, color: secondaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Vite/React (chọn trang 2, từ khóa "Anh") → Axios gửi HTTP GET /api/v1/sinh-vien?page=2&limit=2&search=Anh → Express Route gọi parseSinhVienQuery validate query string → Controller gọi SinhVienService.layDanhSachSinhVien → Sequelize thực thi findAndCountAll() sinh câu lệnh SQL Server: WHERE hoTen LIKE N\'%Anh%\' ORDER BY maSV ASC OFFSET 2 ROWS FETCH NEXT 2 ROWS ONLY → Server trả JSON đúng hợp đồng: data là mảng + metadata pagination → React nhận dữ liệu và cập nhật bảng.',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Luồng B — Xử lý lỗi tập trung:', bold: true, color: 'B91C1C' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Client gửi tham số sai (?page=-1 hoặc ?limit=abc) → parseSinhVienQuery phát hiện sai quy chuẩn, throw new AppError(400, "...") → Express 5 tự động chuyển lỗi tới Global Error Middleware đặt cuối chuỗi pipeline → Handler bắt lỗi, ghi log nội bộ và trả về HTTP 400 với data: null. Khi tìm sinh viên không tồn tại (/SV999), Service phát sinh AppError(404, "Không tìm thấy sinh viên") để Global Handler xuất JSON 404 nhất quán.',
              }),
            ],
          }),

          new Paragraph({ spacing: { after: 120 } }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              makeRow([
                { text: 'Tham số Query', width: 25, isHeader: true },
                { text: 'Quy ước kỹ thuật', width: 45, isHeader: true },
                { text: 'Giá trị mặc định & Ví dụ', width: 30, isHeader: true },
              ]),
              makeRow([
                { text: 'page', width: 25, bold: true },
                { text: 'Số nguyên dương >= 1; nếu sai trả 400 Bad Request', width: 45 },
                { text: 'Mặc định: 1 (Ví dụ: ?page=2)', width: 30 },
              ]),
              makeRow([
                { text: 'limit', width: 25, bold: true },
                { text: 'Số nguyên trong khoảng 1 đến 50; nếu sai trả 400 Bad Request', width: 45 },
                { text: 'Mặc định: 10 (Ví dụ: ?limit=5)', width: 30 },
              ]),
              makeRow([
                { text: 'search', width: 25, bold: true },
                { text: 'Chuỗi tìm kiếm theo hoTen; tự động trim khoảng trắng; tối đa 80 ký tự', width: 45 },
                { text: 'Mặc định: "" (Ví dụ: ?search=Anh)', width: 30 },
              ]),
              makeRow([
                { text: 'offset', width: 25, bold: true },
                { text: 'Backend tự tính toán theo công thức: (page - 1) * limit', width: 45 },
                { text: 'page=2, limit=5 -> offset=5', width: 30 },
              ]),
              makeRow([
                { text: 'order', width: 25, bold: true },
                { text: 'Sắp xếp cố định ORDER BY maSV ASC đảm bảo tính ổn định giữa các trang', width: 45 },
                { text: 'Luôn luôn maSV ASC', width: 30 },
              ]),
            ],
          }),

          new Paragraph({ spacing: { after: 120 } }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Cấu trúc phản hồi thành công thống nhất: Trường data là một mảng thuần túy (ISinhVienDTO[]), metadata pagination được đặt ở cấp cao nhất cùng với success và message. Thiết kế này bảo đảm client cũ truy cập response.data.data hoạt động bình thường mà không bị gián đoạn.',
                italics: true,
              }),
            ],
          }),

          new Paragraph({ spacing: { after: 180 } }),

          // -------------------------------------------------------------
          // MỤC 3: LAB 1 - PHÂN TRANG & TÌM KIẾM TẠI SQL SERVER
          // -------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({ text: '3. Lab 1 — Phân Trang & Tìm Kiếm Tại SQL Server (Slide 06, 07, 08, 09, 10, 11)', bold: true, size: 26, color: primaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '3.1. Công thức phân trang & Bài toán tính nhanh:', bold: true, color: secondaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Công thức tính offset: ' }),
              new TextRun({ text: 'offset = (page - 1) * limit\n', bold: true, font: 'Consolas' }),
              new TextRun({ text: 'Bài tính nhanh trên lớp: Nếu page = 5 và limit = 20 thì offset được tính như sau:\n' }),
              new TextRun({ text: 'offset = (5 - 1) * 20 = 4 * 20 = 80.\n', bold: true, color: accentColor }),
              new TextRun({ text: 'Quy ước trường hợp không có dữ liệu (totalItems = 0): Hệ thống trả về data: [], totalPages: 0; giá trị page vẫn giữ nguyên số trang mà client yêu cầu.' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '3.2. Truy vấn T-SQL tương đương trong SQL Server:', bold: true, color: secondaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'SELECT [maSV], [hoTen], [email], [maLop] FROM [dbo].[SinhVien] AS [SinhVien] WHERE [SinhVien].[hoTen] LIKE N\'%Anh%\' ORDER BY [SinhVien].[maSV] ASC OFFSET 2 ROWS FETCH NEXT 2 ROWS ONLY;',
                font: 'Consolas',
                size: 20,
                color: primaryColor,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '- ORDER BY maSV ASC: ', bold: true }),
              new TextRun({ text: 'Tạo thứ tự ổn định giữa các trang; bắt buộc phải có khi dùng mệnh đề OFFSET/FETCH.\n' }),
              new TextRun({ text: '- OFFSET 2: ', bold: true }),
              new TextRun({ text: 'Bỏ qua đúng 2 bản ghi đầu tiên của tập kết quả.\n' }),
              new TextRun({ text: '- FETCH NEXT 2: ', bold: true }),
              new TextRun({ text: 'Chỉ đọc tối đa 2 bản ghi kế tiếp của trang hiện tại.\n' }),
              new TextRun({ text: '- COUNT(*): ', bold: true }),
              new TextRun({ text: 'Đếm tổng số bản ghi thỏa điều kiện lọc để tính tổng số trang: totalPages = Math.ceil(totalItems / limit).' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '3.3. Giải thích câu hỏi tự suy ngẫm (Slide 11):', bold: true, color: secondaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: '"Một sinh viên Lan Anh đang ở vị trí thứ 30 theo maSV. Vì sao cách lấy 10 dòng đầu rồi mới filter sẽ không tìm thấy bạn ấy?"\n',
                italics: true,
                bold: true,
              }),
              new TextRun({
                text: 'Trả lời: Nếu lấy 10 dòng đầu theo mã sinh viên (từ dòng 1 đến dòng 10) nạp vào bộ nhớ rồi mới dùng JavaScript filter theo họ tên, thì sinh viên Lan Anh ở vị trí thứ 30 hoàn toàn không nằm trong 10 dòng được nạp về, dẫn đến kết quả trả về mảng rỗng. Vì vậy, điều kiện lọc (WHERE hoTen LIKE ...) bắt buộc phải được thực thi tại Database trước khi thực hiện COUNT(*) và OFFSET/FETCH.',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '3.4. Triển khai Validation Query String (src/validations/sinhVien.query.ts):', bold: true, color: secondaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Hàm parseSinhVienQuery kiểm tra: page phải là số nguyên dương >= 1; limit phải là số nguyên dương từ 1 đến 50; search cắt khoảng trắng thừa bằng trim() và giới hạn không quá 80 ký tự. Mọi trường hợp sai đều phát sinh AppError(400, message).',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '3.5. Triển khai Service Sequelize (src/services/sinhVien.service.ts):', bold: true, color: secondaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Sử dụng SinhVien.findAndCountAll({ where, limit: query.limit, offset: (query.page - 1) * query.limit, order: [["maSV", "ASC"]] }). Trả về đối tượng gồm mảng data và metadata pagination { page, limit, totalItems, totalPages }.',
              }),
            ],
          }),

          new Paragraph({ spacing: { after: 180 } }),

          // -------------------------------------------------------------
          // MỤC 4: LAB 1 (TÙY CHỌN) - TÍCH HỢP FRONTEND REACT VITE
          // -------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({ text: '4. Lab 1 (Tùy Chọn) — Gắn Phân Trang Vào Vite + React + Axios (Slide 12)', bold: true, size: 26, color: primaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Giao diện React Vite (frontend/src/components/SinhVienTable.tsx) được tích hợp các thành phần tương tác phục vụ phân trang và tìm kiếm:',
              }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Ô tìm kiếm theo họ tên: ', bold: true }),
              new TextRun({ text: 'Gắn trực tiếp với state search. Khi người dùng thay đổi từ khóa, hệ thống tự động thiết lập lại page = 1 để tránh rơi vào trang trống.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Nút điều hướng Trang trước / Trang sau: ', bold: true }),
              new TextRun({ text: 'Nút Trước bị vô hiệu hóa (disabled) khi đang ở trang 1; nút Sau bị vô hiệu hóa khi đang ở trang cuối cùng (page >= totalPages).' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Hộp chọn số lượng hiển thị (Limit Selector): ', bold: true }),
              new TextRun({ text: 'Hỗ trợ các tùy chọn 2, 5, 10, 20 sinh viên/trang. Khi thay đổi limit, trang được đặt lại về 1.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Thông tin tiến trình: ', bold: true }),
              new TextRun({ text: 'Hiển thị nhãn: "Trang X / Y (Tổng số: Z sinh viên)" được đồng bộ trực tiếp từ metadata pagination của backend.' }),
            ],
          }),

          new Paragraph({ spacing: { after: 180 } }),

          // -------------------------------------------------------------
          // MỤC 5: LAB 2 - XỬ LÝ LỖI TOÀN CỤC & BẢO MẬT EXPRESS 5
          // -------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({ text: '5. Lab 2 — Xử Lý Lỗi Toàn Cục & Bảo Mật Express 5 (Slide 15, 16, 17)', bold: true, size: 26, color: primaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Cơ chế xử lý lỗi của Express 5 tự động chuyển tiếp Promise Rejection phát sinh trong async route handler mà không cần bọc asyncHandler hay try/catch thủ công tại từng controller. Error Middleware 4 tham số (err, req, res, next) đảm nhiệm:',
              }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Lớp lỗi AppError: ', bold: true }),
              new TextRun({ text: 'Kế thừa từ class Error gốc, bổ sung statusCode và cờ isOperational = true để phân biệt lỗi nghiệp vụ có chủ đích với lỗi lập trình.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Kiểm tra res.headersSent: ', bold: true }),
              new TextRun({ text: 'Nếu response header đã được gửi tới client từ trước, lập tức ủy quyền cho next(err) để ngăn lỗi crash kết nối.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Chuẩn hóa định dạng phản hồi: ', bold: true }),
              new TextRun({ text: 'Mọi lỗi đều xuất ra JSON thống nhất: { success: false, status: number, message: string, data: null }.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Bảo vệ bí mật máy chủ (Lỗi 500): ', bold: true }),
              new TextRun({ text: 'Ghi nhật ký chi tiết vào server log console.error. Tại môi trường production (NODE_ENV=production), thông báo trả về được che giấu là "Lỗi hệ thống, vui lòng thử lại sau"; không gửi stack trace, câu lệnh SQL nội bộ, connection string hay biến môi trường cho client. Trường stack chỉ được mở khi NODE_ENV=development cục bộ.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Fallback 404 handler: ', bold: true }),
              new TextRun({ text: 'Đặt sau toàn bộ routes và trước errorHandler trong src/server.ts để xử lý các đường dẫn không tồn tại.' }),
            ],
          }),

          new Paragraph({ spacing: { after: 180 } }),

          // -------------------------------------------------------------
          // MỤC 6: PHẦN MỞ RỘNG BUỔI 10 (RAW QUERY, SP, GROUP/COUNT, JOIN)
          // -------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({ text: '6. Triển Khai Phần Mở Rộng Buổi 10 (Thống Kê, Stored Procedure & JOIN) (Slide 20)', bold: true, size: 26, color: primaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Hệ thống đã triển khai 4 kỹ thuật truy vấn nâng cao trên CSDL SQL Server thật:',
              }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'A. Raw Query: ', bold: true }),
              new TextRun({ text: 'Sử dụng sequelize.query("SELECT maLop, COUNT(*) AS totalStudents FROM dbo.SinhVien GROUP BY maLop ORDER BY maLop ASC;", { type: QueryTypes.SELECT }) để báo cáo số lượng sinh viên theo lớp.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'B. Sequelize Method: ', bold: true }),
              new TextRun({ text: 'Thống kê bằng hàm ORM: SinhVien.findAll({ attributes: ["maLop", [fn("COUNT", col("maSV")), "totalStudents"]], group: ["maLop"], order: [["maLop", "ASC"]] }).' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'C. Stored Procedure: ', bold: true }),
              new TextRun({ text: 'Tạo thủ tục chỉ đọc dbo.sp_ThongKeSinhVienTheoLop trong SQL Server và thực thi qua lệnh EXEC dbo.sp_ThongKeSinhVienTheoLop với quyền EXECUTE an toàn cho user sv_app.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'D. JOIN Quan Hệ 1-N: ', bold: true }),
              new TextRun({ text: 'Sử dụng SinhVien.findAll({ include: [{ model: Lop, as: "lop", attributes: ["tenLop"] }], order: [["maSV", "ASC"]] }) lấy sinh viên kèm tên lớp học thực tế.' }),
            ],
          }),

          new Paragraph({ spacing: { after: 180 } }),

          // -------------------------------------------------------------
          // MỤC 7: KỸ NĂNG AI-DRIVEN & PHẢN BIỆN MÃ NGUỒN
          // -------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({ text: '7. Kỹ Năng AI-Driven & Phản Biện Mã Nguồn Bắt Buộc (Slide 21)', bold: true, size: 26, color: primaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Quá trình thực hành áp dụng quy trình CTCO 5 bước (Context - Task - Constraint - Output) kết hợp kiểm tra độc lập trên môi trường SQL Server thật:',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Hai tình huống phản biện mã nguồn AI đề xuất sai:', bold: true, color: secondaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '1. Phản biện phân trang giả bằng JavaScript:\n', bold: true }),
              new TextRun({ text: 'Tình huống: ', bold: true, italics: true }),
              new TextRun({ text: 'AI đề xuất gọi SinhVien.findAll() nạp toàn bộ bảng về bộ nhớ rồi dùng .slice(offset, offset + limit) để cắt trang.\n' }),
              new TextRun({ text: 'Phân tích kỹ thuật: ', bold: true, italics: true }),
              new TextRun({ text: 'Cách làm này gây quá tải bộ nhớ Node.js (Out-of-Memory) khi dữ liệu tăng lớn, làm mất toàn bộ ý nghĩa tối ưu hóa I/O của phân trang. Giải pháp sửa đổi: Bắt buộc dùng findAndCountAll với offset và limit trực tiếp trong câu lệnh SQL gửi đến Database.\n' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '2. Phản biện lộ stack trace trong môi trường Production:\n', bold: true }),
              new TextRun({ text: 'Tình huống: ', bold: true, italics: true }),
              new TextRun({ text: 'AI đề xuất trả err.stack và err.message nguyên bản cho mọi lỗi 500 gửi về client.\n' }),
              new TextRun({ text: 'Phân tích kỹ thuật: ', bold: true, italics: true }),
              new TextRun({ text: 'Lỗi này làm lộ cấu trúc thư mục nội bộ, phiên bản thư viện và logic máy chủ (Information Disclosure). Giải pháp sửa đổi: Cấu hình middleware kiểm tra NODE_ENV; khi ở chế độ production, thông báo trả về bắt buộc là "Lỗi hệ thống, vui lòng thử lại sau" và không chứa trường stack.' }),
            ],
          }),

          new Paragraph({ spacing: { after: 180 } }),

          // -------------------------------------------------------------
          // MỤC 8: DANH MỤC HỒ SƠ BÀN GIAO
          // -------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({ text: '8. Danh Mục Hồ Sơ Bàn Giao (Slide 22)', bold: true, size: 26, color: primaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Toàn bộ hồ sơ thực hành Chương 08 được chuẩn bị và lưu trữ đầy đủ trong dự án theo đúng quy định:',
              }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              makeRow([
                { text: 'Thành phần hồ sơ', width: 35, isHeader: true },
                { text: 'Vị trí lưu trữ trong dự án', width: 40, isHeader: true },
                { text: 'Mô tả nội dung kỹ thuật', width: 25, isHeader: true },
              ]),
              makeRow([
                { text: 'Mã nguồn Backend & Frontend', width: 35, bold: true },
                { text: 'src/ và frontend/src/', width: 40 },
                { text: 'TypeScript ESM, Sequelize 6, React Vite', width: 25 },
              ]),
              makeRow([
                { text: 'Tài liệu OpenAPI 3.0', width: 35, bold: true },
                { text: 'docs/openapi.yaml', width: 40 },
                { text: 'Mô tả query params và phản hồi 200/400', width: 25 },
              ]),
              makeRow([
                { text: 'Postman Collection JSON', width: 35, bold: true },
                { text: 'docs/Chuong08-Pagination-Error.postman_collection.json', width: 40 },
                { text: '27 requests kiểm thử P01-P17 và E01-E10', width: 25 },
              ]),
              makeRow([
                { text: 'Báo cáo Kết quả Kiểm thử', width: 35, bold: true },
                { text: 'docs/test-results.md', width: 40 },
                { text: 'Ma trận đối chiếu chi tiết các kịch bản', width: 25 },
              ]),
              makeRow([
                { text: 'Hình ảnh minh chứng thực nghiệm', width: 35, bold: true },
                { text: 'docs/screenshots/', width: 40 },
                { text: '11 ảnh chụp Postman, React UI, Swagger', width: 25 },
              ]),
              makeRow([
                { text: 'Báo cáo PDF & Word chính thức', width: 35, bold: true },
                { text: 'docs/Bao_Cao_Thuc_Hanh_Chuong_08.pdf (.docx)', width: 40 },
                { text: 'Tài liệu báo cáo kỹ thuật hoàn chỉnh', width: 25 },
              ]),
            ],
          }),

          new Paragraph({ spacing: { after: 180 } }),

          // -------------------------------------------------------------
          // MỤC 9: MINH CHỨNG POSTMAN & GIAO DIỆN THỰC TẾ
          // -------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({ text: '9. Minh Chứng Thực Nghiệm Hình Ảnh', bold: true, size: 26, color: primaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Dưới đây là hình ảnh chụp từ các công cụ kiểm thử Postman, giao diện React Vite và Swagger UI:',
              }),
            ],
          }),

          ...insertImageWithCaption(
            'docs/screenshots/postman-c8-01-pagination-page1-200.png',
            'Ca P02 — Phân trang tại SQL Server Trang 1 (page=1, limit=2: SV001, SV002, totalItems=7)',
            540,
            290
          ),
          ...insertImageWithCaption(
            'docs/screenshots/postman-c8-02-pagination-page2-200.png',
            'Ca P03 — Phân trang tại SQL Server Trang 2 (page=2, limit=2: SV003, SV004, không trùng trang 1)',
            540,
            290
          ),
          ...insertImageWithCaption(
            'docs/screenshots/postman-c8-03-search-anh-200.png',
            'Ca P11 — Tìm kiếm theo họ tên (search=Anh: lọc ra 3 sinh viên có tên chứa Anh)',
            540,
            290
          ),
          ...insertImageWithCaption(
            'docs/screenshots/postman-c8-04-search-pagination-200.png',
            'Ca P12 — Tìm kiếm kết hợp phân trang (search=Anh&page=2&limit=2: totalItems=3, lấy Đỗ Quỳnh Anh)',
            540,
            290
          ),
          ...insertImageWithCaption(
            'docs/screenshots/postman-c8-05-validation-page-400.png',
            'Ca P06 — Chặn 400 Bad Request khi truyền page=-1 không hợp lệ',
            540,
            290
          ),
          ...insertImageWithCaption(
            'docs/screenshots/postman-c8-06-error-404-sv999.png',
            'Ca E03 — Global Error Handling: GET /sinh-vien/SV999 trả 404 nhất quán, data=null',
            540,
            290
          ),
          ...insertImageWithCaption(
            'docs/screenshots/postman-c8-07-error-500-simulated.png',
            'Ca E05 — Global Error Handling: Lỗi 500 mô phỏng an toàn, không lộ secret',
            540,
            290
          ),
          ...insertImageWithCaption(
            'docs/screenshots/ui-c8-01-overview-page1.png',
            'Giao diện React Vite hiển thị Trang 1 (2 sinh viên/trang, nút Trước bị disabled, tổng 7 sinh viên)',
            540,
            300
          ),
          ...insertImageWithCaption(
            'docs/screenshots/ui-c8-02-overview-page2.png',
            'Giao diện React Vite hiển thị Trang 2 (phát sinh request GET page=2, dữ liệu chuyển đổi trên UI)',
            540,
            300
          ),
          ...insertImageWithCaption(
            'docs/screenshots/ui-c8-03-search-anh.png',
            'Giao diện React Vite tìm kiếm "Anh" (bảng lọc 3 sinh viên, badge thông báo từ khóa)',
            540,
            300
          ),
          ...insertImageWithCaption(
            'docs/screenshots/swagger-c8-01-overview.png',
            'Giao diện Swagger UI (/api-docs) mô tả đầy đủ query parameters page, limit, search và response 200/400',
            540,
            300
          ),

          new Paragraph({ spacing: { after: 180 } }),

          // -------------------------------------------------------------
          // MỤC 10: BẢNG KỊCH BẢN KIỂM THỬ THỰC TẾ
          // -------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({ text: '10. Bảng Kịch Bản Kiểm Thử & Hiện Trạng Phản Hồi (Slide 13, 14, 18)', bold: true, size: 26, color: primaryColor }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Bảng 1: Kịch bản kiểm thử Phân trang & Tìm kiếm tại Database (P01 đến P17)', bold: true, color: primaryColor }),
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
                { text: 'P01', width: 10, bold: true },
                { text: 'GET /api/v1/sinh-vien mặc định', width: 35 },
                { text: '200', width: 15, align: AlignmentType.CENTER },
                { text: '200', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'data là mảng, metadata page=1, limit=10', width: 25 },
              ]),
              makeRow([
                { text: 'P02', width: 10, bold: true },
                { text: 'GET ?page=1&limit=2 (Trang 1)', width: 35 },
                { text: '200', width: 15, align: AlignmentType.CENTER },
                { text: '200', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: '2 bản ghi đầu theo maSV ASC (SV001, SV002)', width: 25 },
              ]),
              makeRow([
                { text: 'P03', width: 10, bold: true },
                { text: 'GET ?page=2&limit=2 (Trang 2)', width: 35 },
                { text: '200', width: 15, align: AlignmentType.CENTER },
                { text: '200', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: '2 bản ghi tiếp theo (SV003, SV004)', width: 25 },
              ]),
              makeRow([
                { text: 'P04', width: 10, bold: true },
                { text: 'GET ?page=3&limit=2 (Trang 3)', width: 35 },
                { text: '200', width: 15, align: AlignmentType.CENTER },
                { text: '200', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'Lấy các bản ghi tiếp (SV005, SV006)', width: 25 },
              ]),
              makeRow([
                { text: 'P05', width: 10, bold: true },
                { text: 'GET ?page=999&limit=2 (Vượt tổng trang)', width: 35 },
                { text: '200', width: 15, align: AlignmentType.CENTER },
                { text: '200', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'data=[], totalItems=7 chính xác', width: 25 },
              ]),
              makeRow([
                { text: 'P06', width: 10, bold: true },
                { text: 'Validation: GET ?page=-1 (Số âm)', width: 35 },
                { text: '400', width: 15, align: AlignmentType.CENTER },
                { text: '400', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'Chặn 400: page phải là số nguyên dương', width: 25 },
              ]),
              makeRow([
                { text: 'P07', width: 10, bold: true },
                { text: 'Validation: GET ?page=0 (Bằng 0)', width: 35 },
                { text: '400', width: 15, align: AlignmentType.CENTER },
                { text: '400', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'Chặn 400: Trang bắt đầu từ 1', width: 25 },
              ]),
              makeRow([
                { text: 'P08', width: 10, bold: true },
                { text: 'Validation: GET ?page=1.5 (Thập phân)', width: 35 },
                { text: '400', width: 15, align: AlignmentType.CENTER },
                { text: '400', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'Chặn 400: Không chấp nhận thập phân', width: 25 },
              ]),
              makeRow([
                { text: 'P09', width: 10, bold: true },
                { text: 'Validation: GET ?limit=abc (Chữ cái)', width: 35 },
                { text: '400', width: 15, align: AlignmentType.CENTER },
                { text: '400', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'Chặn 400: limit phải là số nguyên', width: 25 },
              ]),
              makeRow([
                { text: 'P10', width: 10, bold: true },
                { text: 'Validation: GET ?limit=51 (Vượt 50)', width: 35 },
                { text: '400', width: 15, align: AlignmentType.CENTER },
                { text: '400', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'Chặn 400: Vượt giới hạn cho phép 1-50', width: 25 },
              ]),
              makeRow([
                { text: 'P11', width: 10, bold: true },
                { text: 'GET ?search=Anh (Tìm theo họ tên)', width: 35 },
                { text: '200', width: 15, align: AlignmentType.CENTER },
                { text: '200', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'Lọc đúng 3 sinh viên có tên chứa Anh', width: 25 },
              ]),
              makeRow([
                { text: 'P12', width: 10, bold: true },
                { text: 'GET ?search=Anh&page=2&limit=2', width: 35 },
                { text: '200', width: 15, align: AlignmentType.CENTER },
                { text: '200', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'totalItems=3 (lọc), trang 2 lấy Đỗ Quỳnh Anh', width: 25 },
              ]),
              makeRow([
                { text: 'P13', width: 10, bold: true },
                { text: 'GET ?search=khongco (Không kết quả)', width: 35 },
                { text: '200', width: 15, align: AlignmentType.CENTER },
                { text: '200', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'data=[], totalItems=0, totalPages=0', width: 25 },
              ]),
              makeRow([
                { text: 'P14', width: 10, bold: true },
                { text: 'GET ?search=  Anh  (Có khoảng trắng)', width: 35 },
                { text: '200', width: 15, align: AlignmentType.CENTER },
                { text: '200', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'Tự động trim thành Anh, trả kết quả đúng', width: 25 },
              ]),
              makeRow([
                { text: 'P15', width: 10, bold: true },
                { text: 'Validation: GET ?search=[81 ký tự]', width: 35 },
                { text: '400', width: 15, align: AlignmentType.CENTER },
                { text: '400', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'Chặn 400: Từ khóa vượt quá 80 ký tự', width: 25 },
              ]),
              makeRow([
                { text: 'P16', width: 10, bold: true },
                { text: 'Kiểm chứng SQL OFFSET/FETCH qua log', width: 35 },
                { text: '200', width: 15, align: AlignmentType.CENTER },
                { text: '200', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'SQL Server áp dụng OFFSET 2 FETCH NEXT 2', width: 25 },
              ]),
              makeRow([
                { text: 'P17', width: 10, bold: true },
                { text: 'Hồi quy CRUD: GET /sinh-vien/SV001', width: 35 },
                { text: '200', width: 15, align: AlignmentType.CENTER },
                { text: '200', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'Tìm thấy SV001 - Minh Nhật không đổi', width: 25 },
              ]),
            ],
          }),

          new Paragraph({ spacing: { after: 180 } }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Bảng 2: Kịch bản kiểm thử Xử lý lỗi toàn cục & Hồi quy bảo mật (E01 đến E10)', bold: true, color: primaryColor }),
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
                { text: 'E01', width: 10, bold: true },
                { text: 'GET ?page=-5 (Lỗi tham số âm)', width: 35 },
                { text: '400', width: 15, align: AlignmentType.CENTER },
                { text: '400', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'JSON chuẩn: success=false, status=400, data=null', width: 25 },
              ]),
              makeRow([
                { text: 'E02', width: 10, bold: true },
                { text: 'GET ?limit=abc (Lỗi kiểu số)', width: 35 },
                { text: '400', width: 15, align: AlignmentType.CENTER },
                { text: '400', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'Chặn trước tầng DB, không phát sinh lỗi SQL', width: 25 },
              ]),
              makeRow([
                { text: 'E03', width: 10, bold: true },
                { text: 'GET /sinh-vien/SV999 (Không tìm thấy)', width: 35 },
                { text: '404', width: 15, align: AlignmentType.CENTER },
                { text: '404', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: '404 Not Found nhất quán: status=404, data=null', width: 25 },
              ]),
              makeRow([
                { text: 'E04', width: 10, bold: true },
                { text: 'GET /duong-dan-khong-co (Fallback)', width: 35 },
                { text: '404', width: 15, align: AlignmentType.CENTER },
                { text: '404', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'Fallback 404 router hoạt động đúng chuẩn', width: 25 },
              ]),
              makeRow([
                { text: 'E05', width: 10, bold: true },
                { text: 'Lỗi 500 mô phỏng qua route test-500', width: 35 },
                { text: '500', width: 15, align: AlignmentType.CENTER },
                { text: '500', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'Không lộ SQL/secret, status=500, data=null', width: 25 },
              ]),
              makeRow([
                { text: 'E06', width: 10, bold: true },
                { text: 'NODE_ENV=production, kiểm tra 500', width: 35 },
                { text: '500', width: 15, align: AlignmentType.CENTER },
                { text: '500', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'Không có trường stack, message bảo mật', width: 25 },
              ]),
              makeRow([
                { text: 'E07', width: 10, bold: true },
                { text: 'NODE_ENV=development, kiểm tra 500', width: 35 },
                { text: '500', width: 15, align: AlignmentType.CENTER },
                { text: '500', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'Trường stack chỉ hiển thị tại dev máy cục bộ', width: 25 },
              ]),
              makeRow([
                { text: 'E08', width: 10, bold: true },
                { text: 'Hồi quy Auth: GET /profile thiếu token', width: 35 },
                { text: '401', width: 15, align: AlignmentType.CENTER },
                { text: '401', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'Chặn 401 Unauthorized do thiếu Bearer Token', width: 25 },
              ]),
              makeRow([
                { text: 'E09', width: 10, bold: true },
                { text: 'Hồi quy RBAC: Student ép DELETE', width: 35 },
                { text: '403', width: 15, align: AlignmentType.CENTER },
                { text: '403', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'Chặn 403 Forbidden tài khoản student, DB an toàn', width: 25 },
              ]),
              makeRow([
                { text: 'E10', width: 10, bold: true },
                { text: 'Hồi quy Multer: Upload sai field photo', width: 35 },
                { text: '400', width: 15, align: AlignmentType.CENTER },
                { text: '400', width: 15, align: AlignmentType.CENTER, bold: true },
                { text: 'Báo lỗi 400 yêu cầu đúng tên field "avatar"', width: 25 },
              ]),
            ],
          }),

          new Paragraph({ spacing: { after: 180 } }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Bảng 3: Kịch bản kiểm thử Truy vấn Mở rộng Buổi 10 (X01 đến X04)', bold: true, color: primaryColor }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              makeRow([
                { text: 'Mã Ca', width: 10, isHeader: true },
                { text: 'Phương pháp kiểm thử', width: 30, isHeader: true },
                { text: 'Tuyến đường API / Lệnh thực thi', width: 35, isHeader: true },
                { text: 'Hiện trạng phản hồi', width: 25, isHeader: true },
              ]),
              makeRow([
                { text: 'X01', width: 10, bold: true },
                { text: 'Raw SQL Query', width: 30 },
                { text: 'GET /api/v1/sinh-vien/thong-ke?method=raw', width: 35 },
                { text: 'Trả về mảng thống kê số lượng theo lớp', width: 25 },
              ]),
              makeRow([
                { text: 'X02', width: 10, bold: true },
                { text: 'Sequelize Group & Count', width: 30 },
                { text: 'GET /api/v1/sinh-vien/thong-ke?method=sequelize', width: 35 },
                { text: 'Gom nhóm maLop và đếm totalStudents', width: 25 },
              ]),
              makeRow([
                { text: 'X03', width: 10, bold: true },
                { text: 'Stored Procedure', width: 30 },
                { text: 'GET /api/v1/sinh-vien/thong-ke?method=sp', width: 35 },
                { text: 'Thực thi dbo.sp_ThongKeSinhVienTheoLop', width: 25 },
              ]),
              makeRow([
                { text: 'X04', width: 10, bold: true },
                { text: 'Eager Loading JOIN Model', width: 30 },
                { text: 'GET /api/v1/sinh-vien/kem-lop', width: 35 },
                { text: 'Trả về sinh viên kèm đối tượng Lop ({ tenLop })', width: 25 },
              ]),
            ],
          }),

          new Paragraph({ spacing: { after: 180 } }),

          // -------------------------------------------------------------
          // MỤC 11: TRẢ LỜI CHI TIẾT 12 CÂU HỎI BẢO VỆ BÀI THỰC HÀNH & BÀI TẬP MỞ RỘNG
          // -------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({ text: '11. Trả Lời Chi Tiết 12 Câu Hỏi Bảo Vệ & Bài Tập Mở Rộng (Slide 23)', bold: true, size: 26, color: primaryColor }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Câu 01. page, limit và offset khác nhau thế nào? page=5 và limit=20 thì offset là bao nhiêu?\n', bold: true }),
              new TextRun({ text: 'Trả lời: ', bold: true, color: secondaryColor }),
              new TextRun({ text: '- page: Chỉ số trang hiện tại mà client muốn lấy (bắt đầu từ 1).\n- limit: Số lượng bản ghi tối đa được phép hiển thị trên mỗi trang.\n- offset: Số lượng bản ghi mà hệ quản trị CSDL cần bỏ qua từ đầu tập kết quả trước khi bắt đầu lấy dữ liệu cho trang hiện tại.\nCông thức tính: offset = (page - 1) * limit. Với page = 5 và limit = 20: offset = (5 - 1) * 20 = 80.' }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Câu 02. Vì sao phải ORDER BY maSV trước khi dùng OFFSET/FETCH trong SQL Server?\n', bold: true }),
              new TextRun({ text: 'Trả lời: ', bold: true, color: secondaryColor }),
              new TextRun({ text: 'Trong SQL Server và chuẩn ANSI SQL, mệnh đề OFFSET/FETCH bắt buộc phải đi kèm mệnh đề ORDER BY. Nếu không có ORDER BY, thứ tự bản ghi trả về từ CSDL là không tất định (non-deterministic). Khi đó, các lần gọi trang 1 và trang 2 có thể trả về các bản ghi trùng lặp hoặc bỏ sót dữ liệu. Khóa maSV là khóa chính duy nhất, đảm bảo thứ tự dữ liệu cố định và nhất quán giữa các trang.' }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Câu 03. findAll() khác findAndCountAll() ra sao? rows và count dùng để làm gì?\n', bold: true }),
              new TextRun({ text: 'Trả lời: ', bold: true, color: secondaryColor }),
              new TextRun({ text: '- findAll(): Chỉ thực thi một truy vấn SELECT đơn thuần để lấy danh sách bản ghi thỏa điều kiện where kèm limit/offset.\n- findAndCountAll(): Thực thi đồng thời việc đếm tổng số bản ghi thỏa điều kiện where (trước khi phân trang) và lấy mảng bản ghi của trang hiện tại.\n- count: Là tổng số dòng dữ liệu thỏa điều kiện lọc trên toàn bộ bảng, dùng để tính tổng số trang (totalPages).\n- rows: Là mảng các bản ghi cụ thể thuộc trang được yêu cầu, gửi về cho client hiển thị.' }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Câu 04. Vì sao totalPages = Math.ceil(totalItems / limit)? Khi không có dữ liệu thì trả gì?\n', bold: true }),
              new TextRun({ text: 'Trả lời: ', bold: true, color: secondaryColor }),
              new TextRun({ text: 'Hàm Math.ceil() làm tròn lên số nguyên gần nhất. Ví dụ với 5 sinh viên và limit = 2: 5 / 2 = 2.5, làm tròn lên là 3 trang (trang 1 có 2, trang 2 có 2, trang 3 có 1). Nếu làm tròn xuống (Math.floor), trang cuối cùng sẽ bị mất. Khi không có dữ liệu (totalItems = 0), hệ thống trả về data: [], totalPages: 0; thuộc tính page vẫn phản ánh giá trị client yêu cầu.' }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Câu 05. Vì sao lọc search theo hoTen phải xảy ra trước khi tính count và lấy trang?\n', bold: true }),
              new TextRun({ text: 'Trả lời: ', bold: true, color: secondaryColor }),
              new TextRun({ text: 'Mệnh đề WHERE lọc theo hoTen phải được áp dụng trên toàn bộ bảng để xác định chính xác tập bản ghi phù hợp. Nếu phân trang trước rồi mới lọc trên kết quả trang đó, tổng số bản ghi (count) và tổng số trang sẽ sai lệch, đồng thời bỏ sót các bản ghi nằm ở các trang khác (ví dụ sinh viên Lan Anh ở vị trí thứ 30 sẽ bị mất nếu chỉ lấy trang 1 gồm 10 bản ghi đầu rồi mới lọc).' }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Câu 06. Nếu client gửi page="abc" hoặc limit=-2, lỗi phù hợp là 400 hay 500? Vì sao?\n', bold: true }),
              new TextRun({ text: 'Trả lời: ', bold: true, color: secondaryColor }),
              new TextRun({ text: 'Mã lỗi phù hợp là 400 Bad Request. Đây là lỗi do dữ liệu đầu vào từ phía người dùng gửi lên không hợp lệ, không tuân thủ quy ước giao tiếp API. Trả về mã 500 (Internal Server Error) là sai ngữ nghĩa HTTP vì server không bị lỗi nội bộ hoặc crash, và lỗi cần được chặn lại ngay tại tầng validation trước khi truyền xuống CSDL.' }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Câu 07. Vì sao không nên trả data={rows,pagination} thay cho data[] của chương trước?\n', bold: true }),
              new TextRun({ text: 'Trả lời: ', bold: true, color: secondaryColor }),
              new TextRun({ text: 'Việc thay đổi kiểu dữ liệu của trường data từ mảng [] thành đối tượng {} sẽ làm vỡ giao diện Frontend của Chương 07 và các client cũ đang đọc res.data.data.map(...). Giữ nguyên data là mảng và đặt pagination là thuộc tính độc lập ở cấp cao nhất bảo đảm tính tương thích ngược (Backward Compatibility).' }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Câu 08. Axios gửi SQL tới Database hay gửi HTTP tới Backend? Chứng minh bằng Network.\n', bold: true }),
              new TextRun({ text: 'Trả lời: ', bold: true, color: secondaryColor }),
              new TextRun({ text: 'Axios chạy trên trình duyệt người dùng chỉ gửi HTTP GET Request mang query parameters (ví dụ /api/v1/sinh-vien?page=2&limit=2) tới máy chủ Express Backend. Trình duyệt hoàn toàn không có kết nối TCP tới SQL Server (cổng 1433/14333) và không gửi câu lệnh SQL. Tab Network của DevTools chứng minh rõ ràng đây là HTTP Request với URL, Query String và JSON Response.' }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Câu 09. AppError và Global Error Middleware khác nhau về trách nhiệm?\n', bold: true }),
              new TextRun({ text: 'Trả lời: ', bold: true, color: secondaryColor }),
              new TextRun({ text: '- AppError: Là lớp biểu diễn lỗi nghiệp vụ dự kiến (Operational Error), mang theo mã trạng thái HTTP (statusCode) và thông điệp lỗi (message), được throw từ Controller, Service hoặc Validator.\n- Global Error Middleware: Là hàm đón đầu ở cuối pipeline Express (4 tham số), có trách nhiệm phân loại lỗi, ghi log hệ thống, che giấu chi tiết nhạy cảm và đóng gói cấu trúc JSON phản hồi duy nhất về cho Client.' }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Câu 10. Express 5 chuyển lỗi từ async handler tới middleware như thế nào?\n', bold: true }),
              new TextRun({ text: 'Trả lời: ', bold: true, color: secondaryColor }),
              new TextRun({ text: 'Trong Express 5, khi một async route handler trả về một Promise bị Reject (hoặc throw lỗi bên trong hàm async), Express 5 sẽ tự động bắt lấy ngoại lệ đó và chuyển tiếp tới Error Middleware tiếp theo, tương đương với việc gọi next(err). Lập trình viên không cần phải bọc try-catch lặp đi lặp lại hay sử dụng thư viện ngoài như express-async-errors.' }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Câu 11. Vì sao không được hiển thị stack trace và connection string ở production?\n', bold: true }),
              new TextRun({ text: 'Trả lời: ', bold: true, color: secondaryColor }),
              new TextRun({ text: 'Hiển thị stack trace và connection string làm lộ cấu trúc thư mục máy chủ, tên tài khoản, mật khẩu CSDL, phiên bản thư viện và logic thuật toán nội bộ. Kẻ tấn công có thể khai thác các thông tin này để thực hiện tấn công leo thang đặc quyền hoặc chiếm quyền kiểm soát máy chủ. Do đó, production bắt buộc phải che giấu bằng thông điệp chung "Lỗi hệ thống, vui lòng thử lại sau".' }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Câu 12. Nêu ba bằng chứng để chứng minh nâng cấp Chương 08 không làm hỏng Chương 07.\n', bold: true }),
              new TextRun({ text: 'Trả lời: ', bold: true, color: secondaryColor }),
              new TextRun({ text: '1. Kịch bản kiểm thử Auth & RBAC (Chương 06): Script test:24 xác nhận các route bảo vệ hoạt động đúng như thiết kế.\n2. Kịch bản kiểm thử Upload Avatar (Chương 07): Script test:upload xác nhận luồng upload và phục vụ file tĩnh /uploads/<uuid>.<ext> qua HTTP 200 OK.\n3. Tính tương thích giao diện React Vite: Giao diện vừa hỗ trợ tìm kiếm và phân trang mới, vừa giữ nguyên Profile Card hiển thị ảnh đại diện và chức năng Xóa của quyền Admin.' }),
            ],
          }),

          new Paragraph({ spacing: { after: 120 } }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Giải bài tập mở rộng (Slide 23):', bold: true, color: secondaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• So sánh COUNT theo maLop bằng Raw Query và Sequelize group:\n', bold: true }),
              new TextRun({ text: 'Cả hai phương pháp đều sinh ra câu lệnh SQL có mệnh đề GROUP BY maLop và hàm tổng hợp COUNT(maSV). Raw Query cho phép lập trình viên kiểm soát trực tiếp câu lệnh T-SQL tối ưu, trong khi Sequelize group cung cấp tính trừu tượng hóa cao, an toàn kiểu dữ liệu và tránh được các lỗi cú pháp thủ công.\n' }),
              new TextRun({ text: '• JOIN để lấy tenLop từ bảng Lop:\n', bold: true }),
              new TextRun({ text: 'Sử dụng SinhVien.findAll({ include: [{ model: Lop, as: "lop", attributes: ["tenLop"] }] }). Quan hệ được thiết lập dựa trên điều kiện khóa ngoại SinhVien.maLop = Lop.maLop, cho phép lấy thông tin sinh viên kèm tên lớp tương ứng trong một truy vấn duy nhất.\n' }),
              new TextRun({ text: '• Về việc lấy 5 sinh viên mới nhất theo cột ngày tạo:\n', bold: true }),
              new TextRun({ text: 'Bảng dbo.SinhVien hiện tại không có cột createdAt hoặc ngày tạo bản ghi. Trong kiến trúc CSDL quan hệ chuẩn, không được tự suy đoán hoặc giả định sự tồn tại của cột thời gian. Do đó, nếu cần lấy 5 bản ghi mới nhất, bắt buộc phải có script bổ sung cột thời gian thực tế vào bảng trước khi thực hiện ORDER BY createdAt DESC.\n' }),
              new TextRun({ text: '• Đánh giá Stored Procedure so với Sequelize:\n', bold: true }),
              new TextRun({ text: 'Stored Procedure được biên dịch và lưu kế hoạch thực thi (Execution Plan) sẵn tại SQL Server, giúp tối ưu hiệu năng cho các tác vụ tổng hợp dữ liệu quy mô lớn và cho phép phân quyền chặt chẽ (chỉ cấp EXECUTE mà không cấp quyền đọc bảng). Tuy nhiên, nhược điểm là khó quản lý phiên bản trong Git và phụ thuộc vào hệ quản trị CSDL cụ thể.' }),
            ],
          }),

          new Paragraph({ spacing: { after: 180 } }),

          // -------------------------------------------------------------
          // MỤC 12: HƯỚNG DẪN VẬN HÀNH HỆ THỐNG
          // -------------------------------------------------------------
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({ text: '12. Hướng Dẫn Vận Hành Hệ Thống', bold: true, size: 26, color: primaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Bảng tổng hợp các lệnh kiểm thử và vận hành hệ thống trong suốt quá trình triển khai:',
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
                { text: 'Mở tại http://localhost:5173', width: 25 },
              ]),
              makeRow([
                { text: '3. Kiểm thử Chương 08', width: 30, bold: true },
                { text: 'pnpm run test:c8', width: 45 },
                { text: 'Kiểm thử 25 ca P01-P17 và E01-E10', width: 25 },
              ]),
              makeRow([
                { text: '4. Kiểm thử mở rộng Buổi 10', width: 30, bold: true },
                { text: 'npx tsx src/scripts/test-extensions.ts', width: 45 },
                { text: 'Raw Query, SP, Sequelize, JOIN', width: 25 },
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
              new TextRun({ text: 'Báo cáo được hoàn thiện và xác nhận lưu trữ tại repository.', italics: true, size: 20, color: '64748B' }),
            ],
          }),
        ],
      },
    ],
  });

  const docxPath = path.resolve(process.cwd(), 'docs/Bao_Cao_Thuc_Hanh_Chuong_08.docx');
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(docxPath, buffer);
  console.log(`✅ Đã tạo thành công file Word: ${docxPath}`);

  // Xuất file PDF bằng Word COM Object qua PowerShell
  console.log('🔄 Đang xuất file PDF qua Microsoft Word Engine...');
  const pdfDocsPath = path.resolve(process.cwd(), 'docs/Bao_Cao_Thuc_Hanh_Chuong_08.pdf');
  const pdfRootPath = path.resolve(process.cwd(), 'Bao_Cao_Thuc_Hanh_Chuong_08.pdf');

  const psScriptPath = path.resolve(process.cwd(), 'src/scripts/export-pdf-temp.ps1');
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

generateChapter08Report().catch((err) => {
  console.error('Lỗi sinh báo cáo:', err);
  process.exit(1);
});
