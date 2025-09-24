from fastapi import FastAPI, Response
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import threading, time, os
import cv2
from ultralytics import YOLO

# -------------------- CONFIG --------------------
MAX_EXPECTED_VEHICLES = 22  # adjust based on road capacity
VIDEO_FILENAME = "traffic_video4.mp4"
vehicle_classes = [2, 3, 5, 7]  # car, motorcycle, bus, truck
total_30s_count = 0  # sum of avg_count for the last 30 seconds
seconds_elapsed = 0
latest_frame = None

# -------------------- APP --------------------
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173",],
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- LOAD MODEL & VIDEO --------------------
model = YOLO("yolov8n.pt")
video_path = os.path.join(os.path.dirname(__file__), VIDEO_FILENAME)
cap = cv2.VideoCapture(video_path)

if not cap.isOpened():
    raise Exception(f"ERROR: Could not open video: {video_path}")
else:
    print("Video opened successfully!")

fps = int(cap.get(cv2.CAP_PROP_FPS)) or 30

# -------------------- GLOBALS --------------------
counts_json = []
frame_number = 0
current_second_counts = []

# -------------------- GENERATOR --------------------
def generate_frames_and_counts():
    global frame_number, current_second_counts, counts_json, total_30s_count, seconds_elapsed
    while True:
        ret, frame = cap.read()
        if not ret:
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue

        frame_number += 1
        results = model(frame)
        vehicle_count = 0

        for r in results:
            for box in r.boxes:
                cls = int(box.cls)
                if cls in vehicle_classes:
                    vehicle_count += 1
                    x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)

        current_second_counts.append(vehicle_count)

        if frame_number % fps == 0:
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

            if seconds_elapsed >= 29:
                total_30s_count = 0
                seconds_elapsed = 0

            current_second_counts = []

        # Encode frame
        global latest_frame
        _, buffer = cv2.imencode('.jpg', frame)
        latest_frame = buffer.tobytes()

        time.sleep(0.06)

def video_stream_generator():
    while True:
        if latest_frame:  # only send if we already have a frame
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + latest_frame + b'\r\n')
        time.sleep(0.1)  # ~30 fps
   

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
    return counts_json if counts_json else []
