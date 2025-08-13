import axios from 'axios';
import { API_URL } from '../constants/api';

// Using the same base URL
// const API_URL = 'https://localhost:7261';

// Request and response types
interface PasswordResetRequest {
  email: string;
}

interface VerifyResetCodeRequest {
  email: string;
  resetCode: string;
}

interface CompletePasswordResetRequest {
  email: string;
  resetCode: string;
  newPassword: string;
  confirmPassword: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
}

// Initiate password reset (step 1) - request code via email
export const initiatePasswordReset = async (email: string): Promise<ApiResponse> => {
  try {
    const request: PasswordResetRequest = { email };
    const response = await axios.post<ApiResponse>(`${API_URL}/api/PasswordReset/initiate`, request);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return {
      success: false,
      message: 'Error requesting password reset. Please try again later.'
    };
  }
};

// Verify confirmation code (step 2)
export const verifyResetCode = async (email: string, resetCode: string): Promise<ApiResponse> => {
  try {
    const request: VerifyResetCodeRequest = { email, resetCode };
    const response = await axios.post<ApiResponse>(`${API_URL}/api/PasswordReset/verify-code`, request);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return {
      success: false,
      message: 'Error verifying code. Please try again later.'
    };
  }
};

// Complete password reset (step 3) - set new password
export const completePasswordReset = async (
  email: string,
  resetCode: string,
  newPassword: string,
  confirmPassword: string
): Promise<ApiResponse> => {
  try {
    const request: CompletePasswordResetRequest = {
      email,
      resetCode,
      newPassword,
      confirmPassword
    };
    const response = await axios.post<ApiResponse>(`${API_URL}/api/PasswordReset/complete`, request);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return {
      success: false,
      message: 'Error setting new password. Please try again later.'
    };
  }
}; 