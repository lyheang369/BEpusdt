import axios from "@/api";

// Login
export const loginAPI = (data: any) => {
  return axios({
    url: "/api/auth/login",
    method: "post",
    data
  });
};

// 获取User Information
export const getUserInfoAPI = (params?: any) => {
  return axios({
    url: "/api/auth/info",
    method: "get",
    params
  });
};

// Security Settings
export const securityAPI = (data: any) => {
  return axios({
    url: "/api/auth/security",
    method: "post",
    data
  });
};

// 设置Password
export const setPasswordAPI = (data: any) => {
  return axios({
    url: "/api/auth/set_password",
    method: "post",
    data
  });
};
