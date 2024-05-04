import cv2
import dlib
import numpy as np
import pymongo
from scipy.spatial.distance import cosine
import json
from bson import ObjectId
import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))

# Dlib initialization for face detection and recognition
detector = dlib.get_frontal_face_detector()

predictor_path = os.path.join(current_dir, "shape_predictor_68_face_landmarks.dat")
sp = dlib.shape_predictor(predictor_path)

face_reco_model_path = os.path.join(current_dir, "dlib_face_recognition_resnet_model_v1.dat")
facerec = dlib.face_recognition_model_v1(face_reco_model_path)


client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["test"]
collection = db["employees"]
def get_face_embeddings(image):
    dets = detector(image, 1)
    if len(dets) == 0:
        return None
    faces = dlib.full_object_detections()
    for detection in dets:
        faces.append(sp(image, detection))
    descriptors = [np.array(facerec.compute_face_descriptor(image, face_pose, 1)) for face_pose in faces]
    return descriptors

def find_person(image):
    embeddings = get_face_embeddings(image)
    if embeddings is None:
        return None
    for embedding in embeddings:
        # Search in the database for matching embeddings
        cursor = collection.find({})
        for document in cursor:
            db_embedding = np.array(document["landmarks"])
            distance = cosine(embedding, db_embedding)
            if distance < 0.6:  # Adjust this threshold as needed
                return document["_id"]
    return None
if len(sys.argv) != 2:
    raise ValueError("Usage: python script.py <image_path>")

image_path = sys.argv[1]
    
# Load the image
image = cv2.imread(image_path)
person_id = find_person(image)

if person_id is not None:
    print(json.dumps({"person_id": str(person_id)}))
    sys.exit(0)
else:
    print(json.dumps({"error": "No matching person found"}))
    sys.exit(1)
    
