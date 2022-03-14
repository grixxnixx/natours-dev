/* eslint-disable */
import axios from "axios";
import { showAlert } from "./alerts";

export const login = async (email, password) => {
  try {
    const res = await axios.post("/api/v1/users/login", {
      email,
      password,
    });

    if (res.data.status === "success") {
      showAlert("success", "Log in successfully", 3);
      window.setTimeout(() => {
        location.assign("/");
      }, 1500);
    }
  } catch (err) {
    showAlert("error", err.response.data.message, 3);
  }
};

export const logout = async () => {
  try {
    const res = await axios.get("/api/v1/users/logout");

    if (res.data.status === "success") {
      showAlert("success", "Logout successfully!");
      location.reload(true);
    }
  } catch (err) {
    console.log(err.response);
    showAlert("error", "Error Logging out. try later!");
  }
};
