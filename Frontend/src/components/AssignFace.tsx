import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../api/apiService';
import { Camera, Upload, Check, AlertCircle, Loader2, CameraOff } from 'lucide-react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const AssignFace: React.FC = () => {
  const [unassignedCards, setUnassignedCards] = useState<number[]>([]);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [captureMode, setCaptureMode] = useState<'camera' | 'upload'>('camera');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  
  const videoRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    fetchUnassignedCards();
    
    // Listen for camera frames
    socket.on('camera_frame', (data) => {
      if (videoRef.current && isCameraActive) {
        videoRef.current.src = `data:image/jpeg;base64,${data.image}`;
      }
    });
    
    // Listen for image capture confirmation
    socket.on('image_captured', (data) => {
      if (data.success) {
        setStatusMessage({
          type: 'success',
          message: 'Image successfully captured and face detected!'
        });
        setIsCameraActive(false);
        apiService.stopCamera().catch(console.error);
      }
    });
    
    return () => {
      socket.off('camera_frame');
      socket.off('image_captured');
      
      // Stop camera on unmount if active
      if (isCameraActive) {
        apiService.stopCamera().catch(console.error);
      }
    };
  }, [isCameraActive]);
  
const fetchUnassignedCards = async () => {
  try {
    console.log('Attempting to fetch unassigned cards...');
    const cards = await apiService.getUnassignedCards();
    console.log('Received cards:', cards);
    setUnassignedCards(cards);
  } catch (error) {
    console.error('Full error details:', error);
    setStatusMessage({
      type: 'error',
      message: 'Failed to fetch unassigned student IDs. Please check your connection and try again.'
    });
  }
};
  
  const toggleCamera = async () => {
    setIsProcessing(true);
    setStatusMessage(null);
    
    try {
      if (isCameraActive) {
        await apiService.stopCamera();
        setIsCameraActive(false);
      } else {
        if (!selectedCard) {
          setStatusMessage({
            type: 'error',
            message: 'Please select a student ID first'
          });
          return;
        }
        
        const response = await apiService.startCamera();
        if (response.error) {
          setStatusMessage({
            type: 'error',
            message: response.error
          });
        } else {
          setIsCameraActive(true);
          setStatusMessage({
            type: 'info',
            message: 'Camera activated. Position face in frame and click Capture.'
          });
        }
      }
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: 'Failed to control camera. Please try again.'
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const captureImage = async () => {
    if (!selectedCard) {
      setStatusMessage({
        type: 'error',
        message: 'Please select a student ID first'
      });
      return;
    }
    
    setIsProcessing(true);
    setStatusMessage(null);
    
    try {
      const response = await apiService.captureImage(selectedCard);
      
      if (response.error) {
        setStatusMessage({
          type: 'error',
          message: response.error
        });
      } else {
        setStatusMessage({
          type: 'success',
          message: 'Image captured successfully!'
        });
        // Refresh the list of unassigned cards
        fetchUnassignedCards();
      }
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: 'Failed to capture image. Please try again.'
      });
    } finally {
      setIsProcessing(false);
      setIsCameraActive(false);
      apiService.stopCamera().catch(console.error);
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedCard) {
      setStatusMessage({
        type: 'error',
        message: 'Please select a student ID first'
      });
      return;
    }
    
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsProcessing(true);
    setStatusMessage(null);
    
    try {
      const file = files[0];
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        try {
          const base64Image = reader.result as string;
          
          const response = await apiService.assignImage(selectedCard, base64Image);
          
          if (response.error) {
            setStatusMessage({
              type: 'error',
              message: response.error
            });
          } else {
            setStatusMessage({
              type: 'success',
              message: 'Image assigned successfully!'
            });
            // Refresh the list of unassigned cards
            fetchUnassignedCards();
          }
        } catch (error) {
          setStatusMessage({
            type: 'error',
            message: 'Failed to assign image. Please try again.'
          });
        } finally {
          setIsProcessing(false);
        }
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: 'Failed to process image. Please try again.'
      });
      setIsProcessing(false);
    }
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Assign Face to Student ID</h2>
        <p className="text-gray-600">Assign facial biometrics to registered students</p>
      </div>
      
      {statusMessage && (
        <div className={`mb-6 p-4 rounded-lg flex items-start ${
          statusMessage.type === 'success' ? 'bg-green-50 text-green-800' : 
          statusMessage.type === 'error' ? 'bg-red-50 text-red-800' : 
          'bg-blue-50 text-blue-800'
        }`}>
          {statusMessage.type === 'success' ? <Check className="h-5 w-5 mr-2 mt-0.5" /> : 
           statusMessage.type === 'error' ? <AlertCircle className="h-5 w-5 mr-2 mt-0.5" /> :
           <Camera className="h-5 w-5 mr-2 mt-0.5" />
          }
          <span>{statusMessage.message}</span>
        </div>
      )}
      
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Student ID
          </label>
          <select
            value={selectedCard || ''}
            onChange={(e) => setSelectedCard(e.target.value ? Number(e.target.value) : null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            disabled={isProcessing || isCameraActive}
          >
            <option value="">Select a Student ID</option>
            {unassignedCards.map(id => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>
          {unassignedCards.length === 0 && (
            <p className="mt-2 text-sm text-gray-500">
              No unassigned students found. All students have face data or no students are registered.
            </p>
          )}
        </div>
        
        <div className="mb-6">
          <div className="flex space-x-2 mb-4">
            <button
              type="button"
              onClick={() => setCaptureMode('camera')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                captureMode === 'camera' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              disabled={isProcessing}
            >
              <div className="flex items-center justify-center">
                <Camera className="h-4 w-4 mr-2" />
                <span>Use Camera</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setCaptureMode('upload')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                captureMode === 'upload' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              disabled={isProcessing}
            >
              <div className="flex items-center justify-center">
                <Upload className="h-4 w-4 mr-2" />
                <span>Upload Image</span>
              </div>
            </button>
          </div>
          
          {captureMode === 'camera' ? (
            <>
              <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50 aspect-video flex items-center justify-center">
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
              </div>
              
              <div className="flex space-x-2 mt-4">
                <button
                  type="button"
                  onClick={toggleCamera}
                  disabled={isProcessing || !selectedCard}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                    !selectedCard
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : isProcessing
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : isCameraActive
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : isCameraActive ? (
                    <div className="flex items-center justify-center">
                      <CameraOff className="h-4 w-4 mr-2" />
                      <span>Stop Camera</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Camera className="h-4 w-4 mr-2" />
                      <span>Start Camera</span>
                    </div>
                  )}
                </button>
                
                {isCameraActive && (
                  <button
                    type="button"
                    onClick={captureImage}
                    disabled={isProcessing}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                      isProcessing
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Check className="h-4 w-4 mr-2" />
                        <span>Capture</span>
                      </div>
                    )}
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 flex flex-col items-center justify-center">
                <Upload className="h-12 w-12 text-gray-400 mb-2" />
                <p className="text-gray-600 mb-4 text-center">Drag and drop an image or click to browse</p>
                <button
                  type="button"
                  onClick={triggerFileInput}
                  disabled={isProcessing || !selectedCard}
                  className={`py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                    !selectedCard || isProcessing
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isProcessing ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Upload className="h-4 w-4 mr-2" />
                      <span>Select Image</span>
                    </div>
                  )}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                  disabled={isProcessing || !selectedCard}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Supported formats: JPG, PNG, JPEG
                </p>
              </div>
            </>
          )}
        </div>
        
        <div className="text-gray-600 text-sm">
          <p className="font-medium mb-2">Instructions:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Select a student ID from the dropdown</li>
            <li>Choose to either use the camera or upload an existing photo</li>
            <li>For camera capture:
              <ul className="list-disc pl-5 mt-1">
                <li>Click "Start Camera" to activate</li>
                <li>Position the face clearly in the frame</li>
                <li>Click "Capture" to take the photo</li>
              </ul>
            </li>
            <li>For upload:
              <ul className="list-disc pl-5 mt-1">
                <li>Click "Select Image" to choose a file</li>
                <li>The image should clearly show the face</li>
              </ul>
            </li>
            <li>A success message will appear when the face is successfully registered</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AssignFace;