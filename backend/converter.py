# -*- coding: utf-8 -*-
"""
converter.py — Chuyển đổi output lasotuvi (DiaBan) → JSON format cho tuvi-app
"""
import sys
import os

# Thêm thư mục chứa package lasotuvi vào sys.path
# lasotuvi package nằm tại h:\AI\Tuvi\lasotuvi\lasotuvi\
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'lasotuvi'))

from lasotuvi.App import lapDiaBan
from lasotuvi.DiaBan import diaBan
from lasotuvi.ThienBan import lapThienBan
from lasotuvi.AmDuong import nguHanh, diaChi, thienCan

# ── Mapping ngũ hành code → tên đầy đủ ──
NGU_HANH_MAP = {
    "K": "Kim",
    "M": "Mộc",
    "T": "Thủy",
    "H": "Hỏa",
    "O": "Thổ",
}

# ── Mapping tên sao lasotuvi → tên sao tuvi-app (Title Case chuẩn) ──
STAR_NAME_MAP = {
    "Tử vi": "Tử Vi",
    "Liêm trinh": "Liêm Trinh",
    "Thiên đồng": "Thiên Đồng",
    "Vũ khúc": "Vũ Khúc",
    "Thái Dương": "Thái Dương",
    "Thiên cơ": "Thiên Cơ",
    "Thiên phủ": "Thiên Phủ",
    "Thái âm": "Thái Âm",
    "Tham lang": "Tham Lang",
    "Cự môn": "Cự Môn",
    "Thiên tướng": "Thiên Tướng",
    "Thiên lương": "Thiên Lương",
    "Thất sát": "Thất Sát",
    "Phá quân": "Phá Quân",
    # Lục sát
    "Đà la": "Đà La",
    "Kình dương": "Kình Dương",
    "Địa không": "Địa Không",
    "Địa kiếp": "Địa Kiếp",
    "Linh tinh": "Linh Tinh",
    "Hỏa tinh": "Hỏa Tinh",
    # Lục cát
    "Văn xương": "Văn Xương",
    "Văn Khúc": "Văn Khúc",
    "Thiên khôi": "Thiên Khôi",
    "Thiên việt": "Thiên Việt",
    "Tả phù": "Tả Phù",
    "Hữu bật": "Hữu Bật",
    # Tứ hóa
    "Hóa lộc": "Hóa Lộc",
    "Hóa quyền": "Hóa Quyền",
    "Hóa khoa": "Hóa Khoa",
    "Hóa kỵ": "Hóa Kỵ",
    # Vòng Lộc Tồn
    "Lộc tồn": "Lộc Tồn",
    "Bác sỹ": "Bác Sĩ",
    "Lực sĩ": "Lực Sĩ",
    "Thanh long": "Thanh Long",
    "Tiểu hao": "Tiểu Hao",
    "Tướng quân": "Tướng Quân",
    "Tấu thư": "Tẩu Thư",
    "Phi liêm": "Phi Liêm",
    "Hỷ thần": "Hỷ Thần",
    "Bệnh phù": "Bệnh Phù",
    "Đại hao": "Đại Hao",
    "Phục binh": "Phục Binh",
    "Quan phù": "Quan Phù",
    # Vòng Thái Tuế
    "Thái tuế": "Thái Tuế",
    "Thiếu dương": "Thiếu Dương",
    "Tang môn": "Tang Môn",
    "Thiếu âm": "Thiếu Âm",
    "Quan phù": "Quan Phù",
    "Tử phù": "Tử Phù",
    "Tuế phá": "Tuế Phá",
    "Long đức": "Long Đức",
    "Bạch hổ": "Bạch Hổ",
    "Phúc đức": "Phúc Đức",
    "Điếu khách": "Điếu Khách",
    "Trực phù": "Trực Phù",
    # Vòng Tràng Sinh
    "Tràng sinh": "Trường Sinh",
    "Mộc dục": "Mộc Dục",
    "Quan đới": "Quan Đới",
    "Lâm quan": "Lâm Quan",
    "Đế vượng": "Đế Vượng",
    "Suy": "Suy",
    "Bệnh": "Bệnh",
    "Tử": "Tử",
    "Mộ": "Mộ",
    "Tuyệt": "Tuyệt",
    "Thai": "Thai",
    "Dưỡng": "Dưỡng",
    # Sao đôi khác
    "Long trì": "Long Trì",
    "Phượng các": "Phượng Các",
    "Tam thai": "Tam Thai",
    "Bát tọa": "Bát Tọa",
    "Ân quang": "Ân Quang",
    "Thiên quý": "Thiên Quý",
    "Thiên khốc": "Thiên Khốc",
    "Thiên hư": "Thiên Hư",
    "Thiên đức": "Thiên Đức",
    "Nguyệt đức": "Nguyệt Đức",
    "Thiên hình": "Thiên Hình",
    "Thiên riêu": "Thiên Riêu",
    "Thiên y": "Thiên Y",
    "Quốc ấn": "Quốc Ấn",
    "Đường phù": "Đường Phù",
    "Đào hoa": "Đào Hoa",
    "Hồng loan": "Hồng Loan",
    "Thiên hỷ": "Thiên Hỷ",
    "Thiên giải": "Thiên Giải",
    "Địa giải": "Địa Giải",
    "Giải thần": "Giải Thần",
    "Thai phụ": "Thai Phụ",
    "Phong cáo": "Phong Cáo",
    "Thiên tài": "Thiên Tài",
    "Thiên thọ": "Thiên Thọ",
    "Thiên thương": "Thiên Thương",
    "Thiên sứ": "Thiên Sứ",
    "Thiên la": "Thiên La",
    "Địa võng": "Địa Võng",
    "Cô thần": "Cô Thần",
    "Quả tú": "Quả Tú",
    "Thiên mã": "Thiên Mã",
    "Phá toái": "Phá Toái",
    "Thiên quan": "Thiên Quan",
    "Thiên phúc": "Thiên Phúc",
    "Lưu hà": "Lưu Hà",
    "Thiên trù": "Thiên Trù",
    "Kiếp sát": "Kiếp Sát",
    "Hoa cái": "Hoa Cái",
    "Văn tinh": "Văn Tinh",
    "Đẩu quân": "Đẩu Quân",
    "Thiên không": "Thiên Không",
}

# ── Danh sách 14 Chính Tinh (dùng tên chuẩn tuvi-app) ──
CHINH_TINH_SET = {
    "Tử Vi", "Thiên Cơ", "Thái Dương", "Vũ Khúc", "Thiên Đồng", "Liêm Trinh",
    "Thiên Phủ", "Thái Âm", "Tham Lang", "Cự Môn", "Thiên Tướng", "Thiên Lương",
    "Thất Sát", "Phá Quân"
}

# ── Tứ Hóa ──
TU_HOA_SET = {"Hóa Lộc", "Hóa Quyền", "Hóa Khoa", "Hóa Kỵ"}

# ── Tên cung theo thứ tự cungChu (từ DiaBan) → tên cung chuẩn tuvi-app ──
CUNG_NAME_MAP = {
    "Mệnh": "Mệnh",
    "Phụ mẫu": "Phụ Mẫu",
    "Phúc đức": "Phúc Đức",
    "Điền trạch": "Điền Trạch",
    "Quan lộc": "Quan Lộc",
    "Nô bộc": "Nô Bộc",
    "Thiên di": "Thiên Di",
    "Tật Ách": "Tật Ách",
    "Tài Bạch": "Tài Bạch",
    "Tử tức": "Tử Tức",
    "Phu thê": "Phu Thê",
    "Huynh đệ": "Huynh Đệ",
}

# ── Thứ tự cung ID ──
CUNG_ORDER = [
    "Mệnh", "Phụ Mẫu", "Phúc Đức", "Điền Trạch",
    "Quan Lộc", "Nô Bộc", "Thiên Di", "Tật Ách",
    "Tài Bạch", "Tử Tức", "Phu Thê", "Huynh Đệ"
]

# ── Map cung hành từ diaChi tenHanh ──
HANH_CUNG_MAP = {
    "T": "Thủy", "O": "Thổ", "M": "Mộc",
    "H": "Hỏa", "K": "Kim"
}


def normalize_star_name(name: str) -> str:
    """Chuẩn hóa tên sao từ lasotuvi sang format tuvi-app."""
    if name in STAR_NAME_MAP:
        return STAR_NAME_MAP[name]
    # Fallback: title case cho mỗi từ
    return " ".join(word.capitalize() for word in name.split())


def classify_star(star_name: str) -> str:
    """Phân loại sao: chinhTinh, tuHoa, hoặc phuTinh."""
    if star_name in CHINH_TINH_SET:
        return "chinhTinh"
    elif star_name in TU_HOA_SET:
        return "tuHoa"
    return "phuTinh"


def convert_diaban_to_json(dia_ban_obj, thien_ban_obj=None) -> dict:
    """
    Chuyển đổi DiaBan object từ lasotuvi → JSON format cho tuvi-app.
    
    Returns: dict với keys: meta, palaces (array 12 cung)
    """
    palaces = []
    
    # Tạo mapping cungSo → cung info
    cung_map = {}
    for cung in dia_ban_obj.thapNhiCung:
        if cung.cungSo == 0:
            continue
        cung_name_raw = getattr(cung, 'cungChu', None)
        if cung_name_raw is None:
            continue
        
        cung_name = CUNG_NAME_MAP.get(cung_name_raw, cung_name_raw)
        
        # Lấy danh sách sao
        all_stars = []
        chinh_tinh = []
        phu_tinh = []
        tu_hoa = []
        
        for sao_dict in cung.cungSao:
            raw_name = sao_dict.get('saoTen', '')
            star_name = normalize_star_name(raw_name)
            all_stars.append(star_name)
            
            star_type = classify_star(star_name)
            if star_type == "chinhTinh":
                chinh_tinh.append(star_name)
            elif star_type == "tuHoa":
                tu_hoa.append(star_name)
            else:
                phu_tinh.append(star_name)
        
        # Element of cung from diaChi
        hanh_code = diaChi[cung.cungSo].get('tenHanh', '')
        element = HANH_CUNG_MAP.get(hanh_code, "")
        
        # Đại hạn
        dai_han = getattr(cung, 'cungDaiHan', None)
        
        # Tiểu hạn
        tieu_han = getattr(cung, 'cungTieuHan', None)
        
        # Cung Thân
        is_than = getattr(cung, 'cungThan', False)
        
        # Tuần / Triệt
        tuan_trung = getattr(cung, 'tuanTrung', False)
        triet_lo = getattr(cung, 'trietLo', False)
        
        palace = {
            "id": CUNG_ORDER.index(cung_name) + 1 if cung_name in CUNG_ORDER else cung.cungSo,
            "name": cung_name,
            "element": element,
            "diaChi": cung.cungTen,
            "stars": all_stars,
            "chinhTinh": chinh_tinh,
            "phuTinh": phu_tinh,
            "tuHoa": tu_hoa,
            "daiHan": dai_han,
            "tieuHan": tieu_han,
            "isThan": is_than,
            "tuanTrung": tuan_trung,
            "trietLo": triet_lo,
            "description": "",
            "detailedDescription": "",
        }
        
        cung_map[cung_name] = palace
    
    # Sắp xếp theo thứ tự chuẩn
    for cung_name in CUNG_ORDER:
        if cung_name in cung_map:
            palaces.append(cung_map[cung_name])
    
    # Tạo meta info từ ThienBan
    meta = {}
    if thien_ban_obj:
        meta = {
            "ten": getattr(thien_ban_obj, 'ten', ''),
            "gioiTinh": getattr(thien_ban_obj, 'namNu', ''),
            "ngayDuong": getattr(thien_ban_obj, 'ngayDuong', ''),
            "thangDuong": getattr(thien_ban_obj, 'thangDuong', ''),
            "namDuong": getattr(thien_ban_obj, 'namDuong', ''),
            "ngayAm": getattr(thien_ban_obj, 'ngayAm', ''),
            "thangAm": getattr(thien_ban_obj, 'thangAm', ''),
            "namAm": getattr(thien_ban_obj, 'namAm', ''),
            "gioSinh": getattr(thien_ban_obj, 'gioSinh', ''),
            "canNam": getattr(thien_ban_obj, 'canNamTen', ''),
            "chiNam": getattr(thien_ban_obj, 'chiNamTen', ''),
            "tenCuc": getattr(thien_ban_obj, 'tenCuc', ''),
            "banMenh": getattr(thien_ban_obj, 'banMenh', ''),
            "menhChu": getattr(thien_ban_obj, 'menhChu', ''),
            "thanChu": getattr(thien_ban_obj, 'thanChu', ''),
            "sinhKhac": getattr(thien_ban_obj, 'sinhKhac', ''),
            "amDuongMenh": getattr(thien_ban_obj, 'amDuongMenh', ''),
        }
    
    return {
        "meta": meta,
        "palaces": palaces,
    }


def lap_la_so(ngay: int, thang: int, nam: int, gio: int,
              gioi_tinh: int, ten: str = "", mui_gio: int = 7) -> dict:
    """
    Hàm chính: lập lá số Tử Vi và trả về JSON.
    
    Args:
        ngay: Ngày sinh dương lịch
        thang: Tháng sinh dương lịch
        nam: Năm sinh dương lịch
        gio: Giờ sinh (1=Tý, 2=Sửu, 3=Dần, ..., 12=Hợi)
        gioi_tinh: 1 = Nam, -1 = Nữ
        ten: Tên người
        mui_gio: Múi giờ (mặc định 7 = Việt Nam)
    
    Returns:
        dict: JSON data cho tuvi-app
    """
    # Lập địa bàn (an sao)
    dia_ban_result = lapDiaBan(diaBan, ngay, thang, nam, gio, gioi_tinh, True, mui_gio)
    
    # Lập thiên bàn (thông tin tổng quan)
    thien_ban_result = lapThienBan(ngay, thang, nam, gio, gioi_tinh, ten, dia_ban_result,
                                    duongLich=True, timeZone=mui_gio)
    
    # Chuyển đổi sang JSON
    return convert_diaban_to_json(dia_ban_result, thien_ban_result)


if __name__ == "__main__":
    import json
    # Test: Ngày 24/10/1991, Giờ Tỵ (6), Nam
    result = lap_la_so(24, 10, 1991, 6, 1, "Test User", 7)
    print(json.dumps(result, ensure_ascii=False, indent=2))
