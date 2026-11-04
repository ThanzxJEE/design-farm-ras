# Farm RAS 3D Studio V7.6

Ứng dụng web tiếng Việt hỗ trợ bố trí mô hình hệ thống nuôi trồng thủy sản tuần hoàn (RAS), chỉnh sửa thiết bị và đường ống trên mặt bằng 2D, xem mô hình 3D, theo dõi dashboard và tính toán kỹ thuật sơ bộ.

## Bắt đầu

1. Tải mã nguồn hoặc clone repository.
2. Dùng Node.js 18 trở lên.
3. Chạy `npm run dev`.
4. Mở địa chỉ `http://127.0.0.1:4173`.
5. Chọn **Đăng ký** ở lần đầu, sau đó đăng nhập để mở trình thiết kế.

Ứng dụng không có dependency npm bên ngoài. Có thể mở `index.html` trực tiếp bằng Chrome/Edge; chạy qua máy chủ tĩnh được khuyến nghị để có môi trường trình duyệt nhất quán.

## Cấu trúc mã nguồn

```text
Farm-RAS-3D-Studio-V7.6/
├── index.html
├── package.json
├── README.md
├── .gitignore
├── .nojekyll
├── src/
│   ├── app.js
│   └── styles.css
├── examples/
│   ├── Farm_RAS_Cau_Hinh_Mau.json
│   └── Farm_RAS_Thong_So_Cau_Hinh.txt
├── docs/
│   ├── login-preview.png
│   ├── editor-preview.png
│   ├── ARCHITECTURE.md
│   ├── SECURITY_AND_STORAGE.md
│   ├── CALCULATION_SCOPE.md
│   └── GITHUB_PAGES.md
├── scripts/
│   └── serve.mjs
├── tests/
│   └── project-integrity.test.mjs
└── standalone/
    └── Farm_RAS_3D_Dang_Nhap_V7_5.html
```

## Giao diện xác thực V7.6

- Màn hình đăng nhập toàn màn hình chia đôi, nền xanh navy/teal theo phong cách kỹ thuật số.
- Sơ đồ RAS SVG minh họa bể nuôi, Drum Filter, ba MBBR, khử khí, bơm và tuyến hồi.
- Lưới kỹ thuật, các điểm sáng, trạng thái Digital Twin Preview và animation dòng chảy nhẹ.
- Form đăng nhập/đăng ký nền sáng, có hiện/ẩn mật khẩu và hỗ trợ màn hình nhỏ.
- Logic tài khoản cục bộ được giữ nguyên; không bổ sung đăng nhập máy chủ hoặc đồng bộ đa thiết bị.

## Chức năng

- Mặt bằng 2D với lưới tỷ lệ và bố trí thiết bị.
- Chế độ xem 3D, xoay và zoom mô hình.
- Thư viện 14 loại thiết bị RAS.
- Thêm, chọn, di chuyển, xoay, nhân bản và xóa thiết bị.
- Chỉnh kích thước và các thông số thiết bị.
- Tạo và chỉnh sửa đường ống; đổi loại tuyến, đường kính, lưu lượng và hình dạng tuyến.
- Đầu ống tự bám theo thiết bị khi thiết bị được di chuyển.
- Dashboard và các phép tính sơ bộ về thể tích, sinh khối, thức ăn, lưu lượng, HRT, TAN, biofilter, bơm, đường ống và oxy.
- Cảnh báo sơ bộ theo đầu vào và ngưỡng cấu hình.
- Đăng ký, đăng nhập và đăng xuất cục bộ.
- Lưu dự án trong trình duyệt; nhập/xuất JSON; xuất SVG, CSV và in báo cáo PDF.

## Tài khoản và dữ liệu

- Tài khoản là cục bộ theo trình duyệt/origin; không đồng bộ giữa nhiều máy.
- Mật khẩu không lưu dạng rõ; ứng dụng dùng PBKDF2-HMAC-SHA256 cùng salt riêng để tạo giá trị kiểm tra.
- Phiên và tài khoản demo lưu bằng `localStorage`.
- Dữ liệu dự án lưu dạng JSON trong `localStorage`, không mã hóa.
- Xóa dữ liệu trình duyệt có thể làm mất tài khoản và dự án. Xuất JSON để sao lưu.
- Đây không phải xác thực backend production. Xem [docs/SECURITY_AND_STORAGE.md](docs/SECURITY_AND_STORAGE.md).

## Công thức chính

| Đại lượng | Công thức |
| --- | --- |
| Bể tròn | `V = π × D² / 4 × h` |
| Bể chữ nhật | `V = dài × rộng × mực nước` |
| Sinh khối | `Số cá × khối lượng trung bình/con` |
| Thức ăn/ngày | `Sinh khối × tỷ lệ thức ăn` |
| Lưu lượng tuần hoàn | `Q = thể tích bể nuôi / thời gian tuần hoàn` |
| HRT | `HRT = thể tích công đoạn / lưu lượng qua công đoạn` |
| TAN | `Thức ăn/ngày × hệ số TAN đầu vào` |
| Vận tốc ống | `v = Q / A` |
| Công suất thủy lực | `P = ρ × g × Q × H` |

Các hệ số TAN, tải biofilter, oxy, hiệu suất bơm/UV và dữ liệu thiết bị là giả định hoặc đầu vào có thể chỉnh. Kết quả không thay thế tính toán thủy lực mạng ống đầy đủ, đường đặc tính bơm, NPSH, xác nhận oxy và thẩm định chuyên môn trước thi công. Xem [docs/CALCULATION_SCOPE.md](docs/CALCULATION_SCOPE.md).

## Chạy và kiểm tra mã nguồn

```bash
npm run dev
npm run check
npm test
```

- `npm run dev`: chạy máy chủ tĩnh tại `http://127.0.0.1:4173`.
- `npm run check`: kiểm tra cú pháp JavaScript.
- `npm test`: kiểm tra cấu trúc file, thành phần xác thực và JSON mẫu.

Các bài test này là kiểm tra tính toàn vẹn nguồn ở mức cơ bản, không phải kiểm thử E2E toàn bộ thao tác trên trình duyệt.

## Đưa lên GitHub

- Nếu dùng như repository riêng: xem [docs/GITHUB_PAGES.md](docs/GITHUB_PAGES.md).
- Nếu thêm vào repository Vite `NCKH-LongT/design-3d-RAS-system`: dùng gói riêng `Farm_RAS_V7_3_FOR_EXISTING_REPO.zip`, giải nén để đặt ứng dụng trong `public/farm-ras-v7-3/`. Không ghi đè source Vite đang có.

## Phân biệt với dự án Vite đang có

Bản Farm RAS V7.4 trong gói này là HTML/CSS/JavaScript thuần; nó không chứa source React/Vite, Firebase Authentication, Firestore, Web Worker mô phỏng hoặc các kiểm thử của dự án Liêm RAS Studio 1.2 hiện có trong repository. Không nên gộp hai codebase hoặc thay thế `src/`, `package.json`, `vite.config.js` và workflow gốc nếu chưa có kế hoạch tích hợp riêng.

## License

Chưa chỉ định giấy phép. Chủ repository cần bổ sung `LICENSE` nếu muốn quy định quyền sử dụng, sửa đổi và phân phối mã nguồn.

## Giao diện xác thực V7.4

Màn hình đăng nhập/đăng ký được thiết kế lại với bố cục hai cột, sơ đồ RAS SVG, trường nhập có biểu tượng, nút hiện/ẩn mật khẩu và giao diện thích ứng trên thiết bị di động. Logic tài khoản cục bộ được giữ nguyên. Xem [docs/LOGIN_UI_V7_4.md](docs/LOGIN_UI_V7_4.md).

## Chạy và kiểm tra V7.4

```bash
npm run dev
npm run check
npm test
```

Có thể mở `standalone.html` trực tiếp bằng trình duyệt nếu chỉ cần chạy một file HTML độc lập.


## V7.6 – Industrial Editorial Login

- Đổi toàn bộ ngôn ngữ giao diện xác thực sang phong cách industrial/editorial: nền giấy kỹ thuật, panel truy cập graphite và điểm nhấn signal orange.
- Giữ nguyên ID form, luồng đăng nhập/đăng ký, kiểm tra mật khẩu và vùng làm việc RAS.
- Responsive cho desktop, tablet và mobile; tôn trọng `prefers-reduced-motion`.
