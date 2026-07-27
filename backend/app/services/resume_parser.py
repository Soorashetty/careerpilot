import io
import fitz  # PyMuPDF
import pdfplumber
from docx import Document

def extract_text(file_bytes: bytes, filename: str) -> str:
    name = filename.lower()
    if name.endswith(".pdf"):
        return _extract_pdf(file_bytes)
    elif name.endswith(".docx"):
        return _extract_docx(file_bytes)
    elif name.endswith(".txt"):
        return file_bytes.decode("utf-8", errors="ignore")
    return ""

def _extract_pdf(file_bytes: bytes) -> str:
    # Try pdfplumber first (better for structured PDFs)
    try:
        with io.BytesIO(file_bytes) as buf:
            with pdfplumber.open(buf) as pdf:
                text = "\n".join(p.extract_text() or "" for p in pdf.pages)
        if text.strip():
            return text
    except (ValueError, OSError) as e:
        pass
    # Fallback to PyMuPDF
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        return "\n".join(page.get_text() for page in doc)
    except (ValueError, RuntimeError):
        return ""

def _extract_docx(file_bytes: bytes) -> str:
    doc = Document(io.BytesIO(file_bytes))
    return "\n".join(p.text for p in doc.paragraphs)
