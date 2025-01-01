import axios from "axios";

export const makeApi = async (
  endpoint,
  method = "GET",
  data
) => {
  try {
    const token = localStorage.getItem("token");


    // if (!token && endpoint.includes("/auth-required")) {
    //   throw new Error("Please login to access this resource.");
    // }

    const headers = {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : ""
    };

    const config = {
      method,
      // url: `https://test.ritaz.in${endpoint}`, 
      // url: `https://sk-backend-uvv5.onrender.com${endpoint}`,
      // url: `https://new-food-backend-fdoa.onrender.com${endpoint}`,
      url: `https://blliv-food.onrender.com${endpoint}`,
      // url:"http://localhost:5008"+endpoint,
      headers,
      data 
    };

    const response = await axios(config);
    return response;
  } catch (error) {
    console.error("API request failed:", error.response.data);
    throw error;
  }
};
