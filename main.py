from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from minio import Minio
from minio.error import S3Error

app = FastAPI()

# 1. CORS: Allow React (Port 3000) to talk to FastAPI (Port 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, change this to ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. MinIO Configuration
minio_client = Minio(
    "localhost:9000",
    access_key="minioadmin",
    secret_key="minioadmin",
    secure=False
)
BUCKET_NAME = "my-files"

# 3. Ensure Bucket Exists on Startup
if not minio_client.bucket_exists(BUCKET_NAME):
    minio_client.make_bucket(BUCKET_NAME)

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        # Stream the file directly to MinIO
        minio_client.put_object(
            BUCKET_NAME,
            file.filename,
            file.file,
            length=-1,
            part_size=10*1024*1024,
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
            # Generate a temporary URL (presigned) for viewing
            url = minio_client.get_presigned_url(
                "GET",
                BUCKET_NAME,
                obj.object_name,
            )
            files.append({"name": obj.object_name, "url": url})
        return files
    except S3Error as e:
        raise HTTPException(status_code=500, detail=str(e))