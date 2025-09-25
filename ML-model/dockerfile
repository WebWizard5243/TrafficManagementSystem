# Use a slim Python base image
FROM python:3.10-slim

# Prevent Python from writing pyc files / buffering stdout
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /Ml-model

# Install system deps (needed by numpy, opencv, etc.)
RUN apt-get update && apt-get install -y \
    gcc \
    libgl1 \
    libglib2.0-0 \
 && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the code
COPY . .

# Expose port for Railway
EXPOSE 8080

# Start FastAPI app with Uvicorn
CMD ["uvicorn", "traffic_yolov8:app", "--host", "0.0.0.0", "--port", "8080"]
