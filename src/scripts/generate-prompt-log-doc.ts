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
} from 'docx';
import * as fs from 'node:fs';
import * as path from 'node:path';

async function generatePromptLogWordDoc() {
  const primaryColor = '1E40AF'; // Xanh Navy
  const secondaryColor = '0F766E'; // Xanh Teal
  const darkTextColor = '1F2937';
  const lightBgColor = 'F1F5F9';
  const borderColor = 'CBD5E1';

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Arial',
            color: darkTextColor,
            size: 22, // 11pt
          },
          paragraph: {
            spacing: {
              line: 276, // 1.15 line spacing
              after: 120, // 6pt space after
            },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        children: [
          // TIÊU ĐỀ CHÍNH
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: 'NHẬT KÝ PROMPT & KỸ NĂNG PROMPT ENGINEERING',
                bold: true,
                size: 32, // 16pt
                color: primaryColor,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 280 },
            children: [
              new TextRun({
                text: 'BÀI THỰC HÀNH BUỔI 5 / CHƯƠNG 4: RESTful CRUD & SWAGGER UI',
                bold: true,
                size: 24, // 12pt
                color: secondaryColor,
              }),
            ],
          }),

          // BẢNG THÔNG TIN DỰ ÁN
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: lightBgColor },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: '• Học phần: ', bold: true }),
                          new TextRun('Lập trình Backend NodeJS & TypeScript\n'),
                          new TextRun({ text: '• Dự án: ', bold: true }),
                          new TextRun('Quản lý sinh viên (RESTful CRUD)\n'),
                          new TextRun({ text: '• Phương pháp: ', bold: true }),
                          new TextRun('Vibe Coding theo khung CTCO (Context - Task - Constraint - Output)\n'),
                          new TextRun({ text: '• Môi trường: ', bold: true }),
                          new TextRun('Node.js v24, Express 5, TypeScript ESM, Sequelize 6, SQL Server'),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { after: 200 } }),

          // MỤC 1: KHUNG CTCO LÀ GÌ?
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({
                text: '1. Khung Prompt Engineering CTCO là gì?',
                bold: true,
                size: 26,
                color: primaryColor,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun(
                'Khung CTCO là phương pháp chuẩn hóa cấu trúc prompt giúp lập trình viên giao tiếp chính xác, rõ ràng và hiệu quả với AI Assistant trong quá trình phát triển phần mềm:'
              ),
            ],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: 'E0E7FF' },
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: 'Thành phần CTCO', bold: true, color: primaryColor })],
                      }),
                    ],
                  }),
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: 'E0E7FF' },
                    width: { size: 75, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: 'Ý nghĩa & Câu hỏi tự đặt ra trước khi gửi AI', bold: true, color: primaryColor })],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'C - Context\n(Bối cảnh)', bold: true })] })],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun(
                            'Tôi đang làm dự án gì? Công nghệ và file hiện có là gì? (Ví dụ: Express 5, TypeScript ESM NodeNext, Sequelize 6, SQL Server, các file routes, controller, service hiện tại).'
                          ),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'T - Task\n(Nhiệm vụ)', bold: true })] })],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun(
                            'Tôi muốn AI làm một việc cụ thể nào? (Chỉ giải quyết một tác vụ đơn mục tiêu trong mỗi prompt, ví dụ: viết riêng hàm PUT hoặc tạo file openapi.yaml).'
                          ),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'C - Constraint\n(Ràng buộc)', bold: true })] })],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun(
                            'Điều gì bắt buộc? Điều gì AI không được tự ý thay đổi? (Giữ nguyên phân tầng Route - Controller - Service, giữ mã lỗi HTTP 400/404/409, không tự ý chuyển CommonJS hay đổi kiểu dữ liệu).'
                          ),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'O - Output\n(Đầu ra)', bold: true })] })],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun(
                            'Tôi muốn nhận kết quả như thế nào? (Chỉ ra đường dẫn file cần sửa, code chi tiết có comment tiếng Việt và hướng dẫn các bước kiểm thử cụ thể).'
                          ),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { after: 200 } }),

          // MỤC 2: NHẬT KÝ PROMPT THỰC TẾ
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({
                text: '2. Nhật ký Prompt thực tế các bước phát triển',
                bold: true,
                size: 26,
                color: primaryColor,
              }),
            ],
          }),

          // Prompt 1
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 180, after: 80 },
            children: [
              new TextRun({
                text: '📝 Prompt 1: Bổ sung chức năng cập nhật (PUT /api/v1/sinh-vien/:maSV)',
                bold: true,
                size: 24,
                color: secondaryColor,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• Context: ', bold: true }),
              new TextRun('Dự án Quản lý sinh viên Express 5 + TypeScript ESM NodeNext, kết nối SQL Server qua Sequelize 6. Đã có 3 API: GET danh sách, GET chi tiết, POST thêm mới.\n'),
              new TextRun({ text: '• Task: ', bold: true }),
              new TextRun('Bổ sung chức năng PUT /api/v1/sinh-vien/:maSV để cập nhật thông tin sinh viên hiện có.\n'),
              new TextRun({ text: '• Constraint: ', bold: true }),
              new TextRun('Lấy maSV từ URL params. Body chỉ nhận 3 trường hoTen, email, maLop (không cho đổi maSV qua body). Validation chuỗi không rỗng, regex email, độ dài SQL (hoTen <= 150, email <= 254, maLop <= 50) sai trả 400; không tìm thấy trả 404; thành công trả 200. Giữ nguyên kiến trúc 3 tầng.\n'),
              new TextRun({ text: '• Output: ', bold: true }),
              new TextRun('Code hoàn chỉnh cho sinhVien.service.ts, sinhVien.controller.ts, sinhVien.routes.ts và hướng dẫn test bằng Postman.\n'),
              new TextRun({ text: '• Đánh giá & Kết quả: ', bold: true }),
              new TextRun('AI sinh đúng luồng async/await, Controller có await, kiểm thử T06 (200) và T07 (400 khi thiếu email) hoạt động chính xác.'),
            ],
          }),

          // Prompt 2
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 180, after: 80 },
            children: [
              new TextRun({
                text: '📝 Prompt 2: Bổ sung chức năng xóa (DELETE /api/v1/sinh-vien/:maSV)',
                bold: true,
                size: 24,
                color: secondaryColor,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• Context: ', bold: true }),
              new TextRun('Tiếp tục dự án trên với 4 API đã chạy ổn định.\n'),
              new TextRun({ text: '• Task: ', bold: true }),
              new TextRun('Bổ sung chức năng DELETE /api/v1/sinh-vien/:maSV để xóa sinh viên khỏi CSDL.\n'),
              new TextRun({ text: '• Constraint: ', bold: true }),
              new TextRun('Lấy maSV từ URL, không nhận body. Tìm qua SinhVien.findByPk(maSV), nếu không thấy trả 404; xóa thành công trả 200 với { "success": true, "message": "Xóa sinh viên thành công" } (không có trường data). Không ảnh hưởng các API khác.\n'),
              new TextRun({ text: '• Output: ', bold: true }),
              new TextRun('Code cho 3 tầng và các bước gọi GET lại để kiểm chứng dữ liệu đã biến mất thật sự.\n'),
              new TextRun({ text: '• Đánh giá & Kết quả: ', bold: true }),
              new TextRun('Xóa thành công SV003, gọi lại GET trả về đúng 404 Not Found chứng minh bản ghi đã xóa khỏi SQL Server.'),
            ],
          }),

          // Prompt 3
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 180, after: 80 },
            children: [
              new TextRun({
                text: '📝 Prompt 3: Tạo file đặc tả OpenAPI YAML riêng biệt (docs/openapi.yaml)',
                bold: true,
                size: 24,
                color: secondaryColor,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• Context: ', bold: true }),
              new TextRun('Hệ thống đã hoàn thiện đủ 5 API CRUD sinh viên.\n'),
              new TextRun({ text: '• Task: ', bold: true }),
              new TextRun('Tạo file docs/openapi.yaml chuẩn OpenAPI 3.0.3 mô tả toàn bộ 5 API.\n'),
              new TextRun({ text: '• Constraint: ', bold: true }),
              new TextRun('Tách riêng file YAML, không dùng JSDoc hay swagger-jsdoc quét comment trong code. Tái sử dụng components/$ref cho schemas và responses. Mô tả chính xác các status code 200, 201, 400, 404, 409, 500.\n'),
              new TextRun({ text: '• Output: ', bold: true }),
              new TextRun('Nội dung file docs/openapi.yaml hoàn chỉnh, thụt lề chuẩn cú pháp YAML (dùng space, không tab).'),
            ],
          }),

          // Prompt 4
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 180, after: 80 },
            children: [
              new TextRun({
                text: '📝 Prompt 4: Tích hợp Swagger UI vào Express Server',
                bold: true,
                size: 24,
                color: secondaryColor,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• Context: ', bold: true }),
              new TextRun('Đã có file docs/openapi.yaml trong dự án Express + TypeScript.\n'),
              new TextRun({ text: '• Task: ', bold: true }),
              new TextRun('Tích hợp Swagger UI tại endpoint /api-docs.\n'),
              new TextRun({ text: '• Constraint: ', bold: true }),
              new TextRun('Tạo src/config/swagger.config.ts đọc file YAML bằng js-yaml an toàn. Mount Swagger UI trong server.ts trước middleware 404. Giữ nguyên cấu trúc dự án.\n'),
              new TextRun({ text: '• Output: ', bold: true }),
              new TextRun('Code hoàn chỉnh cho swagger.config.ts và đoạn cấu hình trong server.ts.'),
            ],
          }),

          new Paragraph({ spacing: { after: 200 } }),

          // MỤC 3: BÀI TỰ VIẾT PROMPT MỞ RỘNG
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({
                text: '3. Bài tự viết Prompt mở rộng (Không sao chép)',
                bold: true,
                size: 26,
                color: primaryColor,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Yêu cầu: ',
                bold: true,
              }),
              new TextRun('Vận dụng khung CTCO để yêu cầu AI bổ sung tính năng tìm kiếm danh sách sinh viên theo mã lớp (GET /api/v1/sinh-vien/lop/:maLop).'),
            ],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: lightBgColor },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'NỘI DUNG PROMPT CTCO:\n', bold: true, color: primaryColor }),
                          new TextRun({ text: 'CONTEXT: ', bold: true }),
                          new TextRun('Dự án Quản lý sinh viên Express 5 + TypeScript ESM, kết nối SQL Server bảng dbo.SinhVien qua Sequelize Model SinhVien. Hệ thống đã có đủ 5 API CRUD cơ bản.\n\n'),
                          new TextRun({ text: 'TASK: ', bold: true }),
                          new TextRun('Bổ sung thêm một API tìm kiếm danh sách sinh viên theo mã lớp: GET /api/v1/sinh-vien/lop/:maLop.\n\n'),
                          new TextRun({ text: 'CONSTRAINT:\n', bold: true }),
                          new TextRun('1. Endpoint: GET /api/v1/sinh-vien/lop/:maLop, maLop lấy từ req.params.\n'),
                          new TextRun('2. Service: Sử dụng SinhVien.findAll({ where: { maLop }, order: [[\'maSV\', \'ASC\']] }).\n'),
                          new TextRun('3. Phản hồi: Luôn trả HTTP 200 với data là mảng các sinh viên thuộc lớp đó (nếu lớp chưa có sinh viên nào thì trả mảng rỗng []).\n'),
                          new TextRun('4. Không làm xung đột với route GET /:maSV hiện tại (phải khai báo route /lop/:maLop trước /:maSV trong sinhVien.routes.ts để tránh Express hiểu nhầm chuỗi \'lop\' là một maSV).\n'),
                          new TextRun('5. Giữ nguyên toàn bộ 5 API CRUD cũ và cấu trúc DTO hiện có.\n\n'),
                          new TextRun({ text: 'OUTPUT: ', bold: true }),
                          new TextRun('Cung cấp code cần sửa trong sinhVien.service.ts, sinhVien.controller.ts, sinhVien.routes.ts và một test case Postman mẫu để kiểm thử.'),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 120 } }),
          new Paragraph({
            children: [
              new TextRun({ text: '• Giải thích vì sao chọn endpoint /api/v1/sinh-vien/lop/:maLop: ', bold: true }),
              new TextRun(
                'Việc bổ sung tiền tố "lop/" giúp phân định rõ ràng giữa thao tác tra cứu một tài nguyên cá nhân cụ thể theo khóa chính (/:maSV) và thao tác lọc danh sách theo thuộc tính nhóm (/lop/:maLop). Đồng thời, khai báo route này đứng trước /:maSV trong file Routes giúp Express Router không bị nhận diện nhầm chuỗi "lop" là một giá trị của tham số :maSV.'
              ),
            ],
          }),

          new Paragraph({ spacing: { after: 200 } }),

          // MỤC 4: TRẢ LỜI 6 CÂU HỎI VẤN ĐÁP
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({
                text: '4. Giải đáp 6 câu hỏi vấn đáp cốt lõi cuối buổi',
                bold: true,
                size: 26,
                color: primaryColor,
              }),
            ],
          }),

          // Câu 1
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 140, after: 60 },
            children: [
              new TextRun({ text: 'Câu 1: Request PUT đi qua những file nào trong dự án?', bold: true, size: 23, color: secondaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun('Request PUT /api/v1/sinh-vien/:maSV đi qua tuần tự theo mô hình phân tầng:\n'),
              new TextRun('1. '), new TextRun({ text: 'src/server.ts', bold: true }), new TextRun(': Tiếp nhận HTTP request, đi qua các middleware toàn cục (logger, helmet, cors, express.json) rồi định tuyến vào /api/v1/sinh-vien.\n'),
              new TextRun('2. '), new TextRun({ text: 'src/routes/sinhVien.routes.ts', bold: true }), new TextRun(': Khớp phương thức PUT và pattern /:maSV, chuyển giao việc xử lý cho controller capNhatSinhVien.\n'),
              new TextRun('3. '), new TextRun({ text: 'src/controllers/sinhVien.controller.ts', bold: true }), new TextRun(': Đọc maSV từ req.params, lấy body dữ liệu và gọi await capNhatSinhVienService(maSV, req.body).\n'),
              new TextRun('4. '), new TextRun({ text: 'src/services/sinhVien.service.ts', bold: true }), new TextRun(': Thực hiện kiểm tra tính hợp lệ của dữ liệu (validation), tìm bản ghi qua SinhVien.findByPk và gọi sv.update({ hoTen, email, maLop }).\n'),
              new TextRun('5. '), new TextRun({ text: 'src/models/SinhVien.ts & SQL Server', bold: true }), new TextRun(': Sequelize ORM sinh câu lệnh UPDATE dbo.SinhVien SET ... WHERE maSV = ... thực thi xuống SQL Server.\n'),
              new TextRun('6. Sau khi cập nhật thành công, Service trả về DTO -> Controller đóng gói JSON { success: true, message: ..., data } và gửi trả HTTP 200 cho Client.'),
            ],
          }),

          // Câu 2
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 140, after: 60 },
            children: [
              new TextRun({ text: 'Câu 2: Vì sao gọi GET sau khi DELETE trả về 404 là một test đạt?', bold: true, size: 23, color: secondaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun(
                'Bởi vì mục tiêu của thao tác DELETE là xóa bỏ vĩnh viễn tài nguyên khỏi hệ thống. Việc gọi GET ngay sau DELETE và nhận được HTTP 404 Not Found chính là bằng chứng xác minh độc lập (verification) chứng minh rằng bản ghi đã thực sự bị xóa khỏi CSDL SQL Server chứ không phải server chỉ trả về mã 200 giả vờ thành công. Nếu GET lại vẫn trả về 200 thì bài test xóa xem như thất bại.'
              ),
            ],
          }),

          // Câu 3
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 140, after: 60 },
            children: [
              new TextRun({ text: 'Câu 3: File Swagger YAML (docs/openapi.yaml) có tự xử lý nghiệp vụ Backend không?', bold: true, size: 23, color: secondaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun(
                'Không. File YAML chỉ đóng vai trò là tài liệu đặc tả hợp đồng giao tiếp (API Contract Specification). Nó mô tả cho Client biết API có những endpoint nào, nhận tham số gì và cấu trúc dữ liệu trả về ra sao. Toàn bộ logic kiểm tra hợp lệ, xử lý nghiệp vụ, kiểm tra ràng buộc CSDL và lưu trữ thực tế hoàn toàn do mã nguồn Backend (Route, Controller, Service, Sequelize) đảm nhiệm lúc chạy.'
              ),
            ],
          }),

          // Câu 4
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 140, after: 60 },
            children: [
              new TextRun({ text: 'Câu 4: Vì sao phải gọi GET lại sau mỗi thao tác ghi (POST, PUT, DELETE)?', bold: true, size: 23, color: secondaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun(
                'Một API có thể phản hồi mã HTTP 200 hoặc 201 thành công cùng dữ liệu mẫu dạng JSON nhưng thực tế câu lệnh lưu vào CSDL có thể đã bị bỏ qua hoặc bị lỗi ngầm. Việc chủ động gọi GET lại sau mỗi thao tác ghi giúp đối chiếu trạng thái thực tế của dữ liệu trong CSDL, đảm bảo tính nhất quán (Data Consistency) và chứng minh thao tác ghi có hiệu lực thật sự.'
              ),
            ],
          }),

          // Câu 5
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 140, after: 60 },
            children: [
              new TextRun({ text: 'Câu 5: Sau khi restart server Node.js, dữ liệu có còn không?', bold: true, size: 23, color: secondaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun(
                'Dữ liệu vẫn còn nguyên vẹn 100%. Lý do là dự án đã chuyển sang lưu trữ bền vững (Persistent Storage) trong hệ quản trị cơ sở dữ liệu Microsoft SQL Server trên ổ cứng. Khi khởi động lại server Node.js, chỉ có tiến trình ứng dụng trong bộ nhớ RAM được khởi động lại, còn toàn bộ dữ liệu sinh viên trong bảng dbo.SinhVien của SQL Server không hề bị ảnh hưởng.'
              ),
            ],
          }),

          // Câu 6
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 140, after: 60 },
            children: [
              new TextRun({ text: 'Câu 6: Khung CTCO giúp viết Prompt rõ ràng và hiệu quả như thế nào?', bold: true, size: 23, color: secondaryColor }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun(
                'Khung CTCO mang lại 4 lợi ích vượt trội:\n' +
                '• Cung cấp đầy đủ Context giúp AI hiểu rõ kiến trúc dự án, tránh việc AI tự suy diễn hoặc tạo mã nguồn không khớp phiên bản.\n' +
                '• Định nghĩa Task cụ thể giúp chia nhỏ bài toán lớn thành các bước giải quyết đơn mục tiêu, dễ kiểm soát và dễ debug.\n' +
                '• Thiết lập Constraint nghiêm ngặt để bảo vệ các nguyên tắc thiết kế quan trọng (không đổi kiểu dữ liệu, giữ cấu trúc DTO, không phá vỡ logic cũ).\n' +
                '• Quy định rõ Output giúp kết quả trả về sử dụng được ngay, có đầy đủ vị trí file cần chỉnh sửa và kịch bản kiểm thử rõ ràng.'
              ),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = path.resolve(process.cwd(), 'docs', 'Nhat_Ky_Prompt_Log_Buoi_5.docx');
  fs.writeFileSync(outputPath, buffer);

  // Tạo thêm file docs/prompt-log.docx theo tên gốc để tiện mở
  const shortOutputPath = path.resolve(process.cwd(), 'docs', 'prompt-log.docx');
  fs.writeFileSync(shortOutputPath, buffer);

  console.log(`Đã xuất file Word thành công tại: ${outputPath}`);
  console.log(`Đã sao chép thêm tại: ${shortOutputPath}`);
}

generatePromptLogWordDoc().catch((err) => {
  console.error('Lỗi khi tạo file Word:', err);
  process.exit(1);
});
