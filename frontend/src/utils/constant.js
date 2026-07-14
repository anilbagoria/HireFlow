const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || (import.meta.env.DEV ? "http://localhost:8000" : "https://hireflow-hzv5.onrender.com");

export const USER_API_END_POINT = `${apiBaseUrl}/api/v1/user`;
export const JOB_API_END_POINT = `${apiBaseUrl}/api/v1/job`;
export const APPLICATION_API_END_POINT = `${apiBaseUrl}/api/v1/application`;
export const COMPANY_API_END_POINT = `${apiBaseUrl}/api/v1/company`;
export const INTERVIEW_API_END_POINT = `${apiBaseUrl}/api/v1/interview`;