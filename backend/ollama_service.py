# -*- coding: utf-8 -*-
"""
ollama_service.py — Gọi Ollama local API (qwen3:8b) để luận giải lá số Tử Vi
"""
import httpx
import json

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "qwen3:4b"


def build_prompt_for_palace(palace: dict, meta: dict) -> str:
    """Tạo prompt luận giải cho một cung."""
    chinh_tinh = palace.get("chinhTinh", [])
    phu_tinh = palace.get("phuTinh", [])
    tu_hoa = palace.get("tuHoa", [])
    cung_name = palace.get("name", "")
    element = palace.get("element", "")
    dia_chi = palace.get("diaChi", "")
    
    gioi_tinh = meta.get("gioiTinh", "")
    ten_cuc = meta.get("tenCuc", "")
    ban_menh = meta.get("banMenh", "")
    
    prompt = f"""Bạn là một chuyên gia Tử Vi Đẩu Số phương Đông. Hãy luận giải cung {cung_name} dựa trên thông tin sau:

**Thông tin bản mệnh:**
- Giới tính: {gioi_tinh}
- Cục: {ten_cuc}
- Bản mệnh: {ban_menh}

**Cung {cung_name}:**
- An tại: {dia_chi}
- Ngũ hành cung: {element}
- Chính tinh: {', '.join(chinh_tinh) if chinh_tinh else 'Không có (Vô chính diệu)'}
- Phụ tinh: {', '.join(phu_tinh) if phu_tinh else 'Không có'}
- Tứ hóa: {', '.join(tu_hoa) if tu_hoa else 'Không có'}

Hãy luận giải ngắn gọn (200-400 từ) về ý nghĩa của cung này, bao gồm:
1. Ý nghĩa chính tinh tọa thủ (hoặc vô chính diệu)
2. Ảnh hưởng của các phụ tinh và tứ hóa
3. Tổng kết xu hướng tốt/xấu

Trả lời bằng tiếng Việt, ngắn gọn, dễ hiểu."""

    return prompt


def build_full_prompt(palaces: list, meta: dict) -> str:
    """Tạo prompt luận giải tổng quan cho toàn bộ lá số."""
    gioi_tinh = meta.get("gioiTinh", "")
    ten_cuc = meta.get("tenCuc", "")
    ban_menh = meta.get("banMenh", "")
    can_nam = meta.get("canNam", "")
    chi_nam = meta.get("chiNam", "")
    
    cung_info = []
    for p in palaces:
        chinh_tinh = p.get("chinhTinh", [])
        tu_hoa = p.get("tuHoa", [])
        line = f"- {p['name']} ({p.get('diaChi', '')}): "
        if chinh_tinh:
            line += f"Chính tinh: {', '.join(chinh_tinh)}"
        else:
            line += "Vô chính diệu"
        if tu_hoa:
            line += f" | Tứ hóa: {', '.join(tu_hoa)}"
        cung_info.append(line)
    
    prompt = f"""/no_think
Bạn là một chuyên gia Tử Vi Đẩu Số phương Đông. Hãy luận giải tổng quan lá số sau:

**Bản mệnh:** {gioi_tinh}, năm {can_nam} {chi_nam}, {ten_cuc}, {ban_menh}

**12 Cung:**
{chr(10).join(cung_info)}

Hãy luận giải tổng quan (500-800 từ) bao gồm:
1. Tổng quan bản mệnh và tính cách
2. Sự nghiệp và tài lộc
3. Tình duyên và gia đạo
4. Sức khỏe
5. Lời khuyên

Trả lời bằng tiếng Việt, sâu sắc nhưng dễ hiểu. Chú trọng phân tích mối tương quan giữa các cung tam hợp và xung chiếu."""

    return prompt


async def interpret_palace(palace: dict, meta: dict) -> str:
    """Gọi Ollama để luận giải một cung."""
    prompt = build_prompt_for_palace(palace, meta)
    
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                OLLAMA_URL,
                json={
                    "model": MODEL_NAME,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "top_p": 0.9,
                        "num_predict": 1024,
                    }
                }
            )
            response.raise_for_status()
            result = response.json()
            return result.get("response", "Không thể luận giải.")
    except httpx.TimeoutException:
        return "⏳ Ollama đang xử lý quá lâu. Vui lòng thử lại."
    except httpx.ConnectError:
        return "❌ Không thể kết nối Ollama. Hãy chắc chắn Ollama đang chạy (ollama serve)."
    except Exception as e:
        return f"❌ Lỗi khi gọi Ollama: {str(e)}"


async def interpret_full(palaces: list, meta: dict) -> str:
    """Gọi Ollama để luận giải tổng quan toàn lá số."""
    prompt = build_full_prompt(palaces, meta)
    
    try:
        async with httpx.AsyncClient(timeout=180.0) as client:
            response = await client.post(
                OLLAMA_URL,
                json={
                    "model": MODEL_NAME,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "top_p": 0.9,
                        "num_predict": 2048,
                    }
                }
            )
            response.raise_for_status()
            result = response.json()
            return result.get("response", "Không thể luận giải.")
    except httpx.TimeoutException:
        return "⏳ Ollama đang xử lý quá lâu. Vui lòng thử lại."
    except httpx.ConnectError:
        return "❌ Không thể kết nối Ollama. Hãy chắc chắn Ollama đang chạy (ollama serve)."
    except Exception as e:
        return f"❌ Lỗi khi gọi Ollama: {str(e)}"


async def interpret_each_palace(palaces: list, meta: dict) -> list:
    """Luận giải từng cung một, trả về list kết quả."""
    results = []
    for palace in palaces:
        interpretation = await interpret_palace(palace, meta)
        results.append({
            "cung": palace.get("name", ""),
            "interpretation": interpretation
        })
    return results
