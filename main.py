from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from minio import Minio
from minio.error import S3Error
import os

app = FastAPI()

# Enable CORS so React can talk to this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your React app's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

minio_client = Minio(
    "localhost:9000",
    access_key="minioadmin",
    secret_key="minioadmin",
    secure=False
)

BUCKET_NAME = "my-files"

if not minio_client.bucket_exists(BUCKET_NAME):
    minio_client.make_bucket(BUCKET_NAME)

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        # Upload the file to MinIO
        # We use file.file to get the actual bytes
        # file.size is tricky in FastAPI, so we let MinIO read the stream
        # length=-1 tells MinIO to read until the stream ends
        minio_client.put_object(
            BUCKET_NAME,
            file.filename,
            file.file,
            length=-1,
            part_size=10*1024*1024, # 10MB chunk size
        )
        return {"filename": file.filename, "status": "uploaded"}
    except S3Error as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/files")
def list_files():
    try:
        objects = minio_client.list_objects(BUCKET_NAME)
        files = []
        for obj in objects:
            # Generate a temporary URL to view the file (valid for 1 hour)
            url = minio_client.get_presigned_url(
                "GET",
                BUCKET_NAME,
                obj.object_name,
            )
            files.append({"name": obj.object_name, "url": url})
        return files
    except S3Error as e:
        raise HTTPException(status_code=500, detail=str(e))