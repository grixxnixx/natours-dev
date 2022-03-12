/* eslint-disable */
import axios from "axios";
import { showAlert } from "./alerts";

export const updateSettings = async (data, type) => {
  try {
    const url =
      type === "password"
        ? "http://127.0.0.1:8000/api/v1/users/updatePassword"
        : "http://127.0.0.1:8000/api/v1/users/updateMe";

    const res = await axios({
      method: "PATCH",
      url,
      data,
    });

    console.log(res);

    if (res.data.status === "success") {
      showAlert("success", `${type.toUpperCase()} updated succussfully`, 5);
      location.reload(true);
    }
  } catch (err) {
    console.log(err.response.data);
    showAlert("error", err.response.data.message);
  }
};
