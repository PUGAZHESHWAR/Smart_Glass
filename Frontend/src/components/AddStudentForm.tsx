import React, { useState } from 'react';
import { apiService } from '../api/apiService';
import { AlertCircle, Check } from 'lucide-react';
import { Student } from '../types';

const departments = ['AI&DS','CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT'];
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const AddStudentForm: React.FC = () => {
  const [formData, setFormData] = useState<Student>({
    Name: '',
    Organization: '',
    Reg_No: '',
    Performance: '',
    DOB: '',
    Blood_Group: '',
    Phone: '',
    Dept: '',
    Gender: '',
    Remarks: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string } | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.Name.trim()) newErrors.Name = 'Name is required';
    if (!formData.Organization.trim()) newErrors.Organization = 'Name is required';
    if (!formData.Reg_No.trim()) newErrors.Reg_No = 'Registration number is required';
    if (!formData.Performance.trim()) newErrors.Performance = 'Name is required';
    if (!formData.DOB) newErrors.DOB = 'Date of birth is required';
    if (!formData.Blood_Group) newErrors.Blood_Group = 'Blood group is required';
    if (!formData.Phone.trim()) {
      newErrors.Phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.Phone)) {
      newErrors.Phone = 'Phone number must be 10 digits';
    }
    if (!formData.Dept) newErrors.Dept = 'Department is required';
    if (!formData.Gender) newErrors.Gender = 'Gender is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
    
    // Clear status message when form is edited after submission
    if (submitStatus) {
      setSubmitStatus(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      const response = await apiService.addStudent(formData);
      
      if (response.error) {
        setSubmitStatus({ success: false, message: response.error });
      } else {
        setSubmitStatus({ success: true, message: 'Student added successfully!' });
        // Reset form on success
        setFormData({
          Name: '',
          Organization: '',
          Reg_No: '',
          Performance: '',
          DOB: '',
          Blood_Group: '',
          Phone: '',
          Dept: '',
          Gender: '',
          Remarks: ''
        });
      }
    } catch (error) {
      setSubmitStatus({ 
        success: false, 
        message: 'An error occurred. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Add New Student</h2>
        <p className="text-gray-600">Enter student details to register in the system</p>
      </div>
      
      {submitStatus && (
        <div className={`mb-6 p-4 rounded-lg flex items-start ${
          submitStatus.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {submitStatus.success ? 
            <Check className="h-5 w-5 mr-2 mt-0.5" /> : 
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
          }
          <span>{submitStatus.message}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              name="Name"
              value={formData.Name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.Name ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Full Name"
            />
            {errors.Name && <p className="mt-1 text-sm text-red-600">{errors.Name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name of the University/Institution/Organization/School:
            </label>
            <input
              type="text"
              name="Organization"
              value={formData.Organization}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.Organization ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="e.g. Stekom University, IIT Madras, CBSE School, Infosys"
            />
            {errors.Organization && <p className="mt-1 text-sm text-red-600">{errors.Organization}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Performance of the student :
            </label>
            <input
              type="text"
              name="Performance"
              value={formData.Performance}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.Perormance ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Grade, CGPA, Percentage, etc."
            />
            {errors.Performance && <p className="mt-1 text-sm text-red-600">{errors.Performance}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Registration Number
            </label>
            <input
              type="text"
              name="Reg_No"
              value={formData.Reg_No}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.Reg_No ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="e.g. 2023001"
            />
            {errors.Reg_No && <p className="mt-1 text-sm text-red-600">{errors.Reg_No}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              name="DOB"
              value={formData.DOB}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.DOB ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.DOB && <p className="mt-1 text-sm text-red-600">{errors.DOB}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Blood Group
            </label>
            <select
              name="Blood_Group"
              value={formData.Blood_Group}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.Blood_Group ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white`}
            >
              <option value="">Select Blood Group</option>
              {bloodGroups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
            {errors.Blood_Group && <p className="mt-1 text-sm text-red-600">{errors.Blood_Group}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              name="Phone"
              value={formData.Phone}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.Phone ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="10-digit number"
              maxLength={10}
            />
            {errors.Phone && <p className="mt-1 text-sm text-red-600">{errors.Phone}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              name="Dept"
              value={formData.Dept}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.Dept ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white`}
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            {errors.Dept && <p className="mt-1 text-sm text-red-600">{errors.Dept}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <div className="flex space-x-4 mt-1">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="Gender"
                  value="Male"
                  checked={formData.Gender === 'Male'}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Male</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="Gender"
                  value="Female"
                  checked={formData.Gender === 'Female'}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Female</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="Gender"
                  value="Other"
                  checked={formData.Gender === 'Other'}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Other</span>
              </label>
            </div>
            {errors.Gender && <p className="mt-1 text-sm text-red-600">{errors.Gender}</p>}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Remarks <span className="text-gray-500 text-xs">(Optional)</span>
          </label>
          <textarea
            name="Remarks"
            value={formData.Remarks}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Brief description about the student"
          ></textarea>
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2 px-4 rounded-md text-white font-medium 
              ${isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200'
              }`}
          >
            {isSubmitting ? 'Processing...' : 'Add Student'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStudentForm;