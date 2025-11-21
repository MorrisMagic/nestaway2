const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const auth = require("./routes/auth");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");

require("dotenv").config();

const app = express();
app.use(cookieParser());

app.use(express.json());
app.use(cors({origin:"http://localhost:3000",credentials:true}));

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.use("/api/auth", auth);

app.listen(5000, () => console.log("Server running on 5000"),connectDB());
