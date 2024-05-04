import os
import sys
import dlib
import cv2
import json
import logging

current_dir = os.path.dirname(os.path.abspath(__file__))

# Path to shape predictor model
predictor_path = os.path.join(current_dir, "shape_predictor_68_face_landmarks.dat")
predictor = dlib.shape_predictor(predictor_path)

# Path to face recognition model
face_reco_model_path = os.path.join(current_dir, "dlib_face_recognition_resnet_model_v1.dat")
face_reco_model = dlib.face_recognition_model_v1(face_reco_model_path)

# Frontal face detector
detector = dlib.get_frontal_face_detector()

# Function to convert dlib.vector to a serializable list
def dlib_vector_to_list(vector):
    return [element for element in vector]

# Function to return 128D features for a single image
def return_128d_features(path_img):
    try:
        img_rd = cv2.imread(path_img)
        if img_rd is None:
            raise ValueError(f"Unable to read image at {path_img}")

        faces = detector(img_rd, 1)
        if len(faces) != 0:
            shape = predictor(img_rd, faces[0])
            face_descriptor = face_reco_model.compute_face_descriptor(img_rd, shape)
            face_descriptor_list = dlib_vector_to_list(face_descriptor)  # Convert to list
        else:
            logging.warning(f"No face detected in {path_img}")
            face_descriptor_list = None

        return face_descriptor_list
    except Exception as e:
        logging.error(f"Error processing image {path_img}: {str(e)}")
        return None

if __name__ == "__main__":
    try:
        if len(sys.argv) != 2:
            raise ValueError("Usage: python script.py <image_path>")
        
        image_path = sys.argv[1]
        landmarks = return_128d_features(image_path)

        if landmarks is not None:
            landmarks_json = json.dumps(landmarks)
            print(landmarks_json)
        else:
            print(json.dumps({"error": f"No landmarks detected in {image_path}"}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

