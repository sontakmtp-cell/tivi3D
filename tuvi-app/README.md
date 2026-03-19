# 🌌 Tử Vi 3D Khoa Học (Science 3D Horoscope)

Ứng dụng **Tử Vi 3D Khoa Học** là một công cụ phân tích và trực quan hóa lá số tử vi mang tính đột phá, biến lá số 2D truyền thống thành một hệ mặt trời/vũ trụ không gian 3D tương tác sinh động. Ứng dụng này không chỉ giải mã các thông tin trừu tượng mà còn hình tượng hóa chúng thông qua các mô hình thiên thể và cơ chế quỹ đạo thông minh.

## 🚀 Tính Năng Chính

*   **Mô Phỏng Vũ Trụ Tử Vi 3D:** Chuyển đổi lá số từ dạng bảng 2D sang không gian 3D. Cung Mệnh được đặt ở tâm vũ trụ, với các cung khác và các ngôi sao (chính tinh, phụ tinh) quay quanh như các hành tinh và vệ tinh.
*   **Hệ Thống Chấm Điểm & Tốc Độ Quỹ Đạo:** 
    *   Tự động tính toán điểm số sức mạnh và sự ảnh hưởng của từng ngôi sao dựa trên vị trí và tương tác.
    *   Tốc độ quay của tinh hệ phản ánh trực quan sự chi phối: sao càng mạnh quay càng nhanh, tạo ra cái nhìn động về các yếu tố chi phối cuộc đời.
*   **So Sánh Tương Hợp (Comparison Mode):** 
    *   Cho phép tải lên 2 lá số cùng lúc để đối chiếu.
    *   Phân tích sự xung khắc, tương hợp giữa 2 cá nhân (Tình duyên, Đối tác làm ăn) dựa trên hệ thống thuật toán Tử vi phương Đông.
*   **Tương Tác Chuyên Sâu:** Người dùng có thể xoay, thu phóng camera, và click vào từng thiên thể để xem các lời bình giải chi tiết (interpretation).
*   **Hỗ trợ Dữ liệu Linh Hoạt:** Nhập dữ liệu từ các file cấu trúc `.json`, `.txt` thông qua bộ chuyển đổi dữ liệu thông minh (Data Adapter).

## 🛠️ Công Nghệ Sử Dụng

*   **Lõi:** [React 19](https://react.dev/) & [Vite 8](https://vitejs.dev/)
*   **Đồ họa 3D:** 
    *   [Three.js](https://threejs.org/) (Core engine)
    *   [@react-three/fiber](https://r3f.docs.pmnd.rs/) (React renderer for Three.js)
    *   [@react-three/drei](https://github.com/pmndrs/drei) (Hệ thống thành phần 3D hỗ trợ)
    *   [@react-three/postprocessing](https://github.com/pmndrs/react-postprocessing) (Hiệu ứng hình ảnh Bloom, Glow, Lens Flare)
*   **Logic Tử Vi:** Hệ thống tính toán điểm số (starScores.js), quan hệ cung (relationships.js) và bộ dữ liệu sao (starsDatabase.js).

## 📁 Cấu Trúc Thư Mục

```bash
tuvi-app/
├── public/                 # Tài nguyên tĩnh (models, textures, icons)
├── src/
│   ├── components/         # Các thành phần giao diện (Scene, Nav, Uploader)
│   ├── data/               # Dữ liệu gốc & Logic chuyển đổi (dataAdapter, starsDatabase)
│   ├── hooks/              # Các custom hooks (Contexts cho Theme, Comparison)
│   ├── App.jsx             # Entry point của ứng dụng
│   ├── TuViScene.jsx       # Component chính dựng không gian 3D
│   ├── ComparisonScene.jsx # Không gian 3D cho chế độ so sánh
│   └── index.css           # Styling toàn bộ ứng dụng (Modern Dark Glassmorphism)
├── update_data.cjs         # Script Node.js giúp cập nhật dữ liệu tự động
└── package.json            # Khai báo thư viện & Scripts
```

## 📦 Cài Đặt và Chạy

1.  **Cài đặt các phụ thuộc:**
    ```bash
    npm install
    ```
2.  **Chạy ở chế độ phát triển (Dev Mode):**
    ```bash
    npm run dev
    ```
3.  **Xây dựng bản sản xuất (Production Build):**
    ```bash
    npm run build
    ```

## 📖 Hướng Dẫn Sử Dụng

1.  **Xem Lá Số Đơn:** Tải file JSON lá số của bạn lên giao diện chính. Hệ thống sẽ tự động dựng vũ trụ 3D dựa trên dữ liệu đó.
2.  **Xem So Sánh (Comparison):** Mở bảng điều khiển so sánh (Comparison Panel) và tải tệp JSON thứ hai. Chế độ 3D sẽ chuyển sang hai cụm thiên hà tương tác với các đường kết nối tương hợp.
3.  **Thay đổi Giao diện:** Sử dụng Theme Selector để chuyển đổi giữa các phong cách vũ trụ khác nhau (Space Dark, Cosmic Blue, v.v.).

---
*Phát triển bởi đội ngũ đam mê văn hóa phương Đông & Công nghệ tương lai.*
