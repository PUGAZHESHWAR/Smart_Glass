from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date
from sqlalchemy import and_
import os
import face_recognition
from dotenv import load_dotenv
import numpy as np
import random
import cv2
import platform
import time
import base64
import threading

load_dotenv()

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    Name = db.Column(db.String(20), nullable=False)
    Reg_No = db.Column(db.String(10), unique=True, nullable=False)
    DOB = db.Column(db.Date, unique=False, nullable=False)
    Blood_Group = db.Column(db.String(5), unique=False, nullable=False)
    Phone = db.Column(db.String(10), unique=True, nullable=False)
    Dept = db.Column(db.String(10), unique=False, nullable=False)
    Gender = db.Column(db.String(10), unique=False, nullable=False)
    Bio = db.Column(db.String(100), unique=False, nullable=False)
    Created_At = db.Column(db.DateTime, default=datetime.utcnow)

with app.app_context():
    db.create_all()

images_path = "Images"
if not os.path.exists(images_path):
    os.makedirs(images_path)
    
data_dict = {}

for image_name in os.listdir(images_path):
    if image_name.endswith(('.jpg', '.png', '.jpeg')):
        card_id = os.path.splitext(image_name)[0]  
        image_path = os.path.join(images_path, image_name)
        image = face_recognition.load_image_file(image_path)
        face_encodings = face_recognition.face_encodings(image)

        if face_encodings:
            if card_id not in data_dict:
                data_dict[card_id] = []
            data_dict[card_id].append(face_encodings[0])

for key in data_dict:
    data_dict[key] = [encoding.tolist() for encoding in data_dict[key]]
    
camera = None
camera_thread = None
stop_camera = False

def camera_stream():
    global camera, stop_camera
    while not stop_camera:
        if camera is not None:
            success, frame = camera.read()
            if success:
                ret, buffer = cv2.imencode('.jpg', frame)
                if ret:
                    frame_bytes = base64.b64encode(buffer).decode('utf-8')
                    socketio.emit('camera_frame', {'image': frame_bytes})
        time.sleep(0.1)
        
print("End Working")