/* eslint-disable */
import { showAlert } from "./alerts";

import axios from "axios";

export const signup = async (name, email, password, passwordConfrim) => {
  try {
    const res = await axios.post("/api/v1/users/signup", {
      name: name,
      email: email,
      password: password,
      passwordConfirm: passwordConfrim,
    });

    console.log(res);
    if (res.data.status === "success") {
      window.setTimeout(() => {
        location.assign("/");
      }, 2000);
    }
  } catch (err) {
    console.log(err.response.data);
    showAlert("error", err.message);
  }
};
