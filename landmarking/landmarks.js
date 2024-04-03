const { spawn } = require('child_process');
const fs = require('fs');

function detectLandmarks(imagePath, callback) {
    const pythonProcess = spawn('python', ['./landmarking/faceLandmarks.py', imagePath]);
    let landmarksData = '';
    let errorData = '';
    pythonProcess.stdout.on('data', (data) => {
        landmarksData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
    });

    pythonProcess.on('close', (code) => {
        fs.unlinkSync(imagePath);
        if (code === 0) {
            callback(null, JSON.parse(landmarksData));
        } else {
            callback(errorData, null);
        }
    });
}

module.exports = { detectLandmarks };
