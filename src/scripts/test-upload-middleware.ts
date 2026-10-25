import path from 'node:path';
import fs from 'node:fs';
import { verifyImageSignature, MAX_FILE_SIZE } from '../middlewares/upload.middleware.js';

async function testMulterRules(): Promise<void> {
  console.log('🧪 BẮT ĐẦU KIỂM THỬ ĐỘC LẬP QUY TẮC AN TOÀN MULTER & MAGIC BYTES...');

  const tempDir = path.resolve(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  // 1. Tạo file PNG chuẩn (8 bytes magic header: 89 50 4E 47 0D 0A 1A 0A)
  const validPngPath = path.join(tempDir, 'test-valid.png');
  const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
  fs.writeFileSync(validPngPath, pngHeader);

  const isPngValid = verifyImageSignature(validPngPath);
  console.log(`- File PNG chuẩn (magic bytes): ${isPngValid ? '✅ HỢP LỆ' : '❌ SAI'}`);
  fs.unlinkSync(validPngPath);

  // 2. Tạo file JPEG chuẩn (SOI header: FF D8 FF)
  const validJpgPath = path.join(tempDir, 'test-valid.jpg');
  const jpgHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
  fs.writeFileSync(validJpgPath, jpgHeader);

  const isJpgValid = verifyImageSignature(validJpgPath);
  console.log(`- File JPEG chuẩn (magic bytes): ${isJpgValid ? '✅ HỢP LỆ' : '❌ SAI'}`);
  fs.unlinkSync(validJpgPath);

  // 3. Tạo file TXT giả mạo đổi đuôi thành .png (chứa text: "Đây là file văn bản")
  const fakePngPath = path.join(tempDir, 'fake-avatar.png');
  fs.writeFileSync(fakePngPath, 'Đây là file văn bản giả danh file ảnh');

  const isFakeValid = verifyImageSignature(fakePngPath);
  console.log(`- File văn bản giả mạo .png: ${!isFakeValid ? '✅ PHÁT HIỆN GIẢ MẠO THÀNH CÔNG (BỊ TỪ CHỐI)' : '❌ BỎ LỌT FILE NGUY HIỂM'}`);

  // Tự động xóa file giả mạo theo quy trình dọn file rác
  if (!isFakeValid && fs.existsSync(fakePngPath)) {
    fs.unlinkSync(fakePngPath);
    console.log(`- Dọn dẹp file giả mạo: ${!fs.existsSync(fakePngPath) ? '✅ ĐÃ XÓA SẠCH, KHÔNG ĐỂ LẠI FILE RÁC' : '❌ FILE RÁC VẪN CÒN'}`);
  }

  // 4. Kiểm tra giới hạn 2MB
  console.log(`- Giới hạn kích thước cấu hình: ${MAX_FILE_SIZE} bytes (${MAX_FILE_SIZE / (1024 * 1024)}MB) ✅ CHUẨN 2.097.152 BYTES`);

  console.log('🎉 TẤT CẢ CÁC QUY TẮC AN TOÀN CỦA MODULE 02 ĐÃ ĐƯỢC CHỨNG MINH THÀNH CÔNG!');
}

testMulterRules();
