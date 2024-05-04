const { spawn } = require('child_process');
const fs = require('fs');
const multer = require('multer');

// Set up multer for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './raspberryUploads'); // Uploads will be saved in the 'uploads' directory
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Use the original filename
    }
});
const upload = multer({ storage: storage });

// Function to handle attendance
function attendance(imagePath, callback) {
    const pythonProcess = spawn('python', ['./checkAccess/attendance_taker.py', imagePath]);
    let errorData = '';
    
    // Log data from stderr
    pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
        console.error(`Python Script (stderr): ${data}`);
    });

    pythonProcess.on('close', (code) => {
        fs.unlinkSync(imagePath); // Delete the uploaded image file
        if (code === 0) {
            // Image processed successfully
            callback(null, true);
        } else {
            callback(errorData, null);
        }
    });
}

// Endpoint to handle image uploads
function handleUpload(req, res) {
    upload.single('image')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A multer error occurred (e.g., file size exceeded)
            return res.status(400).json({ error: 'File upload error' });
        } else if (err) {
            // An unexpected error occurred
            return res.status(500).json({ error: 'Internal server error' });
        }
        
        // Call attendance function with the uploaded image path
        const imagePath = req.file.path;
        attendance(imagePath, function (error, result) {
            if (error) {
                return res.status(500).json({ error: error });
            } else {
                return res.status(200).json({ result: result });
            }
        });
    });
}

module.exports = { handleUpload };
