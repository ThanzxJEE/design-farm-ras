# Giao diện đăng nhập V7.4

## Những điểm thay đổi

- Bố cục xác thực hai cột trên desktop: khu vực giới thiệu sản phẩm và form tài khoản.
- Minh họa sơ đồ RAS bằng SVG nội tuyến, không tải ảnh hoặc thư viện bên ngoài.
- Chuyển đổi Đăng nhập / Tạo tài khoản ngay trên cùng màn hình.
- Trường email, họ tên và mật khẩu có biểu tượng trực quan.
- Có nút hiện/ẩn mật khẩu cho cả mật khẩu và xác nhận mật khẩu.
- Có trạng thái focus, thông báo xác thực và trạng thái nút gửi.
- Bố cục tự chuyển sang một cột trên tablet/điện thoại.
- Tôn trọng cài đặt `prefers-reduced-motion`.

## Phạm vi không thay đổi

Cơ chế đăng ký/đăng nhập cục bộ, hàm băm PBKDF2, khóa phiên, lưu dự án và các chức năng thiết kế 2D/3D không được thay đổi về mặt nghiệp vụ trong bản cập nhật giao diện này. Tài khoản vẫn thuộc trình duyệt/origin đang sử dụng; chưa có backend hoặc đồng bộ nhiều thiết bị.

## Chạy thử

```bash
npm run dev
```

Mở URL được in ra terminal (mặc định `http://127.0.0.1:4173`).

## Kiểm tra

```bash
npm run check
npm test
```
