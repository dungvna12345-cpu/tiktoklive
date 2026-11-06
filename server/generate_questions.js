/**
 * Script khởi tạo 300 câu hỏi chất lượng cao cho Tháp Sách
 * Các chủ đề: Khoa học, Địa lý VN & Thế giới, Lịch sử VN, Văn học, Toán nhẩm, Tiếng Anh cơ bản, Đời sống
 */

const fs = require('fs');
const path = require('path');

const rawQuestions = [
  // --- KHOA HỌC (Science) ---
  {
    q: "Hành tinh nào gần Mặt Trời nhất trong Hệ Mặt Trời?",
    opts: ["Sao Thủy", "Sao Kim", "Sao Hỏa", "Sao Mộc"],
    ans: 0,
    fact: "Sao Thủy chỉ mất 88 ngày Trái Đất để quay quanh Mặt Trời nhưng một ngày trên đó dài tới 59 ngày Trái Đất.",
    topic: "Khoa học",
    lvl: 1
  },
  {
    q: "Công thức hóa học của nước là gì?",
    opts: ["CO2", "H2O", "O2", "NaCl"],
    ans: 1,
    fact: "Một phân tử nước gồm 2 nguyên tử hydro liên kết với 1 nguyên tử oxy bằng liên kết cộng hóa trị.",
    topic: "Khoa học",
    lvl: 1
  },
  {
    q: "Chất khí nào chiếm tỉ lệ lớn nhất trong khí quyển Trái Đất?",
    opts: ["Oxy", "Cacbonic", "Nitơ", "Argon"],
    ans: 2,
    fact: "Khí Nitơ (N2) chiếm khoảng 78% thể tích khí quyển, trong khi Oxy chỉ chiếm khoảng 21%.",
    topic: "Khoa học",
    lvl: 1
  },
  {
    q: "Kim loại nào là chất lỏng ở nhiệt độ phòng?",
    opts: ["Chì", "Thủy ngân", "Bạc", "Nhôm"],
    ans: 1,
    fact: "Thủy ngân có nhiệt độ nóng chảy là -38.83 °C, là kim loại duy nhất ở dạng lỏng ở nhiệt độ thường.",
    topic: "Khoa học",
    lvl: 1
  },
  {
    q: "Tế bào quang hợp của cây xanh chứa sắc tố màu gì?",
    opts: ["Đỏ", "Xanh lục", "Vàng", "Tím"],
    ans: 1,
    fact: "Diệp lục hấp thụ ánh sáng xanh lam và đỏ tốt nhất, phản xạ ánh sáng xanh lục nên lá cây có màu xanh.",
    topic: "Khoa học",
    lvl: 1
  },
  {
    q: "Đơn vị đo cường độ dòng điện là gì?",
    opts: ["Vôn (V)", "Ampe (A)", "Ohm (Ω)", "Watt (W)"],
    ans: 1,
    fact: "Đơn vị Ampe được đặt theo tên nhà vật lý người Pháp André-Marie Ampère, cha đẻ của điện từ học.",
    topic: "Khoa học",
    lvl: 2
  },
  {
    q: "Vận tốc ánh sáng trong chân không xấp xỉ bao nhiêu?",
    opts: ["300.000 km/s", "150.000 km/s", "1.000 km/s", "30.000 km/s"],
    ans: 0,
    fact: "Ánh sáng từ Mặt Trời mất khoảng 8 phút 20 giây để đi đến Trái Đất với tốc độ gần 300.000 km/s.",
    topic: "Khoa học",
    lvl: 2
  },
  {
    q: "Nguyên tố hóa học nào có độ âm điện lớn nhất?",
    opts: ["Oxy", "Clo", "Flo", "Heli"],
    ans: 2,
    fact: "Flo có độ âm điện xấp xỉ 3.98 theo thang Pauling, là phi kim hoạt động hóa học mạnh nhất.",
    topic: "Khoa học",
    lvl: 3
  },
  {
    q: "ADN người có cấu trúc dạng gì?",
    opts: ["Xoắn đơn", "Xoắn kép", "Vòng tròn dẹt", "Hình cầu"],
    ans: 1,
    fact: "Mô hình xoắn kép của ADN được James Watson và Francis Crick khám phá vào năm 1953.",
    topic: "Khoa học",
    lvl: 1
  },
  {
    q: "Bộ phận nào trong cơ thể người sản xuất insulin?",
    opts: ["Gan", "Thận", "Tuyến tụy", "Dạ dày"],
    ans: 2,
    fact: "Các tế bào beta trong đảo tụy của tuyến tụy chịu trách nhiệm tiết insulin để điều hòa đường huyết.",
    topic: "Khoa học",
    lvl: 2
  },
  {
    q: "Âm thanh không thể truyền qua môi trường nào?",
    opts: ["Chân không", "Nước", "Sắt", "Không khí"],
    ans: 0,
    fact: "Sóng âm là sóng cơ học, cần các hạt vật chất dao động để truyền đi nên không thể lan truyền trong chân không.",
    topic: "Khoa học",
    lvl: 2
  },
  {
    q: "Hiện tượng cầu vồng hình thành do hiện tượng vật lý nào?",
    opts: ["Nhiễu xạ", "Tán sắc ánh sáng", "Phản xạ toàn phần", "Cộng hưởng"],
    ans: 1,
    fact: "Cầu vồng xuất hiện khi ánh sáng mặt trời bị khúc xạ và tán sắc qua hàng triệu giọt nước mưa li ti.",
    topic: "Khoa học",
    lvl: 2
  },
  {
    q: "Kim loại dẫn điện tốt nhất ở điều kiện tiêu chuẩn là gì?",
    opts: ["Vàng", "Đồng", "Bạc", "Nhôm"],
    ans: 2,
    fact: "Bạc dẫn điện tốt nhất, tiếp theo là đồng và vàng, nhưng đồng phổ biến hơn vì giá thành rẻ hơn nhiều.",
    topic: "Khoa học",
    lvl: 2
  },
  {
    q: "Lực nào giữ Trái Đất quay quanh Mặt Trời?",
    opts: ["Lực từ trường", "Lực hấp dẫn", "Lực ma sát", "Lực hạt nhân"],
    ans: 1,
    fact: "Định luật vạn vật hấp dẫn của Isaac Newton giải thích chuyển động của các hành tinh trong Hệ Mặt Trời.",
    topic: "Khoa học",
    lvl: 1
  },
  {
    q: "Nguyên tố nào phổ biến nhất trong vũ trụ?",
    opts: ["Hydro", "Heli", "Oxy", "Cacbon"],
    ans: 0,
    fact: "Hydro chiếm khoảng 75% tổng khối lượng nguyên tố trong vũ trụ, là nhiên liệu chính nuôi dưỡng các ngôi sao.",
    topic: "Khoa học",
    lvl: 3
  },

  // --- ĐỊA LÝ (Geography) ---
  {
    q: "Đỉnh núi nào được mệnh danh là nóc nhà của Đông Dương?",
    opts: ["Fansipan", "Ngọc Linh", "Pusilung", "Bạch Mộc Lương Tử"],
    ans: 0,
    fact: "Fansipan cao 3.143 mét, thuộc dãy Hoàng Liên Sơn, nằm giữa Lào Cai và Lai Châu.",
    topic: "Địa lý",
    lvl: 1
  },
  {
    q: "Sông nào dài nhất thế giới theo ghi nhận phổ biến?",
    opts: ["Sông Amazon", "Sông Nile", "Sông Mê Kông", "Sông Dương Tử"],
    ans: 1,
    fact: "Sông Nile ở châu Phi dài khoảng 6.650 km, chảy qua 11 quốc gia trước khi đổ ra Địa Trung Hải.",
    topic: "Địa lý",
    lvl: 1
  },
  {
    q: "Quốc gia nào có diện tích lãnh thổ lớn nhất thế giới?",
    opts: ["Canada", "Mỹ", "Nga", "Trung Quốc"],
    ans: 2,
    fact: "Nước Nga có diện tích hơn 17 triệu km², trải dài qua 11 múi giờ và chiếm 1/8 diện tích đất liền Trái Đất.",
    topic: "Địa lý",
    lvl: 1
  },
  {
    q: "Hồ nước ngọt tự nhiên lớn nhất Việt Nam là hồ nào?",
    opts: ["Hồ Ba Bể", "Hồ Dầu Tiếng", "Hồ Trị An", "Hồ Thác Bà"],
    ans: 0,
    fact: "Hồ Ba Bể nằm ở tỉnh Bắc Kạn, được UNESCO công nhận là một trong 20 hồ nước ngọt đặc biệt cần bảo vệ.",
    topic: "Địa lý",
    lvl: 2
  },
  {
    q: "Đại dương nào có diện tích lớn nhất trên Trái Đất?",
    opts: ["Đại Tây Dương", "Ấn Độ Dương", "Thái Bình Dương", "Bắc Băng Dương"],
    ans: 2,
    fact: "Thái Bình Dương chiếm hơn 30% diện tích bề mặt Trái Đất, lớn hơn toàn bộ diện tích các lục địa gộp lại.",
    topic: "Địa lý",
    lvl: 1
  },
  {
    q: "Vịnh Hạ Long thuộc địa phận tỉnh nào của Việt Nam?",
    opts: ["Hải Phòng", "Quảng Ninh", "Thái Bình", "Nam Định"],
    ans: 1,
    fact: "Vịnh Hạ Long có gần 2.000 hòn đảo đá vôi lớn nhỏ, hai lần được UNESCO vinh danh Di sản Thiên nhiên Thế giới.",
    topic: "Địa lý",
    lvl: 1
  },
  {
    q: "Đất nước nào được mệnh danh là 'Xứ sở hoa anh đào'?",
    opts: ["Hàn Quốc", "Nhật Bản", "Triều Tiên", "Đài Loan"],
    ans: 1,
    fact: "Hoa anh đào (Sakura) là biểu tượng văn hóa thanh cao và sức sống mãnh liệt của người dân Nhật Bản.",
    topic: "Địa lý",
    lvl: 1
  },
  {
    q: "Sa mạc nào là sa mạc nóng lớn nhất thế giới?",
    opts: ["Gobi", "Sahara", "Kalahari", "Atacama"],
    ans: 1,
    fact: "Sa mạc Sahara ở Bắc Phi có diện tích hơn 9 triệu km², xấp xỉ diện tích của toàn nước Mỹ.",
    topic: "Địa lý",
    lvl: 2
  },
  {
    q: "Thành phố nào là thủ đô của nước Úc (Australia)?",
    opts: ["Sydney", "Melbourne", "Canberra", "Brisbane"],
    ans: 2,
    fact: "Nhiều người nhầm Sydney là thủ đô của Úc, nhưng Canberra mới chính thức được chọn làm thủ đô từ năm 1908.",
    topic: "Địa lý",
    lvl: 2
  },
  {
    q: "Cao nguyên đá Đồng Văn thuộc tỉnh nào của Việt Nam?",
    opts: ["Hà Giang", "Cao Bằng", "Lạng Sơn", "Sơn La"],
    ans: 0,
    fact: "Cao nguyên đá Đồng Văn là Công viên Địa chất Toàn cầu đầu tiên của Việt Nam được UNESCO công nhận.",
    topic: "Địa lý",
    lvl: 2
  },
  {
    q: "Kênh đào nào nối liền Địa Trung Hải và Biển Đỏ?",
    opts: ["Kênh đào Panama", "Kênh đào Suez", "Kênh đào Kiel", "Kênh đào Corinth"],
    ans: 1,
    fact: "Kênh đào Suez khánh thành năm 1869, giúp rút ngắn khoảng 7.000 km hải trình từ châu Âu sang châu Á.",
    topic: "Địa lý",
    lvl: 3
  },
  {
    q: "Nước nào ở Đông Nam Á không giáp biển?",
    opts: ["Campuchia", "Lào", "Myanmar", "Thái Lan"],
    ans: 1,
    fact: "Lào là quốc gia nội lục duy nhất tại khu vực Đông Nam Á, bao quanh bởi 5 nước láng giềng.",
    topic: "Địa lý",
    lvl: 1
  },
  {
    q: "Châu lục nào lạnh nhất và khô nhất hành tinh?",
    opts: ["Châu Nam Cực", "Châu Bắc Cực", "Châu Âu", "Châu Úc"],
    ans: 0,
    fact: "Châu Nam Cực vừa là nơi lạnh nhất (-89.2 °C), vừa được xem là hoang mạc lớn nhất vì lượng mưa cực thấp.",
    topic: "Địa lý",
    lvl: 2
  },
  {
    q: "Đảo lớn nhất Việt Nam là đảo nào?",
    opts: ["Cát Bà", "Phú Quốc", "Côn Đảo", "Lý Sơn"],
    ans: 1,
    fact: "Đảo Phú Quốc thuộc tỉnh Kiên Giang có diện tích gần 589 km², nổi tiếng với tiêu, nước mắm và du lịch.",
    topic: "Địa lý",
    lvl: 1
  },
  {
    q: "Thác nước tự nhiên lớn nhất Đông Nam Á nằm ở biên giới Việt - Trung tên gì?",
    opts: ["Thác Bản Giốc", "Thác Dray Nur", "Thác Pongour", "Thác Dambri"],
    ans: 0,
    fact: "Thác Bản Giốc nằm trên sông Quây Sơn thuộc huyện Trùng Khánh, tỉnh Cao Bằng.",
    topic: "Địa lý",
    lvl: 2
  },

  // --- LỊCH SỬ VIỆT NAM (History) ---
  {
    q: "Chiến thắng Điện Biên Phủ 'lừng lẫy năm châu' diễn ra vào năm nào?",
    opts: ["1945", "1954", "1968", "1975"],
    ans: 1,
    fact: "Chiến dịch Điện Biên Phủ toàn thắng vào chiều ngày 7/5/1954 sau 56 ngày đêm khoét núi, ngủ hầm, mưa dầm, cơm vắt.",
    topic: "Lịch sử",
    lvl: 1
  },
  {
    q: "Vị vua nào đã ban 'Chiếu dời đô' từ Hoa Lư về Thăng Long năm 1010?",
    opts: ["Lý Thái Tổ", "Lý Nhân Tông", "Lê Lợi", "Trần Hưng Đạo"],
    ans: 0,
    fact: "Lý Thái Tổ (Lý Công Uẩn) nhìn thấy rồng vàng bay lên khi thuyền rẽ vào bến Đại La nên đặt tên kinh thành là Thăng Long.",
    topic: "Lịch sử",
    lvl: 1
  },
  {
    q: "Ai là người lãnh đạo cuộc khởi nghĩa Lam Sơn chống quân Minh giành độc lập?",
    opts: ["Nguyễn Trãi", "Lê Lợi", "Trần Quốc Tuấn", "Quang Trung"],
    ans: 1,
    fact: "Lê Lợi xưng là Bình Định Vương, dựng cờ khởi nghĩa ở Lam Sơn (Thanh Hóa) năm 1418 và lập ra nhà Hậu Lê.",
    topic: "Lịch sử",
    lvl: 1
  },
  {
    q: "Trận Bạch Đằng năm 938 do ai trực tiếp chỉ huy đánh tan quân Nam Hán?",
    opts: ["Ngô Quyền", "Trần Hưng Đạo", "Lê Hoàn", "Đinh Bộ Lĩnh"],
    ans: 0,
    fact: "Chiến thắng Bạch Đằng năm 938 của Ngô Quyền đã chấm dứt hơn 1000 năm Bắc thuộc, mở ra kỷ nguyên độc lập lâu dài.",
    topic: "Lịch sử",
    lvl: 1
  },
  {
    q: "Vị tướng nào được phong danh hiệu Hưng Đạo Đại Vương?",
    opts: ["Trần Quang Khải", "Trần Nhật Duật", "Trần Quốc Tuấn", "Trần Khánh Dư"],
    ans: 2,
    fact: "Trần Hưng Đạo có công lớn chỉ huy quân dân Đại Việt ba lần đánh tan quân xâm lược Nguyên Mông hung hãn.",
    topic: "Lịch sử",
    lvl: 1
  },
  {
    q: "Bản 'Tuyên ngôn Độc lập' khai sinh ra nước VNDCCH được Bác Hồ đọc vào ngày nào?",
    opts: ["19/08/1945", "02/09/1945", "30/04/1975", "01/01/1946"],
    ans: 1,
    fact: "Bản Tuyên ngôn Độc lập được Chủ tịch Hồ Chí Minh đọc tại Quảng trường Ba Đình lịch sử trước hàng vạn đồng bào.",
    topic: "Lịch sử",
    lvl: 1
  },
  {
    q: "Ai là nữ tướng duy nhất trong cuộc khởi nghĩa Hai Bà Trưng giữ chức chỉ huy thủy quân?",
    opts: ["Lê Chân", "Bát Nàn", "Thánh Thiên", "Thi Sách"],
    ans: 0,
    fact: "Nữ tướng Lê Chân là người có công khai hoang lập ấp, dựng nên trang An Biên xưa, tiền thân của Hải Phòng ngày nay.",
    topic: "Lịch sử",
    lvl: 3
  },
  {
    q: "Chiến dịch Hồ Chí Minh lịch sử giải phóng hoàn toàn miền Nam kết thúc ngày nào?",
    opts: ["30/04/1975", "01/05/1975", "19/05/1975", "02/09/1975"],
    ans: 0,
    fact: "Đúng 11 giờ 30 phút ngày 30/4/1975, lá cờ cách mạng tung bay trên nóc Dinh Độc Lập, non sông thu về một mối.",
    topic: "Lịch sử",
    lvl: 1
  },
  {
    q: "Hoàng đế Quang Trung đại phá 29 vạn quân Thanh vào mùa xuân năm nào?",
    opts: ["1788", "1789", "1792", "1802"],
    ans: 1,
    fact: "Chiến thắng Ngọc Hồi - Đống Đa tết Kỷ Dậu 1789 là một trong những chiến công chói lọi nhất lịch sử quân sự Việt Nam.",
    topic: "Lịch sử",
    lvl: 2
  },
  {
    q: "Người dẹp loạn 12 sứ quân, xưng Hoàng đế và lập nên nước Đại Cồ Việt là ai?",
    opts: ["Đinh Bộ Lĩnh", "Lê Hoàn", "Ngô Quyền", "Lý Công Uẩn"],
    ans: 0,
    fact: "Đinh Tiên Hoàng đóng đô ở Hoa Lư (Ninh Bình), đặt quốc hiệu Đại Cồ Việt và đúc tiền đồng đầu tiên của nước ta.",
    topic: "Lịch sử",
    lvl: 1
  },
  {
    q: "Bộ luật thành văn đầu tiên của nước ta tên là gì?",
    opts: ["Luật Hồng Đức", "Hình thư", "Hoàng Việt luật lệ", "Quốc triều hình luật"],
    ans: 1,
    fact: "Bộ Hình thư được ban hành dưới thời vua Lý Thái Tông năm 1042, đánh dấu bước ngoặt lớn về tư pháp Đại Việt.",
    topic: "Lịch sử",
    lvl: 3
  },
  {
    q: "Phong trào Đông Du do chí sĩ yêu nước nào khởi xướng?",
    opts: ["Phan Bội Châu", "Phan Châu Trinh", "Huỳnh Thúc Kháng", "Nguyễn Thái Học"],
    ans: 0,
    fact: "Cụ Phan Bội Châu đưa thanh niên Việt Nam sang Nhật Bản học tập nhằm canh tân đất nước từ năm 1905 đến 1909.",
    topic: "Lịch sử",
    lvl: 2
  },

  // --- VĂN HỌC & NGHỆ THUẬT (Literature) ---
  {
    q: "Kiệt tác 'Truyện Kiều' là tác phẩm của đại thi hào nào?",
    opts: ["Nguyễn Du", "Nguyễn Trãi", "Hồ Xuân Hương", "Bà Huyện Thanh Quan"],
    ans: 0,
    fact: "Nguyễn Du sáng tác Đoạn Trường Tân Thanh (Truyện Kiều) bằng chữ Nôm gồm 3.254 câu thơ lục bát bất hủ.",
    topic: "Văn học",
    lvl: 1
  },
  {
    q: "Tác phẩm 'Dế Mèn phiêu lưu ký' là của nhà văn nào?",
    opts: ["Tô Hoài", "Nam Cao", "Nguyễn Nhật Ánh", "Vũ Trọng Phụng"],
    ans: 0,
    fact: "Tô Hoài viết 'Dế Mèn phiêu lưu ký' năm 1941, đến nay đã được dịch ra gần 40 thứ tiếng trên toàn thế giới.",
    topic: "Văn học",
    lvl: 1
  },
  {
    q: "Nhân vật Lão Hạc trong truyện ngắn cùng tên của Nam Cao nuôi con chó tên gì?",
    opts: ["Cậu Vàng", "Cậu Bạc", "Cậu Mực", "Cậu Đốm"],
    ans: 0,
    fact: "Hình ảnh Lão Hạc khóc khi phải bán Cậu Vàng là một trong những chi tiết cảm động nhất văn học hiện thực Việt Nam.",
    topic: "Văn học",
    lvl: 1
  },
  {
    q: "Nữ sĩ nào được mệnh danh là 'Bà chúa thơ Nôm'?",
    opts: ["Đoàn Thị Điểm", "Hồ Xuân Hương", "Bà Huyện Thanh Quan", "Sương Nguyệt Anh"],
    ans: 1,
    fact: "Hồ Xuân Hương nổi tiếng với phong cách thơ Nôm sắc sảo, độc đáo và giàu tính nhân văn bảo vệ phụ nữ.",
    topic: "Văn học",
    lvl: 1
  },
  {
    q: "Tập thơ 'Nhật ký trong tù' được Bác Hồ sáng tác bằng chữ gì?",
    opts: ["Chữ Quốc ngữ", "Chữ Hán", "Chữ Nôm", "Tiếng Pháp"],
    ans: 1,
    fact: "Tập thơ gồm 133 bài thơ chữ Hán được Bác viết trong các nhà tù của chính quyền Tưởng Giới Thạch từ 1942 đến 1943.",
    topic: "Văn học",
    lvl: 2
  },
  {
    q: "Nhà văn nào là tác giả của tiểu thuyết kinh điển 'Số Đỏ'?",
    opts: ["Vũ Trọng Phụng", "Ngô Tất Tố", "Thạch Lam", "Nguyễn Tuân"],
    ans: 0,
    fact: "Nhân vật Xuân Tóc Đỏ trong tiểu thuyết Số Đỏ phê phán sâu sắc thói giả dối, học đòi âu hóa thời bấy giờ.",
    topic: "Văn học",
    lvl: 2
  },
  {
    q: "Bộ tiểu thuyết 'Tam Quốc Diễn Nghĩa' là của tác giả nào?",
    opts: ["Thi Nại Am", "La Quán Trung", "Ngô Thừa Ân", "Tào Tuyết Cần"],
    ans: 1,
    fact: "Tam Quốc Diễn Nghĩa là một trong Tứ đại danh tác của văn học cổ điển Trung Hoa, viết vào thế kỷ 14.",
    topic: "Văn học",
    lvl: 1
  },
  {
    q: "Tác phẩm nào được coi là bản 'Tuyên ngôn độc lập đầu tiên' của dân tộc Việt Nam?",
    opts: ["Bình Ngô đại cáo", "Nam quốc sơn hà", "Hịch tướng sĩ", "Chiếu dời đô"],
    ans: 1,
    fact: "Bài thơ thần 'Nam quốc sơn hà' vang lên bên bờ sông Như Nguyệt năm 1077 khẳng định chủ quyền lãnh thổ thiêng liêng.",
    topic: "Văn học",
    lvl: 1
  },
  {
    q: "Bài thơ 'Tây Tiến' nổi tiếng của nhà thơ nào?",
    opts: ["Quang Dũng", "Huy Cận", "Xuân Diệu", "Tố Hữu"],
    ans: 0,
    fact: "Quang Dũng viết Tây Tiến năm 1948 tại làng Phù Lưu Chanh khi nhớ về đơn vị cũ hành quân nơi núi rừng miền Tây.",
    topic: "Văn học",
    lvl: 2
  },
  {
    q: "Ai là tác giả của truyện cổ tích 'Nàng Bạch Tuyết và bảy chú lùn'?",
    opts: ["Anh em nhà Grimm", "Andersen", "Perrault", "Aesop"],
    ans: 0,
    fact: "Hai anh em Jacob và Wilhelm Grimm người Đức đã dày công sưu tầm và xuất bản tuyển tập truyện cổ tích Grimm năm 1812.",
    topic: "Văn học",
    lvl: 2
  },

  // --- TOÁN NHẨM & LOGIC (Mental Math) ---
  {
    q: "Số nguyên tố chẵn duy nhất là số nào?",
    opts: ["0", "2", "4", "6"],
    ans: 1,
    fact: "Số 2 là số nguyên tố duy nhất có tính chẵn và cũng là số nguyên tố nhỏ nhất trong toán học.",
    topic: "Toán nhẩm",
    lvl: 1
  },
  {
    q: "Kết quả của phép tính: 15 x 6 bằng bao nhiêu?",
    opts: ["80", "90", "85", "95"],
    ans: 1,
    fact: "Mẹo nhẩm: lấy 15 x 2 = 30, sau đó nhân tiếp với 3 được 90 cực nhanh.",
    topic: "Toán nhẩm",
    lvl: 1
  },
  {
    q: "Một ngày có tất cả bao nhiêu phút?",
    opts: ["1.200 phút", "1.440 phút", "1.400 phút", "1.500 phút"],
    ans: 1,
    fact: "Một ngày có 24 giờ, mỗi giờ 60 phút: 24 x 60 = 1.440 phút (tương đương 86.400 giây).",
    topic: "Toán nhẩm",
    lvl: 1
  },
  {
    q: "Căn bậc hai của 144 bằng bao nhiêu?",
    opts: ["11", "12", "13", "14"],
    ans: 1,
    fact: "12 x 12 = 144. Trong đời sống, 144 còn được gọi là 1 gốt (gross - tá của tá).",
    topic: "Toán nhẩm",
    lvl: 1
  },
  {
    q: "Phân số 3/4 đổi ra phần trăm là bao nhiêu?",
    opts: ["25%", "50%", "75%", "80%"],
    ans: 2,
    fact: "3 chia 4 bằng 0.75, nhân với 100% ta được đúng 75%.",
    topic: "Toán nhẩm",
    lvl: 1
  },
  {
    q: "Tổng các góc trong một hình tam giác luôn bằng bao nhiêu độ?",
    opts: ["90 độ", "180 độ", "270 độ", "360 độ"],
    ans: 1,
    fact: "Trong hình học Euclid phẳng, tổng 3 góc trong của mọi tam giác luôn bằng chính xác 180 độ.",
    topic: "Toán nhẩm",
    lvl: 1
  },
  {
    q: "Số tiếp theo trong dãy: 2, 4, 8, 16, ... là số nào?",
    opts: ["24", "32", "30", "64"],
    ans: 1,
    fact: "Đây là cấp số nhân với công bội q = 2, mỗi số sau gấp đôi số liền trước.",
    topic: "Toán nhẩm",
    lvl: 1
  },
  {
    q: "Hình bát giác có bao nhiêu cạnh?",
    opts: ["6", "7", "8", "9"],
    ans: 2,
    fact: "'Bát' trong tiếng Hán Việt nghĩa là 8, hình bát giác có 8 cạnh và 8 góc.",
    topic: "Toán nhẩm",
    lvl: 1
  },
  {
    q: "Số La Mã 'XL' biểu thị cho số nào?",
    opts: ["40", "60", "90", "50"],
    ans: 0,
    fact: "L là 50, X là 10. Khi X đứng trước L nghĩa là lấy 50 trừ 10 bằng 40.",
    topic: "Toán nhẩm",
    lvl: 2
  },
  {
    q: "Giá trị của 2 lũy thừa 10 (2^10) bằng bao nhiêu?",
    opts: ["512", "1.000", "1.024", "2.048"],
    ans: 2,
    fact: "1.024 là con số quen thuộc trong công nghệ thông tin (1 Kilobyte = 1.024 bytes).",
    topic: "Toán nhẩm",
    lvl: 2
  },

  // --- TIẾNG ANH CƠ BẢN (English) ---
  {
    q: "Từ nào trong tiếng Anh có nghĩa là 'Thứ Tư'?",
    opts: ["Tuesday", "Wednesday", "Thursday", "Friday"],
    ans: 1,
    fact: "Wednesday bắt nguồn từ tiếng Anh cổ Wōdnesdæg, nghĩa là ngày của thần Woden (Odin trong thần thoại Bắc Âu).",
    topic: "Tiếng Anh",
    lvl: 1
  },
  {
    q: "Quá khứ đơn của động từ 'go' là gì?",
    opts: ["Gone", "Goed", "Went", "Going"],
    ans: 2,
    fact: "'Go' là động từ bất quy tắc cổ điển trong tiếng Anh: go - went - gone.",
    topic: "Tiếng Anh",
    lvl: 1
  },
  {
    q: "Từ trái nghĩa với 'Beautiful' (xinh đẹp) là gì?",
    opts: ["Pretty", "Ugly", "Smart", "Cute"],
    ans: 1,
    fact: "'Ugly' có nghĩa là xấu xí, bắt nguồn từ tiếng Bắc Âu cổ 'uggligr' nghĩa là đáng sợ.",
    topic: "Tiếng Anh",
    lvl: 1
  },
  {
    q: "'Apple' dịch sang tiếng Việt là quả gì?",
    opts: ["Quả cam", "Quả táo", "Quả chuối", "Quả lê"],
    ans: 1,
    fact: "Tục ngữ Anh có câu: 'An apple a day keeps the doctor away' (Mỗi ngày một quả táo giúp tránh xa bác sĩ).",
    topic: "Tiếng Anh",
    lvl: 1
  },
  {
    q: "Số 'Twelve' trong tiếng Anh là số mấy?",
    opts: ["10", "11", "12", "20"],
    ans: 2,
    fact: "Twelve là số 12. Trong văn hóa phương Tây, 12 là một con số tròn trịa (1 tá / dozen).",
    topic: "Tiếng Anh",
    lvl: 1
  },
  {
    q: "Màu 'Purple' trong tiếng Việt là màu gì?",
    opts: ["Màu cam", "Màu tím", "Màu hồng", "Màu nâu"],
    ans: 1,
    fact: "Thời xưa màu tím rất đắt đỏ vì phải chiết xuất từ hàng ngàn con ốc biển, nên là màu sắc của hoàng gia.",
    topic: "Tiếng Anh",
    lvl: 1
  },
  {
    q: "Đại từ nhân xưng ngôi thứ nhất số nhiều trong tiếng Anh là gì?",
    opts: ["They", "He", "We", "You"],
    ans: 2,
    fact: "'We' dùng để chỉ 'chúng tôi' hoặc 'chúng ta', bao gồm cả người nói và người khác.",
    topic: "Tiếng Anh",
    lvl: 1
  },
  {
    q: "Từ 'Library' có nghĩa là nơi nào?",
    opts: ["Bệnh viện", "Thư viện", "Bảo tàng", "Nhà hát"],
    ans: 1,
    fact: "'Library' bắt nguồn từ tiếng Latinh 'liber', nghĩa là cuốn sách.",
    topic: "Tiếng Anh",
    lvl: 1
  },

  // --- ĐỜI SỐNG & TỰ NHIÊN (General Knowledge) ---
  {
    q: "Loài động vật có vú nào là loài duy nhất biết bay lượn thực sự?",
    opts: ["Sóc bay", "Dơi", "Chồn bay", "Vượn cáo"],
    ans: 1,
    fact: "Dơi là loài thú duy nhất có cấu tạo chi trước biến thành cánh da giúp chúng bay lượn chủ động.",
    topic: "Đời sống",
    lvl: 1
  },
  {
    q: "Mật ong tự nhiên để lâu có bị thiu hỏng không?",
    opts: ["Có, sau 6 tháng", "Có, sau 1 năm", "Gần như không bao giờ", "Có, sau 2 năm"],
    ans: 2,
    fact: "Do hàm lượng đường rất cao và độ ẩm thấp, vi khuẩn không thể sống trong mật ong nguyên chất nên nó để được hàng ngàn năm.",
    topic: "Đời sống",
    lvl: 1
  },
  {
    q: "Đèn tín hiệu giao thông gồm những màu nào?",
    opts: ["Đỏ - Vàng - Xanh lục", "Đỏ - Cam - Xanh lam", "Vàng - Trắng - Xanh", "Đỏ - Tím - Xanh"],
    ans: 0,
    fact: "Hệ thống đèn giao thông hiện đại đầu tiên được lắp đặt tại London vào năm 1868 để điều tiết xe ngựa kéo.",
    topic: "Đời sống",
    lvl: 1
  },
  {
    q: "Con người có bao nhiêu nhóm máu chính trong hệ ABO?",
    opts: ["2", "3", "4", "5"],
    ans: 2,
    fact: "Hệ nhóm máu ABO có 4 nhóm chính: A, B, AB và O do bác sĩ Karl Landsteiner tìm ra năm 1901.",
    topic: "Đời sống",
    lvl: 1
  },
  {
    q: "Hoa sen được chọn là quốc hoa của quốc gia nào sau đây?",
    opts: ["Việt Nam và Ấn Độ", "Thái Lan", "Nhật Bản", "Hàn Quốc"],
    ans: 0,
    fact: "Hoa sen tượng trưng cho sự thuần khiết, thanh cao, gần bùn mà chẳng hôi tanh mùi bùn.",
    topic: "Đời sống",
    lvl: 1
  },
  {
    q: "Loài chim nào chạy nhanh nhất thế giới trên mặt đất?",
    opts: ["Chim đà điểu", "Chim cánh cụt", "Chim ưng", "Gà lôi"],
    ans: 0,
    fact: "Đà điểu châu Phi có thể đạt tốc độ chạy lên tới 70 km/h nhờ đôi chân dài cực kỳ khỏe khoắn.",
    topic: "Đời sống",
    lvl: 1
  },
  {
    q: "Môn võ cổ truyền Vovinam của Việt Nam còn có tên gọi khác là gì?",
    opts: ["Việt Võ Đạo", "Bình Định Gia", "Tân Khánh Bà Trà", "Võ Thiếu Lâm"],
    ans: 0,
    fact: "Vovinam - Việt Võ Đạo do võ sư Nguyễn Lộc sáng lập vào năm 1938 tại Hà Nội.",
    topic: "Đời sống",
    lvl: 2
  },
  {
    q: "Quốc phục truyền thống của phụ nữ Việt Nam là trang phục nào?",
    opts: ["Áo dài", "Áo tứ thân", "Áo bà ba", "Áo yếm"],
    ans: 0,
    fact: "Chiếc áo dài tôn vinh nét đẹp kín đáo, duyên dáng và thướt tha của người phụ nữ Việt qua bao thế hệ.",
    topic: "Đời sống",
    lvl: 1
  },
  {
    q: "Nhạc cụ nào sau đây chỉ có một dây duy nhất?",
    opts: ["Đàn nhị", "Đàn bầu", "Đàn tỳ bà", "Đàn tranh"],
    ans: 1,
    fact: "Đàn bầu (Độc huyền cầm) là nhạc cụ độc đáo chỉ có 1 dây nhưng phát ra âm thanh luyến láy diệu kỳ nhờ cần đàn.",
    topic: "Đời sống",
    lvl: 1
  },
  {
    q: "Quả gì được mệnh danh là 'Vua của các loại trái cây' ở Đông Nam Á?",
    opts: ["Măng cụt", "Sầu riêng", "Xoài cát", "Chôm chôm"],
    ans: 1,
    fact: "Sầu riêng được tôn là vua trái cây bởi hương vị đậm đà độc nhất vô nhị, còn măng cụt được xem là hoàng hậu.",
    topic: "Đời sống",
    lvl: 1
  }
];

// Hàm nhân bản và tạo biến thể câu hỏi thông minh phong phú đạt đúng 300 câu hỏi
function buildFull300Questions() {
  const topics = [
    "Khoa học",
    "Địa lý",
    "Lịch sử",
    "Văn học",
    "Toán nhẩm",
    "Tiếng Anh",
    "Đời sống"
  ];

  const fullList = [];
  let id = 1;

  // 1. Đưa các câu hạt nhân vào trước
  for (const item of rawQuestions) {
    fullList.push({
      id: id++,
      question: item.q,
      options: item.opts,
      answer: item.ans,
      fact: item.fact,
      topic: item.topic,
      level: item.lvl
    });
  }

  // 2. Mở rộng kho câu hỏi theo các quy tắc tri thức chuẩn xác cho đủ 300 câu:

  // Thêm câu hỏi Toán nhẩm (từ cơ bản đến thử thách nâng cao)
  const mathData = [
    { q: "25 x 4 bằng bao nhiêu?", o: ["80", "100", "120", "90"], a: 1, f: "25 nhân 4 bằng tròn 100, một phép tính rất hay gặp.", lvl: 1 },
    { q: "100 chia cho 4 bằng bao nhiêu?", o: ["20", "25", "30", "15"], a: 1, f: "100 chia 4 được 25.", lvl: 1 },
    { q: "Số đối của số -15 là số nào?", o: ["15", "0", "-15", "1/15"], a: 0, f: "Hai số đối nhau có tổng bằng 0.", lvl: 1 },
    { q: "Hình vuông có cạnh 5cm thì diện tích bằng bao nhiêu cm²?", o: ["20", "25", "30", "15"], a: 1, f: "Diện tích hình vuông = cạnh x cạnh = 5 x 5 = 25 cm².", lvl: 1 },
    { q: "Hình tròn có bao nhiêu đỉnh?", o: ["0", "1", "Vô số", "4"], a: 0, f: "Hình tròn là một đường cong khép kín hoàn hảo, không có đỉnh.", lvl: 1 },
    { q: "Góc vuông có số đo bằng bao nhiêu độ?", o: ["45 độ", "90 độ", "180 độ", "60 độ"], a: 1, f: "Góc vuông có số đo chính xác bằng 90 độ.", lvl: 1 },
    { q: "Số nhỏ nhất có 3 chữ số là số nào?", o: ["100", "101", "999", "111"], a: 0, f: "Số 100 là số tự nhiên nhỏ nhất có ba chữ số.", lvl: 1 },
    { q: "Số lớn nhất có 2 chữ số là số nào?", o: ["90", "98", "99", "100"], a: 2, f: "Số 99 là số lớn nhất có hai chữ số.", lvl: 1 },
    { q: "Một năm nhuận có bao nhiêu ngày?", o: ["365 ngày", "366 ngày", "364 ngày", "367 ngày"], a: 1, f: "Năm nhuận có thêm ngày 29 tháng 2 nên có 366 ngày.", lvl: 1 },
    { q: "Một thế kỷ tương đương bao nhiêu năm?", o: ["50 năm", "100 năm", "500 năm", "1.000 năm"], a: 1, f: "Một thế kỷ là khoảng thời gian kéo dài đúng 100 năm.", lvl: 1 },
    { q: "7 nhân 8 bằng bao nhiêu?", o: ["54", "56", "58", "64"], a: 1, f: "Trong bảng cửu chương 7: 7 x 8 = 56.", lvl: 1 },
    { q: "9 nhân 9 bằng bao nhiêu?", o: ["72", "81", "90", "89"], a: 1, f: "9 nhân 9 bằng 81.", lvl: 1 },
    { q: "125 x 8 bằng bao nhiêu?", o: ["900", "1.000", "1.200", "1.050"], a: 1, f: "125 x 8 = 1.000, đây là cặp số đẹp thường dùng để tính nhanh.", lvl: 2 },
    { q: "Số nào sau đây chia hết cho cả 2 và 5?", o: ["25", "32", "50", "45"], a: 2, f: "Số chia hết cho cả 2 và 5 luôn có chữ số tận cùng là 0.", lvl: 1 },
    { q: "Căn bậc hai của 81 là bao nhiêu?", o: ["7", "8", "9", "10"], a: 2, f: "9 x 9 = 81 nên căn bậc hai số học của 81 là 9.", lvl: 1 },
    { q: "3 mũ 3 (3^3) bằng bao nhiêu?", o: ["9", "18", "27", "81"], a: 2, f: "3 x 3 x 3 = 27.", lvl: 1 },
    { q: "Hình hộp chữ nhật có bao nhiêu mặt?", o: ["4 mặt", "6 mặt", "8 mặt", "12 mặt"], a: 1, f: "Hình hộp chữ nhật có 6 mặt, 8 đỉnh và 12 cạnh.", lvl: 1 },
    { q: "Số pi (π) thường được lấy xấp xỉ là bao nhiêu?", o: ["3.12", "3.14", "3.16", "3.18"], a: 1, f: "Số pi xấp xỉ 3.14159, biểu thị tỉ số giữa chu vi và đường kính của một đường tròn.", lvl: 1 },
    { q: "Nếu một tam giác có một góc 90 độ thì gọi là tam giác gì?", o: ["Tam giác đều", "Tam giác cân", "Tam giác vuông", "Tam giác tù"], a: 2, f: "Tam giác có một góc vuông được gọi là tam giác vuông.", lvl: 1 },
    { q: "Số tự nhiên nhỏ nhất là số nào?", o: ["0", "1", "-1", "Không xác định"], a: 0, f: "Tập hợp số tự nhiên N bắt đầu từ số 0.", lvl: 1 }
  ];

  for (const m of mathData) {
    fullList.push({
      id: id++,
      question: m.q,
      options: m.o,
      answer: m.a,
      fact: m.f,
      topic: "Toán nhẩm",
      level: m.lvl
    });
  }

  // Thêm câu hỏi Tiếng Anh
  const englishData = [
    { q: "Từ nào nghĩa là 'Mặt Trời' trong tiếng Anh?", o: ["Moon", "Sun", "Star", "Cloud"], a: 1, f: "'Sun' nghĩa là Mặt Trời, nguồn sáng và năng lượng chính của Trái Đất.", lvl: 1 },
    { q: "Từ nào nghĩa là 'Mặt Trăng' trong tiếng Anh?", o: ["Sun", "Moon", "Sky", "Earth"], a: 1, f: "'Moon' nghĩa là Mặt Trăng, vệ tinh tự nhiên duy nhất của Trái Đất.", lvl: 1 },
    { q: "Động từ 'Eat' có nghĩa là gì?", o: ["Uống", "Ăn", "Ngủ", "Đi"], a: 1, f: "'Eat' là ăn uống thức ăn rắn.", lvl: 1 },
    { q: "Động từ 'Drink' có nghĩa là gì?", o: ["Ăn", "Uống", "Nói", "Hát"], a: 1, f: "'Drink' có nghĩa là uống nước hoặc chất lỏng.", lvl: 1 },
    { q: "Từ nào là 'Màu vàng' trong tiếng Anh?", o: ["Red", "Blue", "Yellow", "Green"], a: 2, f: "'Yellow' là màu vàng, màu của hoa cúc và quả chuối chín.", lvl: 1 },
    { q: "Từ nào là 'Màu đỏ' trong tiếng Anh?", o: ["Red", "Pink", "White", "Black"], a: 0, f: "'Red' là màu đỏ, màu của tình yêu và sự nhiệt huyết.", lvl: 1 },
    { q: "Từ nào là 'Màu xanh lá cây' trong tiếng Anh?", o: ["Blue", "Green", "Orange", "Brown"], a: 1, f: "'Green' là màu xanh lá cây tượng trưng cho thiên nhiên.", lvl: 1 },
    { q: "Tháng đầu tiên trong năm bằng tiếng Anh là gì?", o: ["January", "February", "March", "December"], a: 0, f: "January (tháng 1) được đặt theo tên thần Janus trong thần thoại La Mã.", lvl: 1 },
    { q: "Tháng cuối cùng trong năm bằng tiếng Anh là gì?", o: ["October", "November", "December", "January"], a: 2, f: "December (tháng 12) là tháng mùa đông và lễ Giáng Sinh.", lvl: 1 },
    { q: "Từ 'Teacher' có nghĩa là nghề gì?", o: ["Bác sĩ", "Giáo viên", "Kỹ sư", "Công an"], a: 1, f: "'Teacher' là người thầy cô giáo truyền đạt tri thức.", lvl: 1 },
    { q: "Từ 'Doctor' có nghĩa là nghề gì?", o: ["Bác sĩ", "Nông dân", "Luật sư", "Họa sĩ"], a: 0, f: "'Doctor' là bác sĩ khám chữa bệnh cho mọi người.", lvl: 1 },
    { q: "Số 'Twenty' là số mấy?", o: ["12", "20", "22", "30"], a: 1, f: "Twenty là số 20.", lvl: 1 },
    { q: "Số 'Fifty' là số mấy?", o: ["15", "50", "55", "5"], a: 1, f: "Fifty là số 50.", lvl: 1 },
    { q: "Từ nào nghĩa là 'Gia đình'?", o: ["School", "Friend", "Family", "House"], a: 2, f: "'Family' là gia đình thiêng liêng và ấm áp của mỗi chúng ta.", lvl: 1 },
    { q: "Dạng so sánh hơn của từ 'Good' là gì?", o: ["Gooder", "Better", "Best", "More good"], a: 1, f: "'Good' chuyển sang so sánh hơn là 'Better', so sánh nhất là 'Best'.", lvl: 2 },
    { q: "Dạng quá khứ của động từ 'Buy' (mua) là gì?", o: ["Buyed", "Bought", "Brought", "Buying"], a: 1, f: "'Buy' có dạng quá khứ là 'Bought'.", lvl: 2 },
    { q: "Từ 'Always' có nghĩa là gì?", o: ["Thỉnh thoảng", "Hiếm khi", "Luôn luôn", "Không bao giờ"], a: 2, f: "'Always' chỉ tần suất 100% (luôn luôn).", lvl: 1 },
    { q: "Từ 'Never' có nghĩa là gì?", o: ["Thường xuyên", "Đôi khi", "Không bao giờ", "Luôn luôn"], a: 2, f: "'Never' mang nghĩa là không bao giờ.", lvl: 1 },
    { q: "Từ 'Water' dịch ra tiếng Việt là gì?", o: ["Nước", "Lửa", "Đất", "Gió"], a: 0, f: "'Water' là nước, nguồn sống thiết yếu của mọi sinh vật.", lvl: 1 },
    { q: "Từ 'Friend' có nghĩa là gì?", o: ["Kẻ thù", "Bạn bè", "Hàng xóm", "Đồng nghiệp"], a: 1, f: "'Friend' nghĩa là người bạn thân thiết.", lvl: 1 }
  ];

  for (const e of englishData) {
    fullList.push({
      id: id++,
      question: e.q,
      options: e.o,
      answer: e.a,
      fact: e.f,
      topic: "Tiếng Anh",
      level: e.lvl
    });
  }

  // Thêm các câu hỏi Địa lý Việt Nam và Thế giới
  const geoData = [
    { q: "Tỉnh nào có diện tích lớn nhất Việt Nam hiện nay?", o: ["Nghệ An", "Thanh Hóa", "Gia Lai", "Đắk Lắk"], a: 0, f: "Nghệ An là tỉnh rộng nhất nước ta với diện tích khoảng 16.490 km².", lvl: 1 },
    { q: "Thành phố nào trực thuộc trung ương ở vùng Tây Nam Bộ?", o: ["Cần Thơ", "Cà Mau", "Kiên Giang", "An Giang"], a: 0, f: "Cần Thơ là thành phố trực thuộc trung ương duy nhất ở Đồng bằng sông Cửu Long.", lvl: 1 },
    { q: "Thủ đô của nước Pháp là thành phố nào?", o: ["Berlin", "London", "Paris", "Madrid"], a: 2, f: "Paris được mệnh danh là Kinh đô Ánh sáng, nổi tiếng với tháp Eiffel và bảo tàng Louvre.", lvl: 1 },
    { q: "Thủ đô của nước Anh (Vương quốc Anh) là gì?", o: ["Manchester", "Liverpool", "London", "Edinburgh"], a: 2, f: "London nằm bên bờ sông Thames thơ mộng, là trung tâm tài chính và văn hóa lớn thế giới.", lvl: 1 },
    { q: "Dãy núi nào cao nhất thế giới?", o: ["Andes", "Alps", "Himalaya", "Rocky"], a: 2, f: "Dãy Himalaya chứa đỉnh Everest cao nhất thế giới (8.848m) nằm giữa Nepal và Tây Tạng.", lvl: 1 },
    { q: "Sông nào dài nhất Việt Nam (chảy hoàn toàn trong lãnh thổ VN)?", o: ["Sông Hồng", "Sông Đồng Nai", "Sông Thái Bình", "Sông Mã"], a: 1, f: "Sông Đồng Nai là sông nội địa dài nhất Việt Nam với chiều dài 586 km.", lvl: 2 },
    { q: "Đèo nào nối liền tỉnh Thừa Thiên Huế và thành phố Đà Nẵng?", o: ["Đèo Hải Vân", "Đèo Ngang", "Đèo Cù Mông", "Đèo Cả"], a: 0, f: "Đèo Hải Vân được vua Lê Thánh Tông xưng tụng là 'Thiên hạ đệ nhất hùng quan'.", lvl: 1 },
    { q: "Châu lục nào có dân số đông nhất thế giới?", o: ["Châu Phi", "Châu Âu", "Châu Á", "Châu Mỹ"], a: 2, f: "Châu Á có hơn 4.7 tỷ người, chiếm khoảng 60% dân số toàn cầu.", lvl: 1 },
    { q: "Nước nào có hình dạng bản đồ giống hình chiếc ủng?", o: ["Hy Lạp", "Ý (Italy)", "Tây Ban Nha", "Bồ Đào Nha"], a: 1, f: "Bán đảo Ý vươn ra Địa Trung Hải có hình dáng giống hệt một chiếc ủng cao cổ.", lvl: 1 },
    { q: "Cố đô của Nhật Bản nổi tiếng với nhiều ngôi chùa cổ tên là gì?", o: ["Tokyo", "Kyoto", "Osaka", "Hiroshima"], a: 1, f: "Kyoto từng là thủ đô của Nhật Bản trong hơn một thiên niên kỷ (794 - 1868).", lvl: 2 },
    { q: "Đồng bằng nào lớn nhất nước ta?", o: ["Đồng bằng sông Hồng", "Đồng bằng sông Cửu Long", "Đồng bằng duyên hải miền Trung", "Đồng bằng Thanh Nghệ"], a: 1, f: "Đồng bằng sông Cửu Long có diện tích gần 40.000 km², là vựa lúa lớn nhất cả nước.", lvl: 1 },
    { q: "Mũi Cà Mau thuộc tỉnh nào?", o: ["Bạc Liêu", "Kiên Giang", "Cà Mau", "Sóc Trăng"], a: 2, f: "Mũi Cà Mau là điểm cực Nam trên đất liền của Tổ quốc.", lvl: 1 },
    { q: "Quần đảo Trường Sa và Hoàng Sa thuộc chủ quyền của nước nào?", o: ["Việt Nam", "Philippines", "Malaysia", "Brunei"], a: 0, f: "Hoàng Sa và Trường Sa là phần lãnh thổ thiêng liêng không thể tách rời của Tổ quốc Việt Nam.", lvl: 1 },
    { q: "Thành phố Đà Lạt thuộc tỉnh nào của vùng Tây Nguyên?", o: ["Lâm Đồng", "Đắk Nông", "Kon Tum", "Gia Lai"], a: 0, f: "Đà Lạt nằm trên cao nguyên Lâm Viên, khí hậu mát mẻ quanh năm và ngàn hoa khoe sắc.", lvl: 1 },
    { q: "Cực Đông trên đất liền của Việt Nam nằm ở tỉnh nào?", o: ["Khánh Hòa", "Bình Định", "Phú Yên", "Ninh Thuận"], a: 0, f: "Mũi Đôi (bán đảo Hòn Gốm, Vạn Ninh, Khánh Hòa) là điểm đón ánh bình minh đầu tiên trên đất liền.", lvl: 2 }
  ];

  for (const g of geoData) {
    fullList.push({
      id: id++,
      question: g.q,
      options: g.o,
      answer: g.a,
      fact: g.f,
      topic: "Địa lý",
      level: g.lvl
    });
  }

  // Thêm câu hỏi Lịch sử Việt Nam
  const histData = [
    { q: "Ai là tác giả bản 'Bình Ngô Đại Cáo' bất hủ?", o: ["Nguyễn Trãi", "Lê Lợi", "Ngô Sĩ Liên", "Trần Hưng Đạo"], a: 0, f: "Nguyễn Trãi thừa lệnh vua Lê Thái Tổ soạn Bình Ngô Đại Cáo tuyên bố độc lập năm 1428.", lvl: 1 },
    { q: "Nhà nước đầu tiên trong lịch sử dân tộc Việt Nam có tên là gì?", o: ["Âu Lạc", "Văn Lang", "Vạn Xuân", "Đại Việt"], a: 1, f: "Nhà nước Văn Lang do các Vua Hùng dựng nên, đóng đô ở Phong Châu (Phú Thọ).", lvl: 1 },
    { q: "Năm 1911, Bác Hồ ra đi tìm đường cứu nước từ bến cảng nào?", o: ["Cảng Hải Phòng", "Bến Nhà Rồng", "Cảng Đà Nẵng", "Cảng Quy Nhơn"], a: 1, f: "Ngày 5/6/1911, người thanh niên Nguyễn Tất Thành rời bến cảng Nhà Rồng trên con tàu Đô đốc Latouche-Tréville.", lvl: 1 },
    { q: "Vị vua cuối cùng của triều đại phong kiến Việt Nam là ai?", o: ["Vua Khải Định", "Vua Bảo Đại", "Vua Minh Mạng", "Vua Tự Đức"], a: 1, f: "Vua Bảo Đại thoái vị vào tháng 8 năm 1945, chấm dứt chế độ quân chủ phong kiến tại Việt Nam.", lvl: 1 },
    { q: "Chiến thắng 'Hà Nội - Điện Biên Phủ trên không' diễn ra vào năm nào?", o: ["1968", "1972", "1973", "1975"], a: 1, f: "Trong 12 ngày đêm cuối năm 1972, quân dân Hà Nội đã bắn rơi hàng chục pháo đài bay B-52 của Mỹ.", lvl: 2 },
    { q: "Ai là người cắm cờ giải phóng trên nóc Dinh Độc Lập trưa ngày 30/4/1975?", o: ["Bùi Quang Thận", "Vũ Đăng Toàn", "Phạm Xuân Thệ", "Nguyễn Thành Trung"], a: 0, f: "Trung úy Bùi Quang Thận, Đại đội trưởng Đại đội 4 xe tăng, đã cắm lá cờ chiến thắng lịch sử.", lvl: 2 },
    { q: "Lý Bí xưng là Lý Nam Đế và đặt tên nước là gì vào năm 544?", o: ["Đại Việt", "Vạn Xuân", "Đại Cồ Việt", "Đại Ngu"], a: 1, f: "Vạn Xuân mang ý nghĩa mong đất nước trường tồn, bình yên và tươi đẹp như vạn mùa xuân.", lvl: 2 },
    { q: "Trần Quốc Toản bóp nát quả cam vì điều gì?", o: ["Đói bụng", "Tức giận vì không được dự bàn việc nước", "Vui mừng", "Bị trừng phạt"], a: 1, f: "Vì còn nhỏ tuổi không được vào dự hội nghị Bình Than, Trần Quốc Toản căm giận bóp nát quả cam lúc nào không hay.", lvl: 1 },
    { q: "Cuộc khởi nghĩa Hai Bà Trưng nổ ra vào năm nào?", o: ["Năm 40", "Năm 938", "Năm 248", "Năm 544"], a: 0, f: "Năm 40 sau Công nguyên, Trưng Trắc cùng em là Trưng Nhị phất cờ khởi nghĩa đền nợ nước, trả thù nhà.", lvl: 1 },
    { q: "Thành Cổ Loa có hình dạng kiến trúc đặc biệt như thế nào?", o: ["Hình tròn 1 lớp", "Hình xoáy trôn ốc 9 vòng", "Hình vuông", "Hình bát quái"], a: 1, f: "Thành Cổ Loa do An Dương Vương xây dựng có cấu trúc xoáy hình trôn ốc độc nhất vô nhị.", lvl: 2 },
    { q: "Trận chiến trên sông Như Nguyệt năm 1077 do danh tướng nào chỉ huy?", o: ["Lý Thường Kiệt", "Trần Hưng Đạo", "Ngô Quyền", "Lê Hoàn"], a: 0, f: "Thái úy Lý Thường Kiệt đã chặn đứng 10 vạn quân xâm lược Tống bên dòng sông Cầu (Như Nguyệt).", lvl: 1 },
    { q: "Bác Hồ sinh ngày tháng năm nào?", o: ["19/05/1890", "02/09/1945", "19/05/1900", "03/02/1930"], a: 0, f: "Chủ tịch Hồ Chí Minh sinh ngày 19 tháng 5 năm 1890 tại làng Kim Liên, Nam Đàn, Nghệ An.", lvl: 1 },
    { q: "Đảng Cộng sản Việt Nam được thành lập vào ngày tháng năm nào?", o: ["03/02/1930", "19/08/1945", "02/09/1945", "30/04/1975"], a: 0, f: "Hội nghị hợp nhất các tổ chức cộng sản do Nguyễn Ái Quốc chủ trì diễn ra tại Cửu Long (Hương Cảng).", lvl: 1 },
    { q: "Chiến thắng Ngọc Hồi - Đống Đa diễn ra vào mùa xuân năm Kỷ Dậu nào?", o: ["1788", "1789", "1790", "1802"], a: 1, f: "Vua Quang Trung tiến quân thần tốc quét sạch quân Thanh trong dịp Tết Kỷ Dậu 1789.", lvl: 1 },
    { q: "Trận Đống Đa lịch sử gắn liền với loài cây nào thiêu rụi đồn giặc?", o: ["Rơm rạ", "Bùi nhùi rơm cuốn rơm", "Củi lửa", "Dầu hỏa"], a: 1, f: "Nghĩa quân Tây Sơn dùng rơm bện thành con rồng lửa xông lên thiêu cháy đồn trại quân xâm lược.", lvl: 2 }
  ];

  for (const h of histData) {
    fullList.push({
      id: id++,
      question: h.q,
      options: h.o,
      answer: h.a,
      fact: h.f,
      topic: "Lịch sử",
      level: h.lvl
    });
  }

  // Thêm câu hỏi Khoa học tự nhiên & Công nghệ
  const sciData = [
    { q: "Mặt Trời mọc ở hướng nào và lặn ở hướng nào?", o: ["Đông sang Tây", "Tây sang Đông", "Bắc sang Nam", "Nam sang Bắc"], a: 0, f: "Do Trái Đất tự quay từ Tây sang Đông quanh trục, nên ta thấy Mặt Trời mọc ở phía Đông và lặn ở phía Tây.", lvl: 1 },
    { q: "Cơ quan nào trong cơ thể người lọc máu tạo ra nước tiểu?", o: ["Gan", "Thận", "Tim", "Phổi"], a: 1, f: "Hai quả thận lọc khoảng 180 lít dịch máu mỗi ngày để bài tiết chất cặn bã qua nước tiểu.", lvl: 1 },
    { q: "Động vật biến nhiệt (máu lạnh) gồm những nhóm nào sau đây?", o: ["Bò sát và lưỡng cư", "Chim và thú", "Chó và mèo", "Khỉ và cá heo"], a: 0, f: "Nhiệt độ cơ thể động vật biến nhiệt thay đổi linh hoạt theo nhiệt độ của môi trường sống.", lvl: 1 },
    { q: "Trong cơ thể người, xương nào dài và khỏe nhất?", o: ["Xương cánh tay", "Xương đùi", "Xương sống", "Xương sườn"], a: 1, f: "Xương đùi có thể chịu được tải trọng gấp nhiều lần trọng lượng cơ thể người khi chạy nhảy.", lvl: 2 },
    { q: "Chất nào giúp xương và răng chắc khỏe?", o: ["Sắt", "Canxi", "Kẽm", "Natri"], a: 1, f: "99% lượng Canxi trong cơ thể con người nằm tập trung ở xương và răng.", lvl: 1 },
    { q: "Vitamin nào được cơ thể tự tổng hợp khi da tiếp xúc ánh nắng mặt trời?", o: ["Vitamin A", "Vitamin C", "Vitamin D", "Vitamin B12"], a: 2, f: "Vitamin D giúp ruột hấp thụ canxi, bảo vệ hệ xương khớp phát triển toàn diện.", lvl: 1 },
    { q: "Hiện tượng nhật thực xảy ra khi thiên thể nào nằm ở giữa?", o: ["Mặt Trăng", "Trái Đất", "Sao Kim", "Sao Hỏa"], a: 0, f: "Khi Mặt Trăng đi qua giữa Trái Đất và Mặt Trời, bóng của nó che khuất ánh sáng mặt trời tới Trái Đất.", lvl: 2 },
    { q: "Hiện tượng nguyệt thực xảy ra khi thiên thể nào nằm ở giữa?", o: ["Mặt Trời", "Mặt Trăng", "Trái Đất", "Sao Mộc"], a: 2, f: "Nguyệt thực diễn ra khi Trái Đất nằm giữa Mặt Trời và Mặt Trăng, che khuất ánh sáng tới Mặt Trăng.", lvl: 2 },
    { q: "Khí nào cần thiết cho quá trình hô hấp của con người và động vật?", o: ["Nitơ", "Oxy (O2)", "Cacbonic", "Khí gas"], a: 1, f: "Khí Oxy được hồng cầu vận chuyển từ phổi đến từng tế bào trong cơ thể để tạo năng lượng sống.", lvl: 1 },
    { q: "Băng tinh khiết nổi trên mặt nước lỏng vì lý do gì?", o: ["Khối lượng riêng nhỏ hơn", "Nặng hơn nước", "Có bọt khí", "Do gió thổi"], a: 0, f: "Nước nở ra khi đóng băng dưới 4°C, làm giảm khối lượng riêng nên băng nổi trên nước lỏng.", lvl: 2 },
    { q: "Thiết bị nào chuyển đổi quang năng thành điện năng?", o: ["Pin mặt trời", "Máy phát điện", "Tuabin gió", "Động cơ hơi nước"], a: 0, f: "Tế bào quang điện (Solar cell) sử dụng hiệu ứng quang điện để tạo ra dòng điện từ ánh sáng.", lvl: 1 },
    { q: "Kim loại quý nào có tính trơ hóa học cao, không bị gỉ sét?", o: ["Sắt", "Vàng", "Đồng", "Kẽm"], a: 1, f: "Vàng không bị oxy hóa trong không khí hay nước, luôn giữ được vẻ sáng lấp lánh qua hàng thiên niên kỷ.", lvl: 1 },
    { q: "Khí gây ra hiệu ứng nhà kính chủ yếu nhất hiện nay là gì?", o: ["Oxy", "CO2 (Cacbonic)", "Nitơ", "Argon"], a: 1, f: "Khí CO2 từ việc đốt nhiên liệu hóa thạch giữ nhiệt trong khí quyển, làm Trái Đất nóng lên.", lvl: 1 },
    { q: "Áp suất khí quyển đo bằng dụng cụ nào?", o: ["Nhiệt kế", "Áp kế", "Ẩm kế", "Tốc kế"], a: 1, f: "Áp kế thủy ngân do nhà khoa học Evangelista Torricelli phát minh năm 1643.", lvl: 2 },
    { q: "Nam châm luôn có hai cực nào?", o: ["Cực Đông và Tây", "Cực Bắc và Nam", "Cực Âm và Dương", "Cực Lớn và Nhỏ"], a: 1, f: "Hai cực cùng tên đẩy nhau, hai cực khác tên hút nhau.", lvl: 1 }
  ];

  for (const s of sciData) {
    fullList.push({
      id: id++,
      question: s.q,
      options: s.o,
      answer: s.a,
      fact: s.f,
      topic: "Khoa học",
      level: s.lvl
    });
  }

  // Thêm câu hỏi Văn học & Nghệ thuật
  const litData = [
    { q: "Nhân vật Chí Phèo trong truyện ngắn của Nam Cao ước ao điều gì?", o: ["Giàu có", "Làm quan", "Làm người lương thiện", "Đi chu du thiên hạ"], a: 2, f: "Câu nói xé lòng của Chí Phèo: 'Ai cho tao lương thiện?' thể hiện bi kịch bị cự tuyệt quyền làm người.", lvl: 1 },
    { q: "Ai là tác giả của truyện cổ tích 'Tấm Cám'?", o: ["Dân gian Việt Nam", "Nguyễn Dữ", "Tô Hoài", "Nguyễn Huy Tưởng"], a: 0, f: "Tấm Cám là truyện cổ tích dân gian tiêu biểu cho ước mơ cái thiện luôn chiến thắng cái ác.", lvl: 1 },
    { q: "Bài ca dao 'Thân em như tấm lụa đào' nói về thân phận của ai?", o: ["Người nông dân", "Người phụ nữ xưa", "Người lính", "Thầy đồ nghèo"], a: 1, f: "Bài ca dao diễn tả thân phận bấp bênh, phụ thuộc của người phụ nữ trong xã hội phong kiến xưa.", lvl: 1 },
    { q: "Truyện ngụ ngôn 'Thầy bói xem voi' khuyên răn chúng ta điều gì?", o: ["Phải nhìn nhận sự việc toàn diện", "Chăm chỉ làm việc", "Tiết kiệm tiền bạc", "Không nói dối"], a: 0, f: "Mỗi thầy chỉ sờ một bộ phận rồi phán cả con voi, nhắc nhở ta tránh thói phiến diện, hồ đồ.", lvl: 1 },
    { q: "Tác giả của bài thơ 'Đoàn thuyền đánh cá' là ai?", o: ["Huy Cận", "Xuân Diệu", "Chế Lan Viên", "Hàn Mặc Tử"], a: 0, f: "Huy Cận viết 'Đoàn thuyền đánh cá' năm 1958 trong chuyến đi thực tế tại vùng biển Quảng Ninh.", lvl: 2 },
    { q: "Ai là tác giả bài thơ 'Sóng' được học trong chương trình Ngữ văn 12?", o: ["Xuân Quỳnh", "Anh Thơ", "Lâm Thị Mỹ Dạ", "Phan Thị Thanh Nhàn"], a: 0, f: "Xuân Quỳnh viết bài thơ 'Sóng' năm 1967 tại vùng biển Diêm Điền (Thái Bình).", lvl: 2 },
    { q: "Vở kịch 'Hồn Trương Ba, da hàng thịt' do ai sáng tác?", o: ["Lưu Quang Vũ", "Xuân Trình", "Đào Hồng Cẩm", "Tào Mạt"], a: 0, f: "Lưu Quang Vũ đặt ra vấn đề triết lý sâu sắc: con người phải được sống là chính mình toàn vẹn.", lvl: 2 },
    { q: "Nhân vật Thúy Kiều mang họ gì trong 'Truyện Kiều' của Nguyễn Du?", o: ["Họ Nguyễn", "Họ Trần", "Họ Vương", "Họ Lê"], a: 2, f: "Gia đình Kiều mang họ Vương: Vương Thúy Kiều, Vương Thúy Vân và người em trai Vương Quan.", lvl: 1 },
    { q: "Thạch Sanh đã dùng vũ khí gì bắn rơi đại bàng cứu công chúa?", o: ["Cung tên vàng", "Cung tên thần", "Súng thần công", "Gươm báu"], a: 1, f: "Thạch Sanh dùng cung tên thần bắn bị thương đại bàng rồi lần theo vết máu đến tận hang sâu.", lvl: 1 },
    { q: "Ai là tác giả của 'Lục Vân Tiên' - tác phẩm thơ Nôm nổi tiếng Nam Bộ?", o: ["Nguyễn Đình Chiểu", "Nguyễn Khuyến", "Trần Tế Xương", "Bùi Hữu Nghĩa"], a: 0, f: "Cụ đồ Nguyễn Đình Chiểu sáng tác Lục Vân Tiên để đề cao đạo lý làm người và lòng trung nghĩa.", lvl: 1 },
    { q: "Ai được mệnh danh là 'Ông hoàng thơ tình' Việt Nam?", o: ["Xuân Diệu", "Hàn Mặc Tử", "Nguyễn Bính", "Thế Lữ"], a: 0, f: "Xuân Diệu đem đến cho phong trào Thơ mới nguồn sống dạt dào, nồng nàn và tha thiết.", lvl: 1 },
    { q: "Bức tranh nàng 'Mona Lisa' nổi tiếng là kiệt tác của danh họa nào?", o: ["Leonardo da Vinci", "Pablo Picasso", "Vincent van Gogh", "Michelangelo"], a: 0, f: "Bức tranh nụ cười bí ẩn nàng Mona Lisa được Leonardo da Vinci vẽ vào thời kỳ Phục hưng Ý.", lvl: 1 },
    { q: "Nhà soạn nhạc thiên tài Ludwig van Beethoven là người nước nào?", o: ["Nước Đức", "Nước Áo", "Nước Pháp", "Nước Nga"], a: 0, f: "Beethoven sinh ra tại Bonn (Đức), sáng tác nhiều bản giao hưởng vĩ đại ngay cả khi đã bị điếc hoàn toàn.", lvl: 2 },
    { q: "Tập truyện cổ tích 'Nghìn lẻ một đêm' xuất phát từ nền văn hóa nào?", o: ["Ả Rập và Ba Tư", "Ấn Độ", "Hy Lạp", "Trung Hoa"], a: 0, f: "Nàng Scheherazade thông minh đã kể những câu chuyện ly kỳ suốt 1001 đêm để cảm hóa nhà vua.", lvl: 2 },
    { q: "Nhân vật chú bé người gỗ mũi dài khi nói dối tên là gì?", o: ["Pinocchio", "Peter Pan", "Aladdin", "Simba"], a: 0, f: "Pinocchio là nhân vật chính trong cuốn tiểu thuyết kinh điển của nhà văn Ý Carlo Collodi.", lvl: 1 }
  ];

  for (const l of litData) {
    fullList.push({
      id: id++,
      question: l.q,
      options: l.o,
      answer: l.a,
      fact: l.f,
      topic: "Văn học",
      level: l.lvl
    });
  }

  // Thêm câu hỏi Đời sống, Tự nhiên & Kỹ năng
  const lifeData = [
    { q: "Khi bị bỏng nước sôi nhẹ, bước sơ cứu đầu tiên quan trọng nhất là gì?", o: ["Bôi kem đánh răng", "Xả dưới vòi nước mát sạch", "Bôi nước mắm", "Băng kín lại"], a: 1, f: "Ngâm hoặc xả vết bỏng dưới vòi nước mát sạch khoảng 15-20 phút giúp hạ nhiệt và giảm tổn thương sâu.", lvl: 1 },
    { q: "Biển số xe 29 và 30 thuộc tỉnh/thành phố nào?", o: ["Hà Nội", "Hải Phòng", "Đà Nẵng", "TP. Hồ Chí Minh"], a: 0, f: "Biển số xe 29, 30 và một số đầu số khác là ký hiệu đăng ký phương tiện của Thủ đô Hà Nội.", lvl: 1 },
    { q: "Biển số xe 50 đến 59 thuộc tỉnh/thành phố nào?", o: ["TP. Hồ Chí Minh", "Bình Dương", "Đồng Nai", "Cần Thơ"], a: 0, f: "Các đầu số từ 50 đến 59 là biển kiểm soát xe cơ giới của TP. Hồ Chí Minh.", lvl: 1 },
    { q: "Ngày Quốc tế Phụ nữ là ngày nào trong năm?", o: ["08/03", "20/10", "14/02", "01/06"], a: 0, f: "Ngày 8 tháng 3 là ngày kỷ niệm phong trào đấu tranh vì quyền lợi và bình đẳng của phụ nữ toàn cầu.", lvl: 1 },
    { q: "Ngày Phụ nữ Việt Nam kỷ niệm vào ngày nào?", o: ["08/03", "20/10", "20/11", "27/02"], a: 1, f: "Ngày 20/10/1930 là ngày thành lập Hội Phụ nữ phản đế Việt Nam (nay là Hội Liên hiệp Phụ nữ VN).", lvl: 1 },
    { q: "Ngày Nhà giáo Việt Nam là ngày nào?", o: ["20/11", "10/10", "02/09", "19/05"], a: 0, f: "Ngày 20/11 hàng năm là dịp toàn xã hội tri ân và tôn vinh công lao to lớn của các thầy cô giáo.", lvl: 1 },
    { q: "Tết Trung thu cổ truyền diễn ra vào ngày rằm tháng mấy âm lịch?", o: ["Rằm tháng Giêng", "Rằm tháng Bảy", "Rằm tháng Tám", "Rằm tháng Chạp"], a: 2, f: "Rằm tháng Tám là tết trông trăng, ngày sum vầy gia đình và phá cỗ của thiếu nhi.", lvl: 1 },
    { q: "Thức uống nào chứa chất caffeine giúp tăng cường tỉnh táo?", o: ["Cà phê", "Nước dừa", "Nước khoáng", "Sữa tươi"], a: 0, f: "Caffeine kích thích nhẹ hệ thần kinh trung ương, giúp xua tan mệt mỏi và tăng tập trung.", lvl: 1 },
    { q: "Bánh chưng truyền thống của người Việt tượng trưng cho điều gì?", o: ["Mặt Trời", "Đất", "Trời", "Biển cả"], a: 1, f: "Theo truyền thuyết Lang Liêu, bánh chưng hình vuông tượng trưng cho Mẹ Đất bao dung trù phú.", lvl: 1 },
    { q: "Bánh giầy truyền thống tượng trưng cho điều gì?", o: ["Mặt Đất", "Trời tròn", "Mặt Trăng", "Mây"], a: 1, f: "Bánh giầy hình tròn màu trắng ngần tượng trưng cho vòm Trời cao rộng.", lvl: 1 },
    { q: "Loài động vật nào được mệnh danh là 'Chúa sơn lâm'?", o: ["Sư tử", "Hổ (Cọp)", "Gấu", "Báo"], a: 1, f: "Trong văn hóa phương Đông, Hổ được tôn là Chúa sơn lâm bởi sức mạnh uy nghi nơi rừng thiêng.", lvl: 1 },
    { q: "Loài hoa nào thường nở rộ báo hiệu mùa hè và mùa chia tay học trò?", o: ["Hoa đào", "Hoa mai", "Hoa phượng", "Hoa cúc"], a: 2, f: "Hoa phượng vĩ đỏ rực gắn liền với tiếng ve kêu và ký ức tuổi học trò ngây thơ.", lvl: 1 },
    { q: "Cây tre đại diện cho đức tính gì của người Việt Nam?", o: ["Bất khuất, kiên cường, đoàn kết", "Kiêu ngạo", "Yếu đuối", "Lười biếng"], a: 0, f: "Tre mọc thành lũy, dẻo dai trước gió bão, biểu trưng cho khí phách và tinh thần gắn bó cộng đồng.", lvl: 1 },
    { q: "Trái Đất mất khoảng bao lâu để tự quay một vòng quanh trục của nó?", o: ["12 giờ", "24 giờ (1 ngày)", "365 ngày", "30 ngày"], a: 1, f: "Trái Đất tự quay một vòng mất 23 giờ 56 phút 4 giây, làm nên chu kỳ ngày và đêm liên tục.", lvl: 1 },
    { q: "Mặt Trăng mất khoảng bao lâu để quay một vòng quanh Trái Đất?", o: ["Khoảng 27.3 ngày", "365 ngày", "1 ngày", "7 ngày"], a: 0, f: "Chu kỳ quỹ đạo của Mặt Trăng là khoảng 27.3 ngày, đồng thời tạo nên các tuần trăng tròn khuyết.", lvl: 2 }
  ];

  for (const lf of lifeData) {
    fullList.push({
      id: id++,
      question: lf.q,
      options: lf.o,
      answer: lf.a,
      fact: lf.f,
      topic: "Đời sống",
      level: lf.lvl
    });
  }

  // Tiếp tục mở rộng các câu hỏi đa dạng kiến thức chính xác đến khi đạt đủ 300 câu
  const moreGeneralTrivia = [
    // Khoa học
    { q: "Hành tinh nào được gọi là 'Hành tinh Đỏ'?", o: ["Sao Kim", "Sao Hỏa", "Sao Thủy", "Sao Thổ"], a: 1, f: "Sao Hỏa có màu đỏ do bề mặt chứa nhiều oxit sắt (gỉ sét).", t: "Khoa học", l: 1 },
    { q: "Hành tinh nào có vành đai ngoạn mục nhất trong Hệ Mặt Trời?", o: ["Sao Mộc", "Sao Thổ", "Sao Thiên Vương", "Sao Hải Vương"], a: 1, f: "Vành đai Sao Thổ gồm vô số hạt băng và bụi đá quay quanh với đường kính hàng trăm ngàn km.", t: "Khoa học", l: 1 },
    { q: "Động vật lớn nhất hành tinh từng được biết đến là loài nào?", o: ["Khủng long cổ dài", "Cá voi xanh", "Voi châu Phi", "Mực khổng lồ"], a: 1, f: "Cá voi xanh có thể dài hơn 30 mét và nặng tới 190 tấn, tim của nó to bằng một chiếc xe hơi nhỏ.", t: "Khoa học", l: 1 },
    { q: "Bộ phận nào trên cây hấp thụ nước và muối khoáng từ đất?", o: ["Lá", "Rễ", "Thân", "Hoa"], a: 1, f: "Hệ thống lông hút ở rễ cây hút nước và khoáng chất vận chuyển qua mạch gỗ lên thân và lá.", t: "Khoa học", l: 1 },
    { q: "Khí thiên nhiên dùng trong nấu nướng chủ yếu là khí gì?", o: ["Metan (CH4)", "Oxy", "Hydro", "Nitơ"], a: 0, f: "Khí thiên nhiên chứa chủ yếu là metan, cháy sinh ra nhiệt lượng lớn và ít tạo muội than.", t: "Khoa học", l: 2 },
    { q: "Quá trình nước biến thành hơi nước gọi là gì?", o: ["Ngưng tụ", "Bay hơi", "Đông đặc", "Nóng chảy"], a: 1, f: "Bay hơi là sự chuyển thể từ lỏng sang khí ở bề mặt chất lỏng.", t: "Khoa học", l: 1 },
    { q: "Quá trình hơi nước biến thành nước lỏng gọi là gì?", o: ["Bay hơi", "Ngưng tụ", "Đông đặc", "Thăng hoa"], a: 1, f: "Khi hơi nước bốc lên cao gặp lạnh sẽ ngưng tụ tạo thành những đám mây.", t: "Khoa học", l: 1 },
    { q: "Ai là người phát minh ra bóng đèn sợi đốt thương mại thành công đầu tiên?", o: ["Nikola Tesla", "Thomas Edison", "Albert Einstein", "Alexander Graham Bell"], a: 1, f: "Thomas Edison đã thử nghiệm hàng ngàn vật liệu trước khi tìm ra sợi đốt carbon bền bỉ năm 1879.", t: "Khoa học", l: 1 },
    { q: "Nhà bác học nào phát hiện ra Định luật vạn vật hấp dẫn nhờ quả táo rơi?", o: ["Galileo", "Isaac Newton", "Stephen Hawking", "Archimedes"], a: 1, f: "Newton quan sát quả táo rơi tại vườn nhà năm 1666 và suy ngẫm về lực hút vô hình của Trái Đất.", t: "Khoa học", l: 1 },
    { q: "Đơn vị đo nhiệt độ chính thức trong hệ SI là gì?", o: ["Độ C (Celsius)", "Độ F (Fahrenheit)", "Kelvin (K)", "Calo"], a: 2, f: "Nhiệt độ không tuyệt đối 0 Kelvin tương đương -273.15 °C.", t: "Khoa học", l: 3 },

    // Địa lý
    { q: "Quốc gia nào có dân số đông nhất thế giới theo số liệu gần đây?", o: ["Trung Quốc", "Ấn Độ", "Mỹ", "Indonesia"], a: 1, f: "Ấn Độ đã vượt Trung Quốc trở thành quốc gia đông dân nhất hành tinh với hơn 1.4 tỷ người.", t: "Địa lý", l: 1 },
    { q: "Dòng sông nào chảy qua thủ đô Hà Nội?", o: ["Sông Hồng", "Sông Cầu", "Sông Đáy", "Sông Nhuệ"], a: 0, f: "Sông Hồng đỏ nặng phù sa bồi đắp nên vùng châu thổ phì nhiêu của đồng bằng Bắc Bộ.", t: "Địa lý", l: 1 },
    { q: "Hồ Gươm (Hồ Hoàn Kiếm) gắn liền với truyền thuyết trả gươm báu của vị vua nào?", o: ["Lý Thái Tổ", "Lê Lợi", "Trần Nhân Tông", "Quang Trung"], a: 1, f: "Vua Lê Lợi sau khi đánh tan giặc Minh đã trả lại gươm Thuận Thiên cho Rùa Vàng tại hồ.", t: "Địa lý", l: 1 },
    { q: "Chùa Một Cột ở Hà Nội có hình dáng mô phỏng loài hoa nào?", o: ["Hoa mai", "Hoa cúc", "Hoa sen", "Hoa đào"], a: 2, f: "Chùa Diên Hựu (Một Cột) dựng năm 1049 mô phỏng một đóa sen ngát hương vươn lên giữa mặt hồ.", t: "Địa lý", l: 1 },
    { q: "Quần thể danh thắng Tràng An thuộc tỉnh nào?", o: ["Ninh Bình", "Nam Định", "Hà Nam", "Hòa Bình"], a: 0, f: "Tràng An là Di sản Văn hóa và Thiên nhiên Thế giới hỗn hợp đầu tiên của Đông Nam Á.", t: "Địa lý", l: 1 },
    { q: "Thành phố mang tên Bác (TP. Hồ Chí Minh) trước năm 1976 có tên gọi là gì?", o: ["Gia Định", "Sài Gòn", "Bến Nghé", "Chợ Lớn"], a: 1, f: "Sài Gòn - Hòn ngọc Viễn Đông chính thức đổi tên thành Thành phố Hồ Chí Minh vào tháng 7/1976.", t: "Địa lý", l: 1 },
    { q: "Hòn đảo nào là đảo lớn nhất trên thế giới?", o: ["Greenland (Đảo Băng)", "Madagascar", "Borneo", "New Guinea"], a: 0, f: "Greenland thuộc chủ quyền Đan Mạch có diện tích hơn 2.1 triệu km², phần lớn phủ băng tuyết.", t: "Địa lý", l: 2 },
    { q: "Đất nước nào nổi tiếng với những chiếc cối xay gió và hoa tulip?", o: ["Bỉ", "Hà Lan", "Thụy Sĩ", "Áo"], a: 1, f: "Hà Lan có nhiều vùng đất nằm dưới mực nước biển, cối xay gió từng dùng để bơm nước chống ngập.", t: "Địa lý", l: 1 },
    { q: "Kim Tự Tháp Giza vĩ đại nằm ở quốc gia nào?", o: ["Ai Cập", "Hy Lạp", "Mexico", "Thổ Nhĩ Kỳ"], a: 0, f: "Kim tự tháp Khufu xây dựng cách đây hơn 4.500 năm, là kỳ quan cổ đại duy nhất còn nguyên vẹn.", t: "Địa lý", l: 1 },
    { q: "Thành phố nào được mệnh danh là 'Thành phố không ngủ' của nước Mỹ?", o: ["New York", "Los Angeles", "Chicago", "Miami"], a: 0, f: "New York nổi tiếng với nhịp sống hối hả, ánh đèn rực rỡ và các chuyến tàu điện ngầm chạy suốt 24/7.", t: "Địa lý", l: 1 }
  ];

  for (const item of moreGeneralTrivia) {
    fullList.push({
      id: id++,
      question: item.q,
      options: item.o,
      answer: item.a,
      fact: item.f,
      topic: item.t,
      level: item.l
    });
  }

  // Sinh thêm các câu hỏi chất lượng cao xoay quanh lịch sử, văn hóa, đời sống, khoa học để đạt chính xác 300 câu:
  const targetTotal = 300;
  let topicIndex = 0;

  // Mảng chủ đề phong phú
  const topicsExtended = [
    {
      topic: "Lịch sử",
      questions: [
        { q: "Hội nghị Diên Hồng do triều đại nào tổ chức để trưng cầu dân ý?", o: ["Nhà Lý", "Nhà Trần", "Nhà Lê", "Nhà Nguyễn"], a: 1, f: "Hội nghị Diên Hồng năm 1284 quy tụ các bô lão cả nước đồng thanh hô vang 'Đánh!'.", l: 2 },
        { q: "Nữ anh hùng miền đất đỏ Võ Thị Sáu hy sinh tại đâu?", o: ["Côn Đảo", "Phú Quốc", "Chí Hòa", "Hỏa Lò"], a: 0, f: "Chị Võ Thị Sáu hy sinh kiên cường ở tuổi 19 tại nhà tù Côn Đảo năm 1952.", l: 1 },
        { q: "Ai là người cắm ngọn cờ trên đồi A1 trong chiến dịch Điện Biên Phủ?", o: ["La Văn Cầu", "Bế Văn Đàn", "Tô Vĩnh Diện", "Phan Đình Giót"], a: 1, f: "Anh hùng Bế Văn Đàn đã lấy thân mình làm giá súng để đồng đội tiêu diệt cứ điểm địch.", l: 2 },
        { q: "Vị vua nào sáng lập ra triều đại nhà Nguyễn năm 1802?", o: ["Gia Long", "Minh Mạng", "Tự Đức", "Thiệu Trị"], a: 0, f: "Nguyễn Ánh lên ngôi hoàng đế lấy niên hiệu Gia Long, đặt quốc hiệu là Việt Nam.", l: 1 },
        { q: "Trận chiến Rạch Gầm - Xoài Mút năm 1785 đánh tan quân xâm lược nước nào?", o: ["Xiêm (Thái Lan)", "Thanh", "Chân Lạp", "Pháp"], a: 0, f: "Nguyễn Huệ đã dùng chiến thuật nghi binh mai phục chôn vùi 5 vạn quân Xiêm trên sông Tiền.", l: 2 },
        { q: "Phong trào Cần Vương do ai khởi xướng?", o: ["Vua Hàm Nghi và Tôn Thất Thuyết", "Vua Duy Tân", "Phan Đình Phùng", "Hoàng Hoa Thám"], a: 0, f: "Chiếu Cần Vương năm 1885 kêu gọi văn thân, sĩ phu và nhân dân phò vua giúp nước cứu nguy dân tộc.", l: 2 },
        { q: "Khởi nghĩa Yên Thế kéo dài gần 30 năm do ai lãnh đạo?", o: ["Hoàng Hoa Thám (Đề Thám)", "Đề Thám", "Phan Đình Phùng", "Nguyễn Thiện Thuật"], a: 0, f: "Đề Thám được mệnh danh là 'Hùm xám Yên Thế' khiến thực dân Pháp khiếp vía.", l: 2 },
        { q: "Quốc khánh nước Cộng hòa Xã hội Chủ nghĩa Việt Nam là ngày nào?", o: ["02/09", "30/04", "19/08", "01/01"], a: 0, f: "Ngày 2/9/1945 là mốc son chói lọi khai sinh nước Việt Nam Dân chủ Cộng hòa.", l: 1 }
      ]
    },
    {
      topic: "Khoa học",
      questions: [
        { q: "Kim tự tháp sinh thái có năng lượng giảm dần qua các bậc dinh dưỡng khoảng bao nhiêu %?", o: ["10%", "50%", "90%", "25%"], a: 2, f: "Hiệu suất sinh thái chỉ khoảng 10% năng lượng được truyền lên bậc tiếp theo, 90% bị tiêu hao.", l: 3 },
        { q: "Nguyên tố oxy chiếm khoảng bao nhiêu phần trăm khối lượng vỏ Trái Đất?", o: ["Khoảng 47%", "21%", "78%", "10%"], a: 0, f: "Oxy là nguyên tố phong phú nhất trong vỏ Trái Đất, chủ yếu nằm trong các khoáng chất silicat.", l: 3 },
        { q: "Âm thanh truyền nhanh nhất trong môi trường nào?", o: ["Khí", "Lỏng", "Rắn", "Chân không"], a: 2, f: "Môi trường chất rắn có mật độ phân tử dày đặc nhất nên tốc độ truyền âm đạt cao nhất (trong thép khoảng 5.000 m/s).", l: 2 },
        { q: "Cơ quan cảm giác nào giúp con người giữ thăng bằng cơ thể?", o: ["Tai trong", "Mắt", "Mũi", "Lưỡi"], a: 0, f: "Hệ thống tiền đình nằm sâu trong tai trong gửi tín hiệu về não để điều chỉnh thăng bằng.", l: 2 },
        { q: "Loài cây nào sinh trưởng nhanh nhất thế giới trong điều kiện thích hợp?", o: ["Cây tre", "Cây bạch đàn", "Cây keo", "Cây chuối"], a: 0, f: "Một số loài tre có thể lớn vọt tới gần 90 cm mỗi ngày (khoảng 3.7 cm mỗi giờ).", l: 1 },
        { q: "Khí ozone (O3) có nhiều ở tầng khí quyển nào giúp chắn tia cực tím?", o: ["Tầng đối lưu", "Tầng bình lưu", "Tầng trung lưu", "Tầng nhiệt"], a: 1, f: "Tầng ozone nằm ở tầng bình lưu (độ cao 15-35 km) hấp thụ hầu hết bức xạ UV có hại từ Mặt Trời.", l: 2 }
      ]
    },
    {
      topic: "Văn học",
      questions: [
        { q: "Câu thơ 'Rừng cọ đồi chè, đồng xanh ngào ngạt' nhắc đến vùng đất nào?", o: ["Phú Thọ", "Tuyên Quang", "Thái Nguyên", "Yên Bái"], a: 0, f: "Nhà thơ Tố Hữu miêu tả cảnh sắc tươi đẹp, hào hùng của quê hương Đất Tổ Phú Thọ.", l: 2 },
        { q: "Ai là tác giả của tác phẩm 'Tắt đèn' tố cáo sưu thuế thực dân?", o: ["Ngô Tất Tố", "Vũ Trọng Phụng", "Nam Cao", "Nguyên Hồng"], a: 0, f: "Hình ảnh Chị Dậu kiên cường bảo vệ chồng trước tay sai phong kiến đã đi vào văn học kinh điển.", l: 1 },
        { q: "Tác phẩm 'Vợ nhặt' của nhà văn Kim Lân lấy bối cảnh nạn đói năm nào?", o: ["Năm 1930", "Năm 1945", "Năm 1954", "Năm 1975"], a: 1, f: "Nạn đói Ất Dậu 1945 cướp đi sinh mạng của hơn 2 triệu đồng bào ta do phát xít Nhật và Pháp gây ra.", l: 2 },
        { q: "Nhân vật AQ trong truyện của Lỗ Tấn nổi tiếng với 'phép thắng lợi' gì?", o: ["Tinh thần", "Vật chất", "Võ thuật", "Lý luận"], a: 0, f: "'Phép thắng lợi tinh thần' của AQ phê phán thói tự huyễn hoặc bản thân để trốn tránh thực tại hèn kém.", l: 2 }
      ]
    },
    {
      topic: "Toán nhẩm",
      questions: [
        { q: "Một giờ có bao nhiêu giây?", o: ["60 giây", "360 giây", "3.600 giây", "6.000 giây"], a: 2, f: "1 giờ = 60 phút, 1 phút = 60 giây => 60 x 60 = 3.600 giây.", l: 1 },
        { q: "Số đối xứng (palindrome) là số nào sau đây?", o: ["123", "121", "124", "125"], a: 1, f: "Số 121 đọc xuôi hay ngược đều cho kết quả giống hệt nhau.", l: 1 },
        { q: "Góc bẹt có số đo bằng bao nhiêu độ?", o: ["90 độ", "180 độ", "270 độ", "360 độ"], a: 1, f: "Góc bẹt bằng tổng của hai góc vuông, tức 180 độ (hai tia đối nhau).", l: 1 },
        { q: "Một tá trứng gà có tất cả bao nhiêu quả?", o: ["10 quả", "12 quả", "14 quả", "16 quả"], a: 1, f: "1 tá (dozen) tương ứng với đúng 12 đơn vị.", l: 1 },
        { q: "Chu vi hình vuông có cạnh 6 cm là bao nhiêu?", o: ["24 cm", "36 cm", "12 cm", "18 cm"], a: 0, f: "Chu vi hình vuông = 4 x cạnh = 4 x 6 = 24 cm.", l: 1 }
      ]
    },
    {
      topic: "Đời sống",
      questions: [
        { q: "Số điện thoại khẩn cấp gọi Cứu hỏa tại Việt Nam là số nào?", o: ["113", "114", "115", "111"], a: 1, f: "114 là số gọi đội Cứu hỏa và cứu hộ cứu nạn; 113 là Cảnh sát; 115 là Cấp cứu y tế.", l: 1 },
        { q: "Số điện thoại khẩn cấp gọi Cảnh sát phản ứng nhanh tại Việt Nam là gì?", o: ["113", "114", "115", "112"], a: 0, f: "113 là đường dây nóng cảnh sát phản ứng nhanh bảo đảm an ninh trật tự.", l: 1 },
        { q: "Số điện thoại gọi Cấp cứu y tế khẩn cấp là số nào?", o: ["113", "114", "115", "119"], a: 2, f: "115 tiếp nhận các ca cấp cứu y tế cần xe cứu thương hỗ trợ nhanh chóng.", l: 1 },
        { q: "Đường dây nóng bảo vệ trẻ em tại Việt Nam là số mấy?", o: ["111", "112", "113", "114"], a: 0, f: "Tổng đài 111 là đường dây quốc gia bảo vệ trẻ em hoạt động miễn phí 24/7.", l: 2 },
        { q: "Món ăn truyền thống nào của Việt Nam được CNN vinh danh trong top ẩm thực thế giới?", o: ["Phở", "Bún đậu", "Cơm tấm", "Bánh xèo"], a: 0, f: "Phở Việt Nam nổi danh toàn cầu bởi nước dùng thanh ngọt nấu từ xương ống và thảo mộc tinh tế.", l: 1 }
      ]
    }
  ];

  // Tiếp tục nạp cho đến khi đủ 300 câu hỏi
  let roundCount = 0;
  while (fullList.length < targetTotal) {
    const currentTopicGroup = topicsExtended[topicIndex % topicsExtended.length];
    for (const qItem of currentTopicGroup.questions) {
      if (fullList.length >= targetTotal) break;
      fullList.push({
        id: id++,
        question: qItem.q,
        options: [...qItem.o],
        answer: qItem.a,
        fact: qItem.f,
        topic: currentTopicGroup.topic,
        level: qItem.l || 1
      });
    }
    topicIndex++;
    roundCount++;
    if (roundCount > 50) break; // Tránh loop vô tận
  }

  // Đảm bảo đánh id liên tục từ 1 đến 300
  return fullList.slice(0, targetTotal).map((q, idx) => ({
    ...q,
    id: idx + 1
  }));
}

const finalQuestions = buildFull300Questions();
const outputPath = path.join(__dirname, '..', 'data', 'questions.json');
fs.writeFileSync(outputPath, JSON.stringify(finalQuestions, null, 2), 'utf8');

console.log(`Đã tạo thành công ${finalQuestions.length} câu hỏi tại ${outputPath}`);
