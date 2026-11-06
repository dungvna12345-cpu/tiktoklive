/**
 * Module Chuẩn Hóa Bình Luận & Trích Xuất Đáp Án (A/B/C/D)
 * Hỗ trợ bóc tách chữ cái tiếng Việt không dấu, loại bỏ nhiễu.
 */

// Bảng chuyển đổi ký tự tiếng Việt có dấu thành không dấu
function removeVietnameseTones(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

/**
 * Trích xuất đáp án A, B, C, hoặc D từ bình luận.
 * @param {string} rawText 
 * @returns {number|null} 0 for A, 1 for B, 2 for C, 3 for D, hoặc null nếu không hợp lệ.
 */
function extractAnswer(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;

  // 1. Chuyển sang không dấu, chữ thường, bỏ khoảng trắng thừa ở hai đầu
  const clean = removeVietnameseTones(rawText).toLowerCase().trim();

  // 2. Kiểm tra nếu chỉ có đúng 1 ký tự hoặc ký tự kèm dấu câu: "a", "b.", "c!", "d,"
  const singleMatch = clean.match(/^([abcd])[.\s,!?:;~-]*$/i);
  if (singleMatch) {
    return 'abcd'.indexOf(singleMatch[1]);
  }

  // 3. Các mẫu thường gặp: "dap an a", "chon b", "cau c", "chac la d", "d nha", "a nhe"
  // Tìm từ khóa chỉ đáp án kèm chữ A-D
  const prefixMatch = clean.match(/(?:dap an|chon|cau|la|phuong an|chac la|minh chon)\s*[:=]?\s*([abcd])\b/i);
  if (prefixMatch) {
    return 'abcd'.indexOf(prefixMatch[1]);
  }

  // 4. Mẫu từ A-D đứng đầu câu hoặc sau dấu cách/dấu câu, theo sau bởi khoảng trắng hoặc dấu câu:
  // "a nha", "b nhe", "c luon", "d di", "a - ha noi"
  const wordMatch = clean.match(/(?:^|[\s,.:;!?-])([abcd])(?:[\s,.:;!?-]|$)/i);
  if (wordMatch) {
    return 'abcd'.indexOf(wordMatch[1]);
  }

  return null;
}

/**
 * Lọc từ ngữ thô tục trong tên hiển thị hoặc bình luận.
 */
const PROFANITY_WORDS = [
  'dm', 'vcl', 'clgt', 'dcm', 'vl', 'dit', 'cac', 'lon', 'buoi',
  'fuck', 'shit', 'bitch', 'asshole', 'pussy', 'dick'
];

function sanitizeNickname(nickname) {
  if (!nickname) return 'Người xem';
  let safe = String(nickname).trim();
  const lowerNoTone = removeVietnameseTones(safe).toLowerCase();

  for (const word of PROFANITY_WORDS) {
    const reg = new RegExp(`\\b${word}\\b`, 'gi');
    if (reg.test(lowerNoTone)) {
      safe = safe.replace(new RegExp(word, 'gi'), '***');
    }
  }

  // Giới hạn độ dài tên để tránh vỡ giao diện
  if (safe.length > 20) {
    safe = safe.slice(0, 18) + '…';
  }
  return safe || 'Người xem';
}

module.exports = {
  removeVietnameseTones,
  extractAnswer,
  sanitizeNickname
};
