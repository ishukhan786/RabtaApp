from fastapi import APIRouter, UploadFile

router = APIRouter()


@router.post("/upload")
async def upload_media(file: UploadFile):
    return {"filename": file.filename, "content_type": file.content_type}
