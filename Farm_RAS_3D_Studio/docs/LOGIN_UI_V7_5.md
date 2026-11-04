# Authentication UI V7.5

Màn hình đăng nhập sử dụng bố cục toàn màn hình chia đôi. Bảng trái dùng tông navy/teal, lưới kỹ thuật, sơ đồ RAS SVG, đường nước/khí có hiệu ứng chuyển động và ba điểm nổi bật 2D/3D/Calculation. Bảng phải giữ form đăng nhập/đăng ký hiện có.

Các ID tương thích với `src/app.js`: `authBackdrop`, `authTabLogin`, `authTabRegister`, `authHeading`, `authSubtitle`, `authFormArea`, `authClose`. Form và các sự kiện tạo động vẫn do `src/app.js` quản lý.

Không thay đổi cách lưu tài khoản: thông tin tài khoản vẫn lưu cục bộ trên trình duyệt hiện tại; không có đồng bộ server.
