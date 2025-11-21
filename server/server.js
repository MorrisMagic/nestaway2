const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const auth = require("./routes/auth");
const properties = require("./routes/properties");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");

require("dotenv").config();

const app = express();
app.use(cookieParser());
app.use(cors({origin:"http://localhost:3000",credentials:true}));

// Body parsing middleware - but note: multer handles multipart/form-data
// Only parse JSON and URL-encoded bodies, not multipart/form-data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Routes
app.use("/api/auth", auth);
app.use("/api/properties", properties);

app.listen(5000, () => console.log("Server running on 5000"), connectDB());