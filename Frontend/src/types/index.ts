export interface Student {
  id?: number;
  Name: string;
  Reg_No: string;
  DOB: string;
  Blood_Group: string;
  Phone: string;
  Dept: string;
  Gender: string;
  Bio: string;
  Created_At?: string;
}

export interface ApiResponse {
  message: string;
  student?: Student;
  error?: string;
}

export interface CardScanResult {
  success: boolean;
  student?: Student;
  message: string;
}