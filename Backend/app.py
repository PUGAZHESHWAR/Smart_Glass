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

