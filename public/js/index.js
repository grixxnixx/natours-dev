/* eslint-disable */
import "@babel/polyfill";
import { displayMap } from "./mapbox";
import { login, logout } from "./login";
import { updateSettings } from "./updateSettings";
import { bookTour } from "./stripe";
import axios from "axios";
import { signup } from "./signup";

const mapBox = document.getElementById("map");
const loginForm = document.querySelector(".form-login");
const signupForm = document.querySelector(".form-signup");
const logoutBtn = document.querySelector(".nav__el--logout");
const formUserData = document.querySelector(".form-user-data");
const userPasswordForm = document.querySelector(".form-user-password");
const bookingBtn = document.querySelector("#book-tour");
const searchBtn = document.querySelector(".nav__search");

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    login(email, password);
  });
}

if (signupForm) {
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log("ehy");
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("passwordConfirm").value;
    console.log(email, name, password, passwordConfirm);
    signup(name, email, password, passwordConfirm);
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", logout);
}

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (formUserData) {
  formUserData.addEventListener("submit", (e) => {
    e.preventDefault();

    const form = new FormData();

    form.append("name", document.getElementById("name").value);
    form.append("email", document.getElementById("email").value);
    form.append("photo", document.getElementById("photo").files[0]);

    updateSettings(form, "data");
  });
}

if (userPasswordForm)
  userPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.querySelector(".btn--save-password").textContent = "Updating...";

    const passwordCurrent = document.getElementById("password-current").value;
    const newPassword = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("password-confirm").value;

    await updateSettings(
      { passwordCurrent, newPassword, passwordConfirm },
      "password"
    );

    document.querySelector(".btn--save-password").textContent = "Save password";
    document.getElementById("password-current").value = "";
    document.getElementById("password").value = "";
    document.getElementById("password-confirm").value = "";
  });

if (bookingBtn) {
  bookingBtn.addEventListener("click", () => {
    bookingBtn.textContent = "Processing...";
    const tourId = bookingBtn.dataset.tourId;
    bookTour(tourId);
  });
}

searchBtn.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("hey");
  const keyword = document.querySelector(".nav__search-input").value;
  const url = `http://127.0.0.1:8000?keyword=${keyword}`;

  location.assign(url);
  // const res = await axios.get(`/api/v1/tours?keyword=${keyword}`);

  // console.log(res.data);
});
