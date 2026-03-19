# 🌙 lasotuvi - Thư viện An Sao Tử Vi Mã Nguồn Mở

[![Build Status](https://travis-ci.org/doanguyen/lasotuvi.svg?branch=master)](https://travis-ci.org/doanguyen/lasotuvi)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**lasotuvi** là một thư viện Python mạnh mẽ dùng để tính toán và an sao cho lá số Tử vi theo phương pháp cổ học phương Đông. Dự án cung cấp lõi thuật toán chính xác để chuyển đổi lịch, xác định vị trí các cung và an hơn 100 ngôi sao dựa trên các quy tắc học thuật (như phái Thiên Lương).

## 🌟 Tính Năng Nổi Bật

*   **Chuyển đổi Lịch Chính xác:** Tích hợp bộ chuyển đổi Âm - Dương lịch (Solar-to-Lunar) với độ chính xác cao, xử lý tốt các tháng nhuận.
*   **An Sao Toàn diện:** Hệ thống hóa logic an toàn bộ các chính tinh (Tử Vi, Thiên Phủ tinh hệ) và các phụ tinh (Vòng Thái Tuế, Lộc Tồn, Tràng Sinh...).
*   **Hỗ trợ Học thuật:** Cho phép tùy chỉnh các phương pháp an sao (Ví dụ: cách an sao Hỏa Tinh, Linh Tinh theo các tông phái khác nhau).
*   **Dễ dàng Tích hợp:** Đầu ra dữ liệu có cấu trúc (Structured data), cực kỳ phù hợp để làm API cho các ứng dụng web (Django, Flask) hoặc mobile.
*   **Xử lý Vận Hạn:** Tính toán sẵn Đại vận (10 năm) và Tiểu vận (1 năm).

## 📁 Cấu Trúc Mã Nguồn

*   `App.py`: Lõi trung tâm thực hiện việc lập địa bàn và an sao.
*   `AmDuong.py`: Xử lý logic can chi, ngũ hành và chuyển đổi lịch pháp.
*   `DiaBan.py`: Quản lý 12 cung chức năng (Mệnh, Phụ, Phúc...).
*   `Sao.py`: Định nghĩa danh sách và thuộc tính của các ngôi sao.
*   `ThienBan.py`: Thông tin tổng quan về bản mệnh (Cục, Bản mệnh...).

## ⚙️ Cài Đặt

1.  **Sử dụng pip:**
    ```bash
    pip install lasotuvi
    ```
2.  **Yêu cầu hệ thống:** Python 3.x và các thư viện trong `requirements.txt`.

## 🚀 Hướng Dẫn Sử Dụng Nhanh

```python
from lasotuvi.App import lapDiaBan
from lasotuvi.DiaBan import DiaBan

# Các thông số đầu vào: Ngày, Tháng, Năm (Dương lịch), Giờ sinh, Giới tính, Múi giờ
# Giới tính: Nam (1), Nữ (-1)
ngay = 24
thang = 10
nam = 1991
gio_sinh = 10 # Giờ Tỵ
gioi_tinh = 1
mui_gio = 7

# Khởi tạo địa bàn và an sao
la_so = lapDiaBan(DiaBan, ngay, thang, nam, gio_sinh, gioi_tinh, True, mui_gio)

# Truy xuất thông tin (Ví dụ: xem sao ở cung Mệnh)
cung_menh = la_so.cungMenh
print(f"Cung Mệnh tại địa chi: {cung_menh}")
```

## 🎥 Tài liệu & Video
*   **Video Hướng dẫn gốc:** [Vimeo Tutorial](https://vimeo.com/283303258)
*   **Frontend Reference:** [lasotuvi-django](https://github.com/doanguyen/lasotuvi-django)

## 🤝 Đóng Góp
Mọi ý kiến đóng góp, báo lỗi xin vui lòng tạo **Issue** hoặc **Pull Request** trên GitHub. Dự án được phát hành dưới giấy phép **MIT**.

---
*(c) 2016 - 2026 doanguyen <dungnv2410@gmail.com>*
