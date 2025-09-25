from fastapi import FastAPI, Response
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import threading, time, os
import cv2
from ultralytics import YOLO
import asyncio
from concurrent.futures import ThreadPoolExecutor

# -------------------- CONFIG --------------------
MAX_EXPECTED_VEHICLES = 22
VIDEO_FILENAME = "traffic_video4.mp4"
vehicle_classes = [2, 3, 5, 7]  # car, motorcycle, bus, truck
total_30s_count = 0
seconds_elapsed = 0
latest_frame = None

# Performance optimizations
FRAME_SKIP = 2  # Process every 2nd frame for YOLO
STREAM_FPS = 15  # Reduce streaming FPS
JPEG_QUALITY = 60  # Reduce JPEG quality for faster encoding

# -------------------- APP --------------------
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173",],
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- LOAD MODEL & VIDEO --------------------
# Use smaller model for better performance
model = YOLO("yolov8n.pt")
model.fuse()  # Fuse model for faster inference

video_path = os.path.join(os.path.dirname(__file__), VIDEO_FILENAME)
cap = cv2.VideoCapture(video_path)

if not cap.isOpened():
    raise Exception(f"ERROR: Could not open video: {video_path}")
else:
    print("Video opened successfully!")

fps = int(cap.get(cv2.CAP_PROP_FPS)) or 30
original_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
original_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

# Reduce frame size for processing (keep aspect ratio)
PROCESS_WIDTH = 640  # Smaller processing size
PROCESS_HEIGHT = int(PROCESS_WIDTH * original_height / original_width)

# -------------------- GLOBALS --------------------
counts_json = []
frame_number = 0
current_second_counts = []
frame_cache = None
last_detection_frame = 0

# Thread pool for async processing
executor = ThreadPoolExecutor(max_workers=2)

# -------------------- OPTIMIZED PROCESSING --------------------
def process_frame_for_detection(frame):
    """Process frame for vehicle detection"""
    # Resize for faster processing
    small_frame = cv2.resize(frame, (PROCESS_WIDTH, PROCESS_HEIGHT))
    
    results = model(small_frame, verbose=False, conf=0.3)  # Lower confidence for speed
    vehicle_count = 0
    boxes = []

    for r in results:
        for box in r.boxes:
            cls = int(box.cls)
            if cls in vehicle_classes:
                vehicle_count += 1
                # Scale coordinates back to original size
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                x1 = int(x1 * original_width / PROCESS_WIDTH)
                y1 = int(y1 * original_height / PROCESS_HEIGHT)
                x2 = int(x2 * original_width / PROCESS_WIDTH)
                y2 = int(y2 * original_height / PROCESS_HEIGHT)
                boxes.append((x1, y1, x2, y2))

    return vehicle_count, boxes

def generate_frames_and_counts():
    global frame_number, current_second_counts, counts_json, total_30s_count, seconds_elapsed
    global latest_frame, frame_cache, last_detection_frame
    
    while True:
        ret, frame = cap.read()
        if not ret:
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            frame_number = 0
            continue

        frame_number += 1
        
        # Only run detection every FRAME_SKIP frames
        if frame_number % FRAME_SKIP == 0:
            vehicle_count, boxes = process_frame_for_detection(frame)
            current_second_counts.append(vehicle_count)
            last_detection_frame = frame_number
            
            # Draw bounding boxes
            for x1, y1, x2, y2 in boxes:
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            
            frame_cache = frame.copy()
        else:
            # Use cached frame with previous detections for smoother video
            if frame_cache is not None:
                frame = frame_cache

        # Update counts every second
        if frame_number % fps == 0 and current_second_counts:
            avg_count = sum(current_second_counts) / len(current_second_counts)
            total_30s_count += avg_count
            seconds_elapsed += 1

            congestion_index = min(round(avg_count / MAX_EXPECTED_VEHICLES * 100), 100)
            suggestion = (
                "Heavy traffic, set the signal green " if congestion_index > 80 else
                "Moderate traffic, may experience delays" if congestion_index > 50 else
                "Traffic is smooth"
            )

            counts_json.append({
                "second": frame_number // fps,
                "vehicle_count": round(avg_count),
                "total_30s_vehicles": round(total_30s_count),
                "congestion_index": congestion_index,
                "suggestion": suggestion
            })

            if seconds_elapsed >= 30:
                total_30s_count = 0
                seconds_elapsed = 0

            current_second_counts = []

        # Encode frame with lower quality for speed
        _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, JPEG_QUALITY])
        latest_frame = buffer.tobytes()

        # Dynamic sleep based on processing time
        time.sleep(0.03)  # Reduced sleep time

def video_stream_generator():
    target_delay = 1.0 / STREAM_FPS  # Target delay between frames
    while True:
        if latest_frame:
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + latest_frame + b'\r\n')
        time.sleep(target_delay)

# -------------------- BACKGROUND THREAD --------------------
def process_video_background():
    generate_frames_and_counts()

threading.Thread(target=process_video_background, daemon=True).start()

# -------------------- ENDPOINTS --------------------
@app.get("/video_stream")
async def video_stream():
    """MJPEG video stream with bounding boxes"""
    return StreamingResponse(
        video_stream_generator(),
        media_type='multipart/x-mixed-replace; boundary=frame',
        headers={"Cache-Control": "no-cache", "Pragma": "no-cache"}
    )

@app.get("/vehicle_counts")
def get_counts():
    """Return latest vehicle counts with congestion info"""
    # Return only last 100 entries to reduce memory usage
    return counts_json[-100:] if counts_json else []

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "frames_processed": frame_number}

# -------------------- STARTUP/SHUTDOWN --------------------
@app.on_event("startup")
async def startup_event():
    print("Traffic management system starting up...")

@app.on_event("shutdown")
async def shutdown_event():
    cap.release()
    executor.shutdown(wait=False)