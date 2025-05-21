export interface Student {
  id?: number;
  Name: string;
  Organization: string;
  Performance: string;
  Reg_No: string;
  DOB: string;
  Blood_Group: string;
  Phone: string;
  Dept: string;
  Gender: string;
  Remarks: string;
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