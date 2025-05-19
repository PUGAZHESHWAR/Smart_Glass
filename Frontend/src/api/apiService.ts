const API_BASE_URL = 'http://localhost:5000/api';

export const apiService = {
  // Student management
  addStudent: async (studentData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error adding student:', error);
      throw error;
    }
  },
  
  // Camera controls
  startCamera: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/start-camera`, {
        method: 'POST',
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error starting camera:', error);
      throw error;
    }
  },
  
  stopCamera: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stop-camera`, {
        method: 'POST',
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error stopping camera:', error);
      throw error;
    }
  },
  
  // Image capture and assignment
  captureImage: async (cardId: string | number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/capture-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_id: cardId })
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error capturing image:', error);
      throw error;
    }
  },
  
  assignImage: async (cardId: string | number, imageData: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/assign-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_id: cardId, image: imageData })
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error assigning image:', error);
      throw error;
    }
  },
  
  getUnassignedCards: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/unassigned-cards`);
      return await response.json();
    } catch (error) {
      console.error('Error getting unassigned cards:', error);
      throw error;
    }
  }
};