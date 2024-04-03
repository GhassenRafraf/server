import dlib
import cv2
import json
import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))

predictor_path = os.path.join(current_dir, "shape_predictor_68_face_landmarks.dat")

predictor = dlib.shape_predictor(predictor_path)
detector = dlib.get_frontal_face_detector()

def detect_landmarks(image_path):
    try:
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError("Unable to read the image file")
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        faces = detector(gray)
        landmarks_data = []
        for face in faces:
            landmarks = predictor(gray, face)
            landmarks_dict = {}
            for i in range(0, 68):
                landmarks_dict[i] = (landmarks.part(i).x, landmarks.part(i).y)
            landmarks_data.append(landmarks_dict)

        return landmarks_data
    except Exception as e:
        return str(e)

if __name__ == "__main__":
    try:
        if len(sys.argv) != 2:
            raise ValueError("Usage: python script.py <image_path>")
        image_path = sys.argv[1]
        landmarks = detect_landmarks(image_path)
        if isinstance(landmarks, list):
            landmarks_json = json.dumps(landmarks)
            print(landmarks_json)
        else:
            print(json.dumps({"error": landmarks}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
