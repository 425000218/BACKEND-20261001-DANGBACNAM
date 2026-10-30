import { describe, it, expect } from '@jest/globals';

interface ICartItem {
  name: string;
  price: number;
  quantity: number;
}

/**
 * Hàm tính tổng tiền giỏ hàng độc lập (Bài tập mở rộng Buổi 12 - Slide 16)
 */
export function calculateCartTotal(items: ICartItem[], discountPercent = 0): number {
  if (!Array.isArray(items)) {
    throw new Error('Danh sách sản phẩm phải là một mảng');
  }

  if (discountPercent < 0 || discountPercent > 100 || isNaN(discountPercent)) {
    throw new Error('Tỷ lệ giảm giá không hợp lệ (phải từ 0 đến 100%)');
  }

  let subtotal = 0;
  for (const item of items) {
    if (typeof item.price !== 'number' || typeof item.quantity !== 'number') {
      throw new Error('Giá tiền và số lượng phải là kiểu số');
    }
    if (item.price < 0 || item.quantity < 0) {
      throw new Error('Giá tiền và số lượng không được là số âm');
    }
    subtotal += item.price * item.quantity;
  }

  const discountAmount = (subtotal * discountPercent) / 100;
  const finalTotal = subtotal - discountAmount;
  return Math.round(finalTotal * 100) / 100; // Làm tròn 2 chữ số thập phân
}

describe('Mở rộng Buổi 12 - Unit Test Logic Tính Tổng Giỏ Hàng', () => {
  it('C01: Giỏ hàng rỗng -> Tổng tiền bằng 0', () => {
    expect(calculateCartTotal([])).toBe(0);
    expect(calculateCartTotal([], 10)).toBe(0);
  });

  it('C02: Giỏ hàng nhiều sản phẩm, không giảm giá -> Tính tổng chính xác', () => {
    const items: ICartItem[] = [
      { name: 'Sách Giáo trình Backend', price: 120000, quantity: 2 },
      { name: 'Vở ghi chép', price: 15000, quantity: 5 },
    ];
    // 120000 * 2 + 15000 * 5 = 240000 + 75000 = 315000
    expect(calculateCartTotal(items)).toBe(315000);
  });

  it('C03: Áp dụng giảm giá hợp lệ (10%, 50%) -> Giảm trừ chính xác', () => {
    const items: ICartItem[] = [
      { name: 'Khóa học Node.js', price: 500000, quantity: 1 },
    ];
    // Giảm 10% -> 450,000
    expect(calculateCartTotal(items, 10)).toBe(450000);
    // Giảm 50% -> 250,000
    expect(calculateCartTotal(items, 50)).toBe(250000);
  });

  it('C04: Tỷ lệ giảm giá không hợp lệ (âm hoặc > 100) -> Ném lỗi ngoại lệ', () => {
    const items: ICartItem[] = [{ name: 'Sản phẩm A', price: 100000, quantity: 1 }];
    expect(() => calculateCartTotal(items, -5)).toThrow('Tỷ lệ giảm giá không hợp lệ');
    expect(() => calculateCartTotal(items, 105)).toThrow('Tỷ lệ giảm giá không hợp lệ');
  });

  it('C05: Dữ liệu số âm hoặc sai kiểu -> Ném lỗi ngoại lệ', () => {
    expect(() => calculateCartTotal([{ name: 'Lỗi giá', price: -50000, quantity: 1 }])).toThrow(
      'Giá tiền và số lượng không được là số âm'
    );
    expect(() => calculateCartTotal([{ name: 'Lỗi số lượng', price: 50000, quantity: -2 }])).toThrow(
      'Giá tiền và số lượng không được là số âm'
    );
    expect(() => calculateCartTotal('không phải mảng' as any)).toThrow(
      'Danh sách sản phẩm phải là một mảng'
    );
  });
});
