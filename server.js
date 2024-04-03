if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const cors = require("cors");
const connectToDb = require("./config/connectToDb");
const employeeControllers = require("./controllers/employeeControllers");
const { detectLandmarks } = require("./landmarking/landmarks");
const http = require("http");
const multer = require("multer");

const app = express();
const server = http.createServer(app);
app.use(cors());
app.use(express.json());

connectToDb();
// Routes
app.post("/addMember", employeeControllers.addMember);
app.delete("/removeMember/:id", employeeControllers.removeMember);
app.get("/fetchMembers", employeeControllers.fetchMembers);
app.put("/updateMember/:id", employeeControllers.updateMember);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

app.post('/detectLandmarks', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      throw new Error('No file uploaded');
    }
    const imagePath = req.file.path;
    detectLandmarks(imagePath, (error, landmarks) => {
      if (error) {
        res.status(500).json({ success: false, error: error.message });
      } else {
        res.json({ success: true, landmarks: landmarks });
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
