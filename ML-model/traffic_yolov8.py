from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import cv2, os, time
from ultralytics import YOLO
from concurrent.futures import ThreadPoolExecutor
from queue import Queue
import threading

# -------------------- CONFIG --------------------
VIDEO_FILENAME = "traffic_video4.mp4"
vehicle_classes = [2, 3, 5, 7]  # car, motorcycle, bus, truck
MAX_EXPECTED_VEHICLES = 22

# Optimizations
FRAME_SKIP = 2        # process every 2nd frame
STREAM_FPS = 15       # streaming FPS
JPEG_QUALITY = 60     # JPEG quality for encoding
QUEUE_MAXSIZE = 5     # max frames in queue

# -------------------- APP --------------------
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # adjust as needed
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- LOAD MODEL & VIDEO --------------------
model = YOLO("yolov8n.pt")
model.fuse()  # fuse model for faster inference

video_path = os.path.join(os.path.dirname(__file__), VIDEO_FILENAME)
cap = cv2.VideoCapture(video_path)
if not cap.isOpened():
    raise Exception(f"Could not open video: {video_path}")

fps = int(cap.get(cv2.CAP_PROP_FPS)) or 30
original_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
original_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

print(f"Video FPS: {fps}, Resolution: {original_width}x{original_height}")

# Resize for faster processing
PROCESS_WIDTH = 640
PROCESS_HEIGHT = int(PROCESS_WIDTH * original_height / original_width)

# -------------------- GLOBALS FOR VEHICLE COUNTING --------------------
counts_json = []
current_second_counts = []
total_30s_count = 0
seconds_elapsed = 0
frame_number = 0

# -------------------- QUEUES & THREADPOOL --------------------
frame_queue = Queue(maxsize=QUEUE_MAXSIZE)
executor = ThreadPoolExecutor(max_workers=2)

latest_frame_bytes = None

# -------------------- FUNCTIONS --------------------
def process_frame_for_detection(frame, current_frame_number):
    """Runs YOLO detection on a frame"""
    global current_second_counts, counts_json, total_30s_count, seconds_elapsed
    
    small_frame = cv2.resize(frame, (PROCESS_WIDTH, PROCESS_HEIGHT))
    results = model(small_frame, verbose=False, conf=0.3)
    vehicle_count = 0
    boxes = []

    for r in results:
        for box in r.boxes:
            cls = int(box.cls)
            if cls in vehicle_classes:
                vehicle_count += 1
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                x1 = int(x1 * original_width / PROCESS_WIDTH)
                y1 = int(y1 * original_height / PROCESS_HEIGHT)
                x2 = int(x2 * original_width / PROCESS_WIDTH)
                y2 = int(y2 * original_height / PROCESS_HEIGHT)
                boxes.append((x1, y1, x2, y2))

    # Add to current second counts
    current_second_counts.append(vehicle_count)

    # Check if we've completed a second (based on original video fps)
    if current_frame_number % fps == 0 and current_second_counts:
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
            "second": current_frame_number // fps,
            "vehicle_count": round(avg_count),
            "total_30s_vehicles": round(total_30s_count),
            "congestion_index": congestion_index,
            "suggestion": suggestion
        })

        # Reset after 30 seconds
        if seconds_elapsed >= 30:
            total_30s_count = 0
            seconds_elapsed = 0

        current_second_counts = []

    # Draw boxes
    for x1, y1, x2, y2 in boxes:
        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)

    return frame

def frame_reader():
    """Reads frames from video at original FPS and puts them into frame_queue"""
    global frame_number
    frame_delay = 1.0 / fps  # Original video timing
    
    while True:
        ret, frame = cap.read()
        if not ret:
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            frame_number = 0
            continue

        frame_number += 1
        
        # Only process every FRAME_SKIP frames for detection, but maintain timing
        if frame_number % FRAME_SKIP == 0:
            if not frame_queue.full():
                frame_queue.put((frame.copy(), frame_number))
        
        # Sleep to maintain original video timing
        time.sleep(frame_delay)

def frame_processor():
    """Processes frames asynchronously using ThreadPoolExecutor"""
    global latest_frame_bytes
    while True:
        if not frame_queue.empty():
            frame, current_frame_number = frame_queue.get()
            future = executor.submit(process_frame_for_detection, frame, current_frame_number)
            processed_frame = future.result()
            _, buffer = cv2.imencode('.jpg', processed_frame, [cv2.IMWRITE_JPEG_QUALITY, JPEG_QUALITY])
            latest_frame_bytes = buffer.tobytes()

def video_stream_generator():
    """Generator for MJPEG streaming at controlled rate"""
    global latest_frame_bytes
    delay = 1.0 / STREAM_FPS
    
    while True:
        if latest_frame_bytes:
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + latest_frame_bytes + b'\r\n')
        time.sleep(delay)

# -------------------- START BACKGROUND THREADS --------------------
threading.Thread(target=frame_reader, daemon=True).start()
threading.Thread(target=frame_processor, daemon=True).start()

# -------------------- ENDPOINTS --------------------
@app.get("/video_stream")
def video_stream():
    return StreamingResponse(
        video_stream_generator(),
        media_type='multipart/x-mixed-replace; boundary=frame',
        headers={"Cache-Control": "no-cache", "Pragma": "no-cache"}
    )

@app.get("/vehicle_counts")
def get_counts():
    """Return latest vehicle counts with congestion info"""
    return counts_json[-50:] if counts_json else []

@app.get("/health")
def health_check():
    return {
        "status": "healthy", 
        "frames_processed": frame_number,
        "total_counts_recorded": len(counts_json)
    }

# -------------------- STARTUP/SHUTDOWN --------------------
@app.on_event("shutdown")
async def shutdown_event():
    cap.release()
    executor.shutdown(wait=False)