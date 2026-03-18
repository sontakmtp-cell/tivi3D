# -*- coding: utf-8 -*-
"""
main.py — FastAPI server kết nối lasotuvi + Ollama qwen3:8b
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import json

from converter import lap_la_so
from ollama_service import interpret_full, interpret_each_palace

app = FastAPI(
    title="Tử Vi API",
    description="API lập lá số Tử Vi và luận giải bằng AI (Ollama qwen3:8b)",
    version="1.0.0"
)

# CORS: cho phép tuvi-app frontend gọi API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request/Response Models ──

class LasoRequest(BaseModel):
    ngay: int = Field(..., ge=1, le=31, description="Ngày sinh dương lịch")
    thang: int = Field(..., ge=1, le=12, description="Tháng sinh dương lịch")
    nam: int = Field(..., ge=1900, le=2100, description="Năm sinh dương lịch")
    gio: int = Field(..., ge=1, le=12, description="Giờ sinh (1=Tý, 2=Sửu, ..., 12=Hợi)")
    gioiTinh: int = Field(..., description="Giới tính: 1=Nam, -1=Nữ")
    ten: str = Field(default="", description="Tên người")
    muiGio: int = Field(default=7, description="Múi giờ (mặc định 7 = Việt Nam)")


class InterpretRequest(BaseModel):
    palaces: list = Field(..., description="Danh sách 12 cung từ /api/laso")
    meta: dict = Field(default={}, description="Thông tin bản mệnh từ /api/laso")
    mode: str = Field(default="full", description="'full' = tổng quan, 'each' = từng cung")


# ── Endpoints ──

@app.get("/")
async def root():
    return {
        "message": "🌙 Tử Vi API - Kết nối lasotuvi + Ollama qwen3:8b",
        "endpoints": {
            "POST /api/laso": "Lập lá số Tử Vi",
            "POST /api/interpret": "Luận giải bằng AI",
        }
    }


@app.post("/api/laso")
async def api_lap_la_so(req: LasoRequest):
    """
    Lập lá số Tử Vi từ thông tin ngày sinh.
    Trả về JSON chứa meta + 12 cung với danh sách sao.
    """
    try:
        result = lap_la_so(
            ngay=req.ngay,
            thang=req.thang,
            nam=req.nam,
            gio=req.gio,
            gioi_tinh=req.gioiTinh,
            ten=req.ten,
            mui_gio=req.muiGio
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Lỗi khi lập lá số: {str(e)}")


@app.post("/api/interpret")
async def api_interpret(req: InterpretRequest):
    """
    Luận giải lá số bằng Ollama qwen3:8b.
    mode='full': luận giải tổng quan toàn lá số
    mode='each': luận giải từng cung
    """
    try:
        if req.mode == "each":
            results = await interpret_each_palace(req.palaces, req.meta)
            return {"interpretations": results}
        else:
            interpretation = await interpret_full(req.palaces, req.meta)
            return {"interpretation": interpretation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi luận giải: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
