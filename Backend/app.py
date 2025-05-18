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


images_path = "Images"
if not os.path.exists(images_path):
    os.makedirs(images_path)
    
rand_id = []
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
        
@app.route('/api/students', methods=['POST'])
def add_student():
    data = request.json
    try:
        new_num = None
        while True:
            new_num = random.randint(10**9, 10**10-1)
            if new_num not in rand_id:
                rand_id.append(new_num)
                break
        
        student = Student(
            Name=data['Name'].upper(),
            Reg_No=data['Reg_No'],
            DOB=datetime.strptime(data['DOB'], '%Y-%m-%d').date(),  # Convert string to date
            Blood_Group=data['Blood_Group'],
            Phone=data['Phone'],
            Dept=data['Dept'],
            Gender=data['Gender'],
            Bio=data.get('Bio', '')  # Optional default if Bio is missing
        )
        db.session.add(student)
        db.session.commit()
        return jsonify({
            'message': 'Student added successfully',
            'student': {
                'Name': student.Name,
                'Reg_No': student.Reg_No,
                'DOB': student.DOB,
                'Blood_Group': student.Blood_Group,
                'Phone': student.Phone,
                'Dept': student.Dept,
                'Gender': student.Gender,    
                'Bio': student.Bio
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400
    
@socketio.on('scan_card')
def handle_card_scan(data):
    card_id = data.get('card_id')
    student = Student.query.filter_by(Card_Id=card_id).first()

    if student:
        socketio.emit('card_scanned', {
            'success': True,
            'student': {
                'Name': student.Name,
                'Reg_No': student.Reg_No,
                'DOB': student.DOB,
                'Blood_Group': student.Blood_Group,
                'Phone': student.Phone,
                'Dept': student.Dept,
                'Gender': student.Gender,    
                'Bio': student.Bio
            },
            'message': 'Student found!'
        })
    else:
        socketio.emit('card_scanned', {
            'success': False,
            'message': 'Card not found!'
        })

@app.route('/api/unassigned-cards', methods=['GET'])
def get_unassigned_cards():
    assigned_cards = {int(os.path.splitext(f)[0] ) for f in os.listdir(images_path) 
                     if f.endswith(('.jpg', '.png', '.jpeg'))}
    all_students = Student.query.all()
    unassigned_cards = [student.id for student in all_students 
                       if student.id not in assigned_cards]
    return jsonify(unassigned_cards)

@app.route('/api/assign-image', methods=['POST'])
def assign_image():
    try:
        data = request.json
        card_id = data.get('card_id')
        image_data = data.get('image') 

        if not card_id or not image_data:
            return jsonify({'error': 'Card ID and image data are required'}), 400

        if 'base64,' in image_data:
            image_data = image_data.split('base64,')[1]

        image_bytes = base64.b64decode(image_data)

        image_path = os.path.join(images_path, f"{card_id}.jpg")
        with open(image_path, 'wb') as f:
            f.write(image_bytes)

        image = face_recognition.load_image_file(image_path)
        face_encodings = face_recognition.face_encodings(image)
        
        if face_encodings:
            if card_id not in data_dict:
                data_dict[card_id] = []
            data_dict[card_id].append(face_encodings[0].tolist())
            return jsonify({'message': 'Image assigned successfully'}), 200
        else:
            os.remove(image_path)
            return jsonify({'error': 'No face detected in the image'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    socketio.run(app, host='0.0.0.0', debug=True, port=5000)