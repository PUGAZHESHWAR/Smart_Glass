
import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../api/apiService';
import { Camera, CameraOff, User, AlertCircle, X } from 'lucide-react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

interface StudentDetails {
  Name: string;
  Reg_No: string;
  DOB: string;
  Blood_Group: string;
  Phone: string;
  Dept: string;
  Gender: string;
  Bio: string;
}

const TestCamera: React.FC = () => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [processingCommand, setProcessingCommand] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recognitionStatus, setRecognitionStatus] = useState<{
    detected: boolean;
    identified: boolean;
    name?: string;
    student?: StudentDetails;
  } | null>(null);
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  
  const videoRef = useRef<HTMLImageElement>(null);
  
useEffect(() => {
  socket.on('camera_frame', (data) => {
    if (videoRef.current) {
      videoRef.current.src = `data:image/jpeg;base64,${data.image}`;
    }
  });
  
  socket.on('face_recognition_result', (data) => {
    setRecognitionStatus({
      detected: data.face_detected,
      identified: data.identified,
      name: data.student_name,
      student: data.student
    });

    // Only show popup when a new student is identified
    if (data.identified && data.student) {
      setShowDetailsPopup(true);
    } else if (!data.identified || !data.face_detected) {
      // Close popup when no face is detected or not identified
      setShowDetailsPopup(false);
    }
  });
  
  return () => {
    socket.off('camera_frame');
    socket.off('face_recognition_result');
    apiService.stopCamera().catch(console.error);
  };
}, []);
  
  const toggleCamera = async () => {
    setProcessingCommand(true);
    setErrorMessage(null);
    
    try {
      if (isCameraActive) {
        await apiService.stopCamera();
        setIsCameraActive(false);
        setRecognitionStatus(null);
        setShowDetailsPopup(false);
        socket.emit('stop_face_recognition');
      } else {
        const response = await apiService.startCamera();
        if (response.error) {
          setErrorMessage(response.error);
        } else {
          setIsCameraActive(true);
          socket.emit('perform_face_recognition');
        }
      }
    } catch (error) {
      setErrorMessage('Failed to control camera. Please try again.');
      console.error('Camera toggle error:', error);
    } finally {
      setProcessingCommand(false);
    }
  };

const closePopup = () => {
  setShowDetailsPopup(false);
  // Reset recognition status to prevent immediate reopening
  setRecognitionStatus(prev => prev ? {
    ...prev,
    identified: false,
    student: undefined
  } : null);
};

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Face Recognition Test</h2>
        <p className="text-gray-600">Test the camera and face recognition system</p>
      </div>
      
      {errorMessage && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-800 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}
      
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Camera Feed
          </h3>
          <button
            onClick={toggleCamera}
            disabled={processingCommand}
            className={`px-4 py-2 rounded-md flex items-center text-sm font-medium transition-all duration-200
              ${processingCommand ? 'bg-gray-300 cursor-not-allowed' : 
                isCameraActive ? 'bg-red-100 text-red-700 hover:bg-red-200' : 
                'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
          >
            {isCameraActive ? (
              <>
                <CameraOff className="h-4 w-4 mr-2" />
                <span>Stop Camera</span>
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-2" />
                <span>Start Camera</span>
              </>
            )}
          </button>
        </div>
        
        <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50 aspect-video flex items-center justify-center relative">
          {isCameraActive ? (
            <img 
              ref={videoRef} 
              alt="Camera Feed" 
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-gray-400 flex flex-col items-center">
              <Camera className="h-12 w-12 mb-2" />
              <span>Camera is inactive</span>
            </div>
          )}
          
          {recognitionStatus && (
            <div className={`absolute bottom-0 left-0 right-0 p-3 
              ${recognitionStatus.identified 
                ? 'bg-green-500/80 text-white' 
                : recognitionStatus.detected 
                  ? 'bg-yellow-500/80 text-white' 
                  : 'bg-red-500/80 text-white'}`}>
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                <div>
                  {recognitionStatus.identified ? (
                    <p>Identified: <strong>{recognitionStatus.name}</strong></p>
                  ) : recognitionStatus.detected ? (
                    <p>Face detected, but not recognized</p>
                  ) : (
                    <p>No face detected</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-6 text-gray-600 text-sm">
          <p className="font-medium mb-2">Instructions:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Click "Start Camera" to activate the camera</li>
            <li>Position your face within the frame</li>
            <li>The system will attempt to recognize your face</li>
            <li>Face recognition status will appear at the bottom of the feed</li>
            <li>Click "Stop Camera" when finished</li>
          </ol>
        </div>
      </div>

      {/* Student Details Popup */}
      {showDetailsPopup && recognitionStatus?.identified && recognitionStatus?.student && (
       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-xl font-bold text-gray-800">
                Student Details
              </h3>
              <button 
                onClick={closePopup}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{recognitionStatus.student.Name}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Registration Number</p>
                  <p className="font-medium">{recognitionStatus.student.Reg_No}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium">{recognitionStatus.student.DOB}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Blood Group</p>
                  <p className="font-medium">{recognitionStatus.student.Blood_Group}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{recognitionStatus.student.Phone}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-medium">{recognitionStatus.student.Dept}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium">{recognitionStatus.student.Gender}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Bio</p>
                  <p className="font-medium">{recognitionStatus.student.Bio}</p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={closePopup}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestCamera;