<img width="1919" height="874" alt="image" src="https://github.com/user-attachments/assets/046306a3-8f3d-4741-b15f-bb90c364dcd3" /># design-farm-ras
# Farm RAS 3D Studio V7.3

**Demo:** _Chưa triển khai GitHub Pages. Sau khi deploy, cập nhật liên kết tại đây._

<img width="1904" height="874" alt="image" src="https://github.com/user-attachments/assets/d7f501d5-e2d5-4e48-bad4-a2ee72eb947f" />





Ứng dụng web tiếng Việt hỗ trợ thiết kế hệ thống nuôi trồng thủy sản tuần hoàn (RAS). Người dùng có thể bố trí thiết bị trên mặt bằng 2D, xem mô hình 3D dạng phối cảnh, kết nối và chỉnh sửa đường ống, nhập thông số thiết bị, xem kết quả tính toán sơ bộ và xuất báo cáo. Ứng dụng yêu cầu đăng nhập hoặc đăng ký trước khi mở khu vực thiết kế.

## Bắt đầu

1. Mở `index.html` bằng Google Chrome hoặc Microsoft Edge; hoặc mở website sau khi triển khai GitHub Pages.
2. Ở lần sử dụng đầu tiên, chọn **Đăng ký**.
3. Nhập họ tên, email, mật khẩu tối thiểu 8 ký tự và xác nhận mật khẩu. Đăng ký thành công sẽ tự đăng nhập.
4. Những lần truy cập tiếp theo trên cùng trình duyệt và cùng địa chỉ website (origin), đăng nhập bằng email và mật khẩu đã tạo.
5. Kéo thiết bị từ **Thư viện thiết bị** vào mặt bằng. Chọn thiết bị để chỉnh kích thước, vị trí và thông số kỹ thuật.
6. Chọn **Nối ống**, nhấp thiết bị nguồn rồi nhấp thiết bị đích. Chọn đường ống để chỉnh loại tuyến, đường kính, lưu lượng và hình dạng tuyến.
7. Chuyển giữa **Mặt bằng 2D** và **Xem 3D** để kiểm tra bố trí. Mở **Báo cáo** để xem các phép tính và cảnh báo.
8. Dùng **Quản lý → Xuất JSON** để sao lưu mô hình; dùng **Mở JSON** để nạp lại một mô hình đã xuất.

## Tài khoản & nơi lưu dữ liệu

| Thành phần | Cách hoạt động | Phạm vi |
| --- | --- | --- |
| Tài khoản | Lưu danh sách tài khoản trong `localStorage`; mật khẩu được dẫn xuất bằng PBKDF2-HMAC-SHA256, salt ngẫu nhiên riêng và 150.000 vòng lặp | Trình duyệt/profile và origin hiện tại |
| Phiên đăng nhập | Lưu trạng thái phiên trong `localStorage`; có thể kết thúc bằng nút **Đăng xuất** | Cùng trình duyệt/profile và origin |
| Dự án | Lưu dữ liệu thiết kế trong `localStorage` dưới khóa `farmRAS3D_project_v72` | Trình duyệt/profile và origin hiện tại |
| Sao lưu/chuyển máy | Xuất dự án thành JSON, sau đó nhập JSON trên trình duyệt hoặc máy khác | Do người dùng tự quản lý file sao lưu |

**Giới hạn tài khoản:** Đây là cơ chế đăng nhập cục bộ để trình diễn, chưa có backend xác thực, email xác minh, đặt lại mật khẩu, phân quyền phía máy chủ hoặc đồng bộ tài khoản qua Internet. Dữ liệu dự án hiện dùng một vùng lưu cục bộ của ứng dụng, không phải không gian dự án độc lập cho từng tài khoản. Người dùng trên cùng trình duyệt/origin có thể truy cập cùng dữ liệu thiết kế đã lưu.

**Lưu ý bảo mật:** Màn hình đăng nhập không phải hệ thống bảo vệ dữ liệu production. GitHub Pages công khai file HTML và mã nguồn; người truy cập website vẫn có thể xem mã phía trình duyệt. Không dùng bản này để lưu mật khẩu thật, dữ liệu nhạy cảm hoặc triển khai cho nhiều người dùng cần phân quyền. Không lưu mật khẩu dạng rõ; tuy vậy, dữ liệu thiết kế trong `localStorage` và file JSON xuất ra không được mã hóa.

Dữ liệu cục bộ có thể không xuất hiện khi đổi trình duyệt, profile, máy tính hoặc chuyển từ địa chỉ `file://` sang `https://`. Xóa dữ liệu website cũng có thể làm mất tài khoản và mô hình. Hãy xuất JSON để sao lưu trước khi xóa dữ liệu hoặc đổi môi trường.

## Trình thiết kế 2D/3D

### Mặt bằng 2D

- Hiển thị mặt bằng theo lưới tỷ lệ, mặc định bước lưới 0,5 m.
- Thêm thiết bị từ thư viện; chọn, kéo thả, thay đổi tọa độ, xoay, nhân bản và xóa.
- Hiển thị hình dạng thiết bị, tên, cổng kết nối và chú giải đường ống.
- Phóng to/thu nhỏ, vừa khung và xuất sơ đồ 2D SVG.

![Mặt bằng thiết kế RAS](docs/editor-preview.png)

### Mô hình 3D

- Chuyển từ mặt bằng 2D sang góc nhìn phối cảnh 3D.
- Kéo nền để xoay góc nhìn; cuộn chuột để phóng to/thu nhỏ.
- Chọn và di chuyển thiết bị để kiểm tra cách bố trí trong không gian.
- Dùng chung dữ liệu thiết bị và đường ống với chế độ 2D.

Mô hình 3D của bản HTML này là hình chiếu không gian dựng bằng Canvas 2D, không phải mô hình WebGL/Three.js và không phải mô phỏng CFD.

## Thư viện thiết bị

Thư viện có 16 loại thiết bị/phụ kiện:

1. Bể cá tròn (Fish Tank).
2. Bể cá chữ nhật (Rectangular Tank).
3. Bể lắng (Settling Tank).
4. Drum Filter.
5. Lọc cơ học (Mechanical Filter).
6. Lọc vi sinh Kaldnes (Moving Bed Biofilter).
7. Bể chứa nước (Storage Tank).
8. Bể thu bùn (Sludge Collection Tank).
9. Tháp khử khí (Degassing Unit).
10. Bơm tuần hoàn (Water Pump).
11. Máy sục khí (Air Blower).
12. Côn hòa tan oxy (Oxygen Cone).
13. Nguồn oxy tinh khiết (Oxygen Supply).
14. Đèn UV (UV Sterilizer).
15. Van điều khiển (Valve).
16. Đoạn ống rời (Pipe Segment).

Thông số mặc định chỉ là dữ liệu khởi tạo để người dùng chỉnh sửa. Cần nhập dữ liệu thiết bị thực tế trước khi dùng kết quả cho một phương án cụ thể.

## Kết nối và chỉnh sửa đường ống

- Tạo tuyến bằng cách chọn thiết bị nguồn và thiết bị đích.
- Hỗ trợ các nhóm tuyến nước tự chảy, nước có áp, khí và xả cặn/nước thải.
- Chọn đường ống trên mặt bằng để mở bảng thuộc tính.
- Chỉnh thiết bị đầu/cuối, loại tuyến, đường kính, lưu lượng và chiều dài bổ sung.
- Thêm/kéo điểm gấp khúc để thay đổi hình dạng tuyến.
- Đầu tuyến tự bám theo thiết bị khi di chuyển thiết bị.
- Đảo chiều hoặc xóa tuyến khi cần.

Đầu nối bám theo hình dạng/điểm kết nối của mô hình dùng cho bố trí sơ đồ. Trước khi thi công cần xác định lại cổng vào/ra, cao độ, kích thước đầu nối và phụ kiện thực tế.

## Dashboard & kết quả tính toán

Dashboard và báo cáo có thể hiển thị các thông số được tính từ dữ liệu đã nhập:

- Tổng thể tích làm việc của bể nuôi.
- Tổng số bể nuôi và thiết bị.
- Tổng sinh khối cá và lượng thức ăn mỗi ngày.
- Lưu lượng tuần hoàn mục tiêu.
- Thời gian lưu nước HRT của bể lắng.
- Tải TAN dự kiến và năng lực biofilter theo hệ số thiết kế.
- Vận tốc và tổn thất đường ống chính.
- Cột áp tổng (TDH), công suất thủy lực và công suất điện bơm ước tính.
- Nhu cầu oxy sơ bộ và năng lực nguồn oxy được khai báo.
- Cảnh báo thiết bị thiếu, thiết bị chưa nối hoặc thông số vượt giới hạn đã cấu hình.

## Công thức chính

| Đại lượng | Công thức / cơ sở |
| --- | --- |
| Thể tích bể tròn | `V = π × (D/2)² × H nước` |
| Thể tích bể chữ nhật | `V = L × W × H nước` |
| Sinh khối cá | `B = Σ(số cá × khối lượng trung bình/con)` |
| Thức ăn/ngày | `F = Σ(sinh khối từng bể × tỷ lệ thức ăn/ngày)` |
| Lưu lượng tuần hoàn | `Q = tổng thể tích làm việc của bể nuôi / thời gian tuần hoàn mục tiêu` |
| HRT bể lắng | `HRT = thể tích nước bể lắng / Q` |
| Tải TAN dự kiến | `TAN = thức ăn/ngày × hệ số TAN đầu vào` |
| Thể tích vật liệu biofilter | `Vmedia = thể tích nước bể lọc × tỷ lệ vật liệu` |
| Năng lực xử lý TAN | `TANcapacity = Vmedia × tải TAN thiết kế trên mỗi m³ vật liệu/ngày` |
| Vận tốc ống chính | `v = Q / A`, `A = πD²/4` |
| Tổn thất dọc đường | `hf = f × (L/D) × v²/(2g)` |
| Tổn thất cục bộ | `hm = K × v²/(2g)` |
| Tổng cột áp sơ bộ | `TDH = cột áp tĩnh + hf + hm` |
| Công suất thủy lực | `P = ρ × g × Q × TDH` |
| Công suất điện ước tính | `Pđiện = Pthủy lực / hiệu suất tổng` |
| Nhu cầu oxy cá sơ bộ | `O₂ = sinh khối × hệ số tiêu thụ oxy × 24 / 1000` |
| Oxy nguồn cần cấp | `O₂ nguồn = nhu cầu oxy / hiệu suất chuyển oxy` |

Khi tính công suất, lưu lượng `Q` phải đổi từ m³/h sang m³/s. Giá trị `ρ = 1.000 kg/m³` và `g = 9,81 m/s²` là giả định cho nước ngọt ở điều kiện thông thường. Chiều sâu nước được dùng để tính thể tích làm việc.

## Cảnh báo & giới hạn tính toán

Ứng dụng có thể cảnh báo khi thiếu thiết bị chính, thiết bị chưa có kết nối, HRT thấp hơn mục tiêu, tải TAN vượt năng lực biofilter theo hệ số nhập, lưu lượng yêu cầu vượt định mức bơm/thiết bị, hoặc vận tốc và tổn thất ống chính vượt ngưỡng cấu hình.

Các phép tính hiện tại là **ước tính sơ bộ**:

- Thủy lực dùng cấu hình đường ống chính (đường kính, chiều dài, hệ số ma sát và K tổng); chưa giải đầy đủ mạng ống phân nhánh, manifold/T, nhiều bơm, NPSH hoặc đường đặc tính Q-H thực của nhà sản xuất.
- Nhu cầu oxy cá được tính theo sinh khối và hệ số do người dùng nhập; chưa cộng đầy đủ nhu cầu oxy của vi khuẩn nitrat hóa, tải BOD/chất hữu cơ hoặc mọi điều kiện nhiệt độ/độ mặn.
- Năng lực biofilter phụ thuộc vật liệu, diện tích bề mặt bảo vệ, nhiệt độ, pH, DO, độ mặn, độ trưởng thành vi sinh và tải thực tế. Hệ số mặc định chỉ phục vụ demo.
- Chưa mô hình hóa đầy đủ NH₃ theo pH/nhiệt độ, NO₂, NO₃, CO₂, chất rắn lơ lửng, UVT, tắc lọc, hiệu suất khử khí và hiệu suất chuyển oxy thực.
- Hiệu ứng dòng chảy là minh họa giao diện, không xác nhận lưu lượng thực hoặc trạng thái vận hành ngoài hiện trường.

Kết quả chỉ phục vụ học tập, trình diễn và thiết kế sơ bộ. Cần người có chuyên môn kiểm tra dữ liệu thiết bị, thủy lực, lọc sinh học, oxy và tiêu chuẩn an toàn trước khi thi công hoặc vận hành.

## Lưu và trao đổi dự án

- **Lưu:** ghi dự án hiện tại vào `localStorage` trên trình duyệt.
- **Xuất JSON:** sao lưu tên dự án, thiết bị, thông số, kết nối và cấu hình.
- **Mở JSON:** nhập file dự án đã xuất để khôi phục mô hình.
- **Xuất CSV:** tạo bảng kết quả có thể mở bằng Excel.
- **In / Xuất PDF:** mở hộp thoại in của trình duyệt và chọn **Save as PDF**.
- **Xuất sơ đồ:** xuất mặt bằng 2D thành SVG.

File JSON không chứa mật khẩu tài khoản. Dữ liệu thiết kế trong JSON không được mã hóa; chỉ chia sẻ khi bạn chấp nhận công khai thông tin trong mô hình.

## Chạy và triển khai GitHub Pages

### Chạy trực tiếp

1. Tải repository về máy.
2. Mở `index.html` bằng Chrome hoặc Edge.
3. Đăng ký tài khoản cục bộ rồi đăng nhập để vào ứng dụng.

Không cần cài Node.js/npm để chạy bản HTML tĩnh này. Dữ liệu được lưu trong trình duyệt.

### GitHub Pages

1. Tạo repository GitHub và đưa `index.html`, `README.md`, thư mục `docs/` và `examples/` lên nhánh `main`.
2. Mở **Settings → Pages**.
3. Trong **Build and deployment**, chọn **Deploy from a branch**.
4. Chọn branch `main`, thư mục `/(root)`, rồi nhấn **Save**.
5. Đợi GitHub Pages triển khai xong và mở URL được cung cấp.
6. Cập nhật liên kết Demo ở đầu README.

GitHub Pages chỉ phục vụ file tĩnh; nó không cung cấp backend hoặc cơ sở dữ liệu tài khoản. Tài khoản cục bộ trên `file://` và tài khoản trên địa chỉ GitHub Pages `https://...` thuộc các vùng lưu trữ khác nhau.

## Cấu trúc repository

```text
Farm-RAS-3D-Studio/
├── index.html
├── README.md
├── docs/
│   ├── auth-v7-3.png
│   └── editor-preview.png
└── examples/
    ├── Farm_RAS_Cau_Hinh_Mau.json
    └── Farm_RAS_Thong_So_Cau_Hinh.txt
```

## Tài liệu tham khảo

- [FAO – Recirculating aquaculture systems](https://www.fao.org/4/x5744e/x5744e0g.htm)
- [US EPA – EPANET](https://www.epa.gov/water-research/epanet)
- [MDN – Window.localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [GitHub Docs – Configuring a publishing source for GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## Phiên bản

**V7.3** – Có màn hình đăng nhập/đăng ký bắt buộc trước khi vào ứng dụng; hỗ trợ thiết kế 2D/3D, thư viện thiết bị, chỉnh sửa đường ống, tính toán sơ bộ, cảnh báo và xuất báo cáo.

## License

Chưa khai báo giấy phép sử dụng. Chủ repository cần bổ sung file `LICENSE` nếu muốn quy định quyền sử dụng, chỉnh sửa và phân phối mã nguồn.
