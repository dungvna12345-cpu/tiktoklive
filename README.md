# 📚 THÁP SÁCH – Game Đố Vui Leo Tháp Tương Tác Trên TikTok LIVE

**THÁP SÁCH** là một tựa game tương tác đố vui leo tháp độc đáo và hấp dẫn dành riêng cho các buổi phát trực tiếp trên **TikTok LIVE**, chạy trên hệ điều hành Windows, phát sóng trực tiếp qua **TikTok LIVE Studio** hoặc **OBS Studio**.

Game kết nối trực tiếp với phiên LIVE thật của kênh, lấy dữ liệu người xem thực tế (tên, avatar, bình luận, quà tặng, like, follow, share). Người xem bình luận A/B/C/D để trả lời câu hỏi trắc nghiệm; trả lời đúng sẽ leo tầng tháp sách. Ai chạm Tầng 20 ("Đỉnh Tháp") đầu tiên sẽ chiến thắng vòng chơi!

---

## 🌟 TÍNH NĂNG NỔI BẬT

1. **Đồ Họa Dọc Chuẩn 9:16 (1080x1920)**:
   - Tòa tháp gồm 20 cuốn sách đa màu sắc, gáy sách ghi số tập từ "TẬP 1" đến "TẬP 19", tầng 20 là "ĐỈNH THÁP" vàng kim vinh danh người chiến thắng.
   - Thẻ câu hỏi phong cách trang vở học sinh kẻ lề đỏ, dòng kẻ ngang, đồng hồ đếm ngược số lớn và 4 ô đáp án 2x2.
   - Sau mỗi câu có ô **"BẠN CÓ BIẾT?"** cung cấp kiến thức mở rộng bổ ích.
   - Camera mượt mà tự động trượt theo người dẫn đầu, hiển thị khoảng 7 tầng cùng lúc.
   - Bảng xếp hạng Top 6 leo cao nhất và thanh tiến độ chạm đích tầng 20.

2. **Luật Chơi Kịch Tính**:
   - Mỗi câu gồm 3 giai đoạn: **ĐỌC ĐỀ** (3s) ➔ **TRẢ LỜI** (15s, 5s cuối đổi màu đỏ kèm âm thanh đếm nhịp) ➔ **CÔNG BỐ** (7s, hiện đáp án đúng, % người chọn, ô Bạn có biết, nhân vật nhảy lên hoặc tụt tầng).
   - Chuẩn hóa bình luận tiếng Việt tự động: nhận dạng linh hoạt `A`, `b.`, `c nha`, `đáp án d`, `chọn b`...
   - Cứ 5 câu có 1 **"CÂU THỬ THÁCH"**: đúng leo 2 tầng, sai bị tụt 1 tầng (không thấp hơn mặt đất).
   - Top 3 người đúng nhanh nhất nhận thêm +1 tầng thưởng.

3. **Tương Tác Quà Tặng & Hiệu Ứng Phong Phú**:
   - 🌹 **Thang tre** (Hoa hồng / Quà nhỏ): Người tặng leo ngay 1–3 tầng.
   - 🫰 **Gợi ý 50:50** (Thả tim): Loại bỏ 2 đáp án sai của câu đang hỏi, kèm thông báo vinh danh người tặng.
   - 🍩 **Gió đẩy x2** (Bánh rán): Nhân đôi số tầng leo cho tất cả người trả lời đúng trong câu.
   - 🧢 **Đóng băng** (Nón): Đóng băng người đang dẫn đầu ở câu tiếp theo (hiệu ứng khối băng đẹp mắt).
   - 🎆 **Cáp treo** (Pháo hoa / Quà lớn): Người tặng bay vút lên ngay +4 tầng.
   - ❤️ **Cổ vũ bằng Like**: Cứ mỗi 500 like của cả phòng ➔ Kích hoạt sự kiện "Cả lớp cổ vũ!" và tặng Gió x2 câu tiếp.
   - ➕ **Follow**: Thưởng +1 tầng chào mừng bạn mới.
   - 🚀 **Share**: Thưởng +1 tầng lan tỏa LIVE.

4. **Ngân Hàng 300 Câu Hỏi Chính Xác**:
   - 7 chủ đề phong phú: Khoa học, Địa lý VN & Thế giới, Lịch sử Việt Nam, Văn học, Toán nhẩm, Tiếng Anh cơ bản, Đời sống.
   - Tích hợp bộ lọc chủ đề, độ khó, tìm kiếm, sửa/xóa và Nhập/Xuất file JSON.

5. **Trang Quản Trị & Chế Độ Giả Lập Hoàn Hảo**:
   - Kết nối/ngắt kết nối TikTok LIVE theo username, tự động kết nối lại khi mất mạng (exponential backoff).
   - **Chế độ Giả lập (Simulator)**: Nút "Thêm 20 người xem ảo" với bot tự động trả lời tỉ lệ đúng 45–85% và thời gian ngẫu nhiên; bot tự tặng quà ngẫu nhiên giúp bạn kiểm tra toàn bộ game trước khi lên sóng.
   - SQLite lưu trữ lịch sử, điểm số và có nút "Xóa toàn bộ thống kê".

---

## 📁 CẤU TRÚC THƯ MỤC

```text
thap-sach/
├── server/
│   ├── index.js              # Khởi tạo Express, Socket.IO, REST API
│   ├── tiktok.js             # Kết nối tiktok-live-connector, reconnect backoff
│   ├── game.js               # Game Engine - Nguồn sự thật duy nhất (Single Source of Truth)
│   ├── scoring.js            # Tính điểm, leo/tụt tầng, thưởng top 3, thử thách, gió x2
│   ├── questions.js          # Quản lý bộ câu hỏi, shuffle không lặp lại, CRUD
│   ├── gifts.js              # Ánh xạ quà tặng & bộ xử lý streak combo quà
│   ├── normalize.js          # Chuẩn hóa bình luận A/B/C/D & lọc từ ngữ thô tục
│   ├── avatar.js             # Proxy tải và cache avatar tránh lỗi CORS trên Canvas
│   ├── db.js                 # Cơ sở dữ liệu SQLite (better-sqlite3)
│   ├── simulator.js          # Giả lập bot người xem ảo và tương tác test
│   └── generate_questions.js # Script sinh bộ câu hỏi 300 câu
├── public/
│   ├── game/                 # Giao diện màn hình game (Canvas 2D)
│   │   ├── index.html        # Khung HTML 9:16
│   │   ├── style.css         # Bố cục dọc tối ưu cho livestream
│   │   ├── main.js           # Kết nối Socket.IO & vòng lặp 60fps
│   │   ├── render.js         # Pipeline vẽ tổng hợp
│   │   ├── tower.js          # Vẽ tháp 20 tầng, nhân vật leo, camera lerp
│   │   ├── card.js           # Vẽ thẻ câu hỏi vở kẻ dòng & ô "Bạn có biết?"
│   │   ├── fx.js             # Hiệu ứng mây trời, pháo hoa, banner phóng to, vinh danh
│   │   └── audio.js          # Bộ tổng hợp âm thanh Web Audio API
│   └── admin/                # Bảng điều khiển Admin
│       ├── index.html        # Giao diện quản trị tab hiện đại
│       ├── admin.js          # Xử lý điều khiển, giả lập, cấu hình, realtime log
│       └── style.css         # Giao diện Dark theme chuyên nghiệp
├── config/
│   ├── game.json             # Cấu hình thời gian các pha và luật chơi
│   └── gifts.json            # Bảng ánh xạ quà tặng TikTok sang hiệu ứng
├── data/
│   ├── questions.json        # 300 câu hỏi trắc nghiệm tiếng Việt
│   └── thap_sach.db          # Database SQLite lưu điểm người chơi
├── test/
│   ├── normalize.test.js     # Unit test chuẩn hóa bình luận
│   ├── scoring.test.js       # Unit test tính điểm và thăng tụt tầng
│   └── gifts.test.js         # Unit test ánh xạ quà và combo streak
├── .env.example              # File mẫu cấu hình môi trường
├── package.json
└── README.md
```

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN

### Bước 1: Chuẩn bị môi trường
- Đảm bảo máy tính đã cài đặt **Node.js** phiên bản 20 trở lên (khuyên dùng Node.js 22 LTS).
- Mở PowerShell hoặc Terminal tại thư mục dự án:
```powershell
cd "d:\1.Dũng\Của Dũng k động vào\TIKTOK"
```

### Bước 2: Cài đặt thư viện
```powershell
npm install
```

### Bước 3: Chạy kiểm thử Unit Test
```powershell
npm test
```
*Tất cả 13 test case kiểm tra chuẩn hóa câu trả lời, tính điểm, thưởng phạt và combo quà sẽ vượt qua 100%.*

### Bước 4: Khởi động máy chủ
```powershell
npm start
```
Khi màn hình xuất hiện thông báo:
```text
=======================================================
🎮 THÁP SÁCH - TikTok LIVE Game Server
📡 Máy chủ đang chạy tại: http://localhost:3000
🎯 Màn hình Game (OBS/TikTok LIVE Studio): http://localhost:3000/game
⚙️ Bảng Điều Khiển Admin: http://localhost:3000/admin
=======================================================
```
*(Nếu cổng 3000 đang được ứng dụng khác sử dụng, hệ thống sẽ tự động chuyển sang cổng 3001 hoặc 3002 một cách thông minh mà không gây xung đột).*

---

## 🧪 CHẠY THỬ BẰNG CHẾ ĐỘ GIẢ LẬP (TRƯỚC KHI LÊN SÓNG)

1. Mở trình duyệt vào trang Admin: **`http://localhost:3000/admin`** (hoặc cổng tương ứng hiển thị trong terminal).
2. Mở một tab khác vào trang Game: **`http://localhost:3000/game`**.
3. Tại trang Admin, chuyển sang tab **"🤖 Chế Độ Giả Lập"**:
   - Bấm nút **"➕ Thêm 20 Người Xem Ảo"**: ngay lập tức 20 nhân vật sẽ xuất hiện ở chân tháp sách và tự động tham gia trả lời các câu hỏi tiếp theo!
   - Bấm nút **"🎁 Bật Bot Tự Tặng Quà"**: các bot sẽ thỉnh thoảng tặng hoa hồng, thả tim 50:50, bánh rán x2, nón đóng băng hoặc pháo hoa cáp treo.
   - Thử gửi bình luận tự do ở ô "Gửi Bình Luận Thủ Công": gõ `a`, `b nha`, `chọn c` để xem nhân vật của bạn leo tầng.

---

## 📺 CẤU HÌNH PHÁT SÓNG TRÊN TIKTOK LIVE STUDIO / OBS STUDIO

### Dùng TikTok LIVE Studio:
1. Mở phần mềm **TikTok LIVE Studio**.
2. Chọn **Thêm nguồn (Add Source)** ➔ Chọn **Browser (Trình duyệt)** hoặc **Window Capture (Cửa sổ)**.
3. Nếu chọn **Browser**:
   - URL: `http://localhost:3000/game`
   - Chiều rộng (Width): `1080`
   - Chiều cao (Height): `1920`
4. Nếu chọn **Window Capture**:
   - Mở trang `http://localhost:3000/game` trên trình duyệt Chrome/Edge, bật chế độ toàn màn hình (F11) và chọn cửa sổ đó.
5. Căn chỉnh vị trí tháp sách và thẻ câu hỏi vào giữa khung hình livestream dọc.

### Dùng OBS Studio:
1. Trong mục **Sources**, bấm dấu **+** ➔ Chọn **Browser**.
2. Đặt URL: `http://localhost:3000/game`.
3. Width: `1080`, Height: `1920`.
4. Đánh dấu tích vào ô *Control audio via OBS* (nếu muốn chỉnh âm lượng game qua OBS).

---

## 📡 BẬT LIVE VÀ KẾT NỐI VỚI PHIÊN THẬT

1. Bắt đầu buổi phát trực tiếp trên TikTok từ điện thoại hoặc TikTok LIVE Studio.
2. Mở trang Admin **`http://localhost:3000/admin`**.
3. Tại ô **Kết Nối Phiên LIVE TikTok**, nhập tên tài khoản của bạn (ví dụ: `dung_phuong` hoặc `@dung_phuong`).
4. Bấm **Kết Nối**:
   - Chấm tròn chuyển sang màu xanh lá: **Đã kết nối thành công!**
   - Số người xem (Viewers) sẽ hiển thị đúng số người thực tế đang xem livestream.
   - Khi người xem bình luận A/B/C/D, avatar và tên thật của họ sẽ tự động xuất hiện ở mặt đất và bắt đầu cuộc đua leo tháp!

---

## 🛠️ XỬ LÝ SỰ CỐ THƯỜNG GẶP (FAQ)

### 1. Bấm kết nối nhưng báo lỗi hoặc trạng thái "Chưa kết nối"?
- **Nguyên nhân**: Tài khoản chưa thực sự bắt đầu phát trực tiếp công khai, hoặc nhập sai chính tả username.
- **Cách xử lý**: Hãy kiểm tra trên ứng dụng TikTok xem buổi LIVE đã công khai chưa, sau đó nhập chính xác username (không cần dấu `@`) và bấm kết nối lại.

### 2. Mạng chập chờn bị mất kết nối giữa chừng?
- Game đã tích hợp sẵn cơ chế **Tự động kết nối lại (Exponential Backoff)**: 5 giây, 10 giây, 20 giây, 40 giây... tối đa 2 phút.
- Trong lúc kết nối lại, góc màn hình game chỉ hiện một nhãn nhỏ "Đang kết nối lại...", toàn bộ vòng câu hỏi và điểm số của người chơi **vẫn tiếp tục diễn ra bình thường** mà không bị gián đoạn!

### 3. Khán giả tặng quà nhưng không nhận đúng hiệu ứng?
- Vào tab **"🎁 Cấu Hình Quà Tặng"** trên trang Admin.
- Xem mục **"Nhật Ký Sự Kiện Realtime"** ở Tab 1 để biết chính xác `giftId` và tên món quà vừa được tặng.
- Điền tên quà hoặc `giftId` đó vào dòng hiệu ứng bạn mong muốn (ví dụ: thêm vào mục Thang tre hoặc Cáp treo) và bấm **"Lưu Ánh Xạ"**.

### 4. Muốn thay đổi bộ câu hỏi hoặc bổ sung câu hỏi của riêng bạn?
- Vào tab **"❓ Ngân Hàng Câu Hỏi"**:
  - Bấm **"➕ Thêm Câu Hỏi"** để tạo câu hỏi trực tiếp.
  - Hoặc bấm **"📥 Xuất JSON"** để tải file về máy, chỉnh sửa trên Notepad/Excel rồi bấm **"📤 Nhập JSON"** để nạp vào game chỉ trong 1 giây!

---

## ⚖️ GIẤY PHÉP VÀ CAM KẾT
- Dự án tuân thủ nghiêm ngặt các quy định của TikTok: **Chỉ đọc dữ liệu công khai từ chính chủ kênh**, không spam, không tự động đăng nhập, không can thiệp trái phép.
- Bản quyền thuộc về tác giả. Chúc bạn có những buổi phát sóng trực tiếp sôi động và đạt kỷ lục người xem! 🎉
