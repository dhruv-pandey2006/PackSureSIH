import os
os.environ["FLAGS_use_mkldnn"] = "0"

from fastapi import FastAPI, File, UploadFile
from paddleocr import PaddleOCR
import tempfile
import os

app = FastAPI(title="PackSure OCR Service")

ocr = PaddleOCR(
    lang="en",
    enable_mkldnn=False,
    text_detection_model_name="PP-OCRv5_mobile_det",
    text_recognition_model_name="en_PP-OCRv5_mobile_rec",
    use_doc_orientation_classify=False,
    use_doc_unwarping=False,
    use_textline_orientation=False,
    cpu_threads=8,
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/ocr")
async def perform_ocr(file: UploadFile = File(...)):
    suffix = os.path.splitext(file.filename or "")[1] or ".jpg"

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp:
        temp.write(await file.read())
        image_path = temp.name

    try:
        result = ocr.predict(image_path)

        extracted_text = []

        for page in result:
            if hasattr(page, "json"):
                data = page.json
                if isinstance(data, str):
                    import json
                    data = json.loads(data)

                texts = data.get("res", {}).get("rec_texts", [])
                extracted_text.extend(texts)

        return {
            "filename": file.filename,
            "text": "\n".join(extracted_text)
        }

    finally:
        if os.path.exists(image_path):
            os.remove(image_path)