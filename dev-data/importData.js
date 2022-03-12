const fs = require("fs");

const Tour = require("../models/tourModel");
const User = require("../models/userModel");

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8"));
console.log(tours);

const importData = async () => {
  await Tour.create();
};
