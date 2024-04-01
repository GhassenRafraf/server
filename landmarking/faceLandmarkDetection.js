const dlib = require("dlib");

async function detectLandmarks(imageData) {
  try {
    const shapePredictor = new dlib.shape_predictor();
    shapePredictor.load(".dat");
    const buffer = Buffer.from(imageData, "base64");
    const image = dlib.load_image(buffer);
    const faces = dlib.get_frontal_face_detector()(image);
    const landmarks = faces.map((face) => shapePredictor(image, face));
    const landmarkCoordinates = landmarks.map((landmark) => {
      return Array.from(landmark.parts).map((part) => ({
        x: part.x,
        y: part.y,
      }));
    });

    return landmarkCoordinates;
  } catch (error) {
    console.error("Error detecting facial landmarks:", error);
    throw error;
  }
}

module.exports = { detectLandmarks };
