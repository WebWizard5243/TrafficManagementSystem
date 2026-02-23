# Smart Traffic Management System 🚦

An intelligent traffic management solution that leverages machine learning to reduce urban congestion and optimize traffic flow across city-wide networks.

## 🌟 Overview

This comprehensive traffic management system combines real-time video analysis, ML-powered vehicle detection, and centralized traffic control to create a smart solution for modern urban transportation challenges. The system provides city-wide traffic monitoring, automated congestion detection, and intelligent traffic light control.

## 🎯 Key Features

### 🤖 AI-Powered Traffic Analysis
- **YOLOv8 Vehicle Detection**: Advanced computer vision model for real-time vehicle counting and classification
- **Traffic Density Mapping**: ML algorithms analyze traffic patterns and congestion hotspots  
- **Predictive Analytics**: Forecast traffic conditions and suggest optimal routing

### 🌍 City-Wide Traffic Control
- **Centralized Dashboard**: Monitor traffic conditions across multiple intersections
- **Real-time Traffic Monitoring**: Live video feeds with vehicle count overlays
- **Intelligent Traffic Light Management**: Automated signal timing based on traffic density
- **Interactive Traffic Maps**: Visual representation of city-wide traffic conditions

### 📊 Smart Analytics & Reporting
- **Traffic Flow Visualization**: Real-time charts and graphs of vehicle movement
- **Congestion Heat Maps**: Identify problematic areas and peak traffic times
- **Historical Data Analysis**: Track traffic patterns over time
- **Alert System**: Automatic notifications for traffic anomalies
---
### Setting The Python Server 
**Note :- make sure to setup the python server before visiting the website for monitoring and vehicle counts**

### Clone repo and move to backend
git clone https://github.com/your-username/smart-traffic-management-system.git
cd smart-traffic-management-system/backend

### Create virtual environment
`python -m venv venv`
 #### macOS/Linux
`source venv/bin/activate `
 #### Windows
`venv\Scripts\activate `   

### Install dependencies
`pip install fastapi uvicorn ultralytics opencv-python numpy`

### Run The Backend Server
`python3 -m uvicorn traffic_yolov8:app --host 127.0.0.1 --port 8000  `

**Website**:- https://traffic-management-system-one.vercel.app/login
