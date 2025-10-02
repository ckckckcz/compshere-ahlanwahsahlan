from main_model import MainModel

from authlib.integrations.flask_client import OAuth
import midtransclient
import os
from ultralytics import YOLO
from PIL import Image
import numpy as np
import easyocr
import re
import io

from controller.user_controller import UserController
from controller.detection_controller import DetectionController

class MainController:
    def __init__(self, app_instance):
        self.__model_ktp = YOLO("model_detection\\model_ktp.pt")
        self.__model_kk = YOLO("model_detection\\model_kk.pt")
        self.__reader = easyocr.Reader(['id'], gpu=False)

        self.__oauth = OAuth(app_instance)
        self.__google = self.__oauth.register(
            "myApp",
            client_id = os.getenv("GOOGLE_CLIENT_ID"),
            client_secret = os.getenv("GOOGLE_CLIENT_SECRET"),
            server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
            client_kwargs={'scope': 'openid email profile'},
        )

        self.__snap = midtransclient.Snap(
            is_production=False,
            server_key=os.getenv("SERVER_KEY_MIDTRANS"),
            client_key=os.getenv("CLIENT_KEY_MIDTRANS")
        )

        self.__core_api = midtransclient.CoreApi(
            is_production=False,
            server_key=os.getenv("SERVER_KEY_MIDTRANS"),
            client_key=os.getenv("CLIENT_KEY_MIDTRANS")
        )

        self.__database = MainModel()

        self.__user_controller = UserController(self.__database)
        self.__detection_controller = DetectionController(np, Image, re, io, self.__reader, self.__model_ktp, self.__model_kk)

    def get_user(self):
        data = self.__user_controller.get_user()
        return data
    
    def get_user_by_id(self, id_user):
        data = self.__user_controller.get_user_by_id(id_user)
        return data
    
    def login(self, email, password):
        data = self.__user_controller.login(email, password)
        return data
    
    def register(self, email, password, confirm_password):
        data = self.__user_controller.register(email, password, confirm_password)
        return data

    def detect(self, image_file, option):
        data = self.__detection_controller.detect(image_file, option)
        return data
    
    # def detect(self, image_file, option):
    #     image = Image.open(io.BytesIO(image_file))
    #     img_np = np.array(image)  
    #     if option == 'ktp':
    #         results = self.__model_ktp(image, verbose=False)
    #         data = self.__find_box_name_and_nik_ktp(results, img_np)
    #     elif option == 'kk':
    #         results = self.__model_kk(image, verbose=False)
    #         data = self.__find_box_name_and_nik_kk(results, img_np)
    #     return data
    
    # def __find_box_name_and_nik_ktp(self, results, image):
    #     bbox_nama = None
    #     bbox_nik = None
    #     bbox_jenis_kelamin = None

    #     for r in results:
    #         class_names = r.names
    #         for box in r.boxes:
    #             class_id = box.cls
    #             class_name = class_names[int(class_id)]
    #             x1, y1, x2, y2 = box.xyxy[0].cpu().numpy().astype(int)

    #             if class_name == 'NAMA' and bbox_nama is None:
    #                 bbox_nama = (x1, y1, x2, y2)
    #             elif class_name == 'NIK' and bbox_nik is None:
    #                 bbox_nik = (x1, y1, x2, y2)
    #             elif class_name == 'JK' and bbox_jenis_kelamin is None:
    #                 bbox_jenis_kelamin = (x1, y1, x2, y2)

    #     if bbox_nama is not None and bbox_nik is not None:

    #         cropped_area_name = image[bbox_nama[1]:bbox_nama[3], bbox_nama[0]:bbox_nama[2]]
    #         cropped_area_nik = image[bbox_nik[1]:bbox_nik[3], bbox_nik[0]:bbox_nik[2]]
    #         cropped_area_jenis_kelamin = image[bbox_jenis_kelamin[1]:bbox_jenis_kelamin[3], bbox_jenis_kelamin[0]:bbox_jenis_kelamin[2]]    

    #         ocr_nama = self.__ocr_image_ktp(cropped_area_name)
    #         ocr_nik = self.__ocr_image_ktp(cropped_area_nik)
    #         ocr_jenis_kelamin = self.__ocr_image_ktp(cropped_area_jenis_kelamin)

    #         if re.match(('L\w*'), ocr_jenis_kelamin, re.IGNORECASE):
    #             ocr_jenis_kelamin = 'LAKI-LAKI'
    #         elif re.match(('P\w*'), ocr_jenis_kelamin, re.IGNORECASE):
    #             ocr_jenis_kelamin = 'PEREMPUAN'
    #         else:
    #             ocr_jenis_kelamin = None

    #         return {
    #             "name": ocr_nama,
    #             "nik": ocr_nik,
    #             "gender": ocr_jenis_kelamin
    #         }
    #     else:
    #         return {"error": "Could not find both 'nama' and 'nik' in the image."}
        
    # def __ocr_image_ktp(self, cropped_area):
    #     result = self.__reader.readtext(cropped_area)
        
    #     cleaned_result = ''
    #     for bbox, text, conf in result:
    #         cleaned_result = text.strip().upper()

    #     return cleaned_result
     

    # def __find_box_name_and_nik_kk(self, results, image):
    #     bbox_nama_lengkap = None
    #     bbox_jenis_kelamin = None

    #     for r in results:
    #         class_names = r.names
    #         for box in r.boxes:
    #             class_id = box.cls
    #             class_name = class_names[int(class_id)]
    #             x1, y1, x2, y2 = box.xyxy[0].cpu().numpy().astype(int)

    #             if class_name == 'nama_lengkap':
    #                 bbox_nama_lengkap = (x1, y1, x2, y2)
    #             elif class_name == 'jenis_kelamin':
    #                 bbox_jenis_kelamin = (x1, y1, x2, y2)

    #     if bbox_nama_lengkap is not None and bbox_jenis_kelamin is not None:
    #         x_start_combined = min(bbox_nama_lengkap[0], bbox_jenis_kelamin[0])
    #         y_start_combined = bbox_nama_lengkap[1]
    #         x_end_combined = max(bbox_nama_lengkap[2], bbox_jenis_kelamin[2])
    #         y_end_combined = bbox_jenis_kelamin[3]

    #         x_start_combined = max(0, x_start_combined)
    #         y_start_combined = max(0, y_start_combined)
    #         x_end_combined = min(image.shape[1], x_end_combined)
    #         y_end_combined = min(image.shape[0], y_end_combined)

    #         cropped_area_original = image[y_start_combined:y_end_combined, 
    #                                             x_start_combined:x_end_combined]
    #         return self.__get_name_and_nik_kk(cropped_area_original)
    #     else:
    #         return {"error": "Could not find both 'nama_lengkap' and 'nik' in the image."}

     
    # def __get_name_and_nik_kk(self, cropped_area_original):
    #     num_row = 0
    #     data = []
        
    #     ocr_results = self.__reader.readtext(cropped_area_original)
    #     pola = r"(NAMA(?:\s\w+)*|NIK\w*|JENIS\w*|KELAMIN\w*|\(|\)|\(\d*\))"
            
    #     temp = {}  
    #     for (bbox, text, prob) in ocr_results:
    #         if re.match(pola, text, re.IGNORECASE) or text in ('1', '2', '3'):
    #             continue

    #         if num_row % 3 == 0:
    #             temp['name'] = text.strip().upper()
    #         elif num_row % 3 == 1:
    #             temp['nik'] = text.replace(" ", "").strip()
    #         elif num_row % 3 == 2:
    #             gender = text.strip().upper()
    #             if re.match(('L\w*'), gender, re.IGNORECASE):
    #                 temp['gender'] = 'LAKI-LAKI'
    #             elif re.match(('P\w*'), gender, re.IGNORECASE):
    #                 temp['gender'] = 'PEREMPUAN'
    #             else:
    #                 temp['gender'] = None
    #             data.append(temp)  
    #             temp = {} 

    #         num_row += 1

    #     return data
