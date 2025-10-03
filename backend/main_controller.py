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
from controller.order_controller import OrderController
from controller.family_controller import FamilyController
# from controller.oauth_google_controller import OAuthGoogleController

class MainController:
    def __init__(self, app_instance):
        self.__model_ktp = YOLO("model_detection\\best.pt")
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

        self.__user_controller = UserController(self.__database, self.__google)
        self.__detection_controller = DetectionController(np, Image, re, io, self.__reader, self.__model_ktp, self.__model_kk)
        self.__order_controller = OrderController(self.__database, self.__snap, self.__core_api)
        self.__family_controller = FamilyController(self.__database)
        # self.__google_controller = OAuthGoogleController(self.__google)

    def get_user(self):
        data = self.__user_controller.get_user()
        return data
    
    def get_user_by_id(self, id_user):
        data = self.__user_controller.get_user_by_id(id_user)
        return data
    
    def update_user(self, id_user, data):
        response = self.__user_controller.update_user(id_user, data)
        return response
    
    def login(self, email, password):
        data = self.__user_controller.login(email, password)
        return data
    
    def register(self, email, password, confirm_password):
        data = self.__user_controller.register(email, password, confirm_password)
        return data
    
    def get_session_id(self, session_id):
        data = self.__user_controller.get_session_id(session_id)
        return data

    def detect(self, image_file, option):
        data = self.__detection_controller.detect(image_file, option)
        return data
    
    def delete_image(self, url):
        self.__user_controller.delete_image(url)

    def store_image(self, filename, file_bytes, file):
        data = self.__user_controller.store_image(filename, file_bytes, file)
        return data
    
    def login_google(self, redirect_uri):
        data = self.__user_controller.login_google(redirect_uri)
        return data
    
    def authorize(self):
        data = self.__user_controller.authorize()
        return data
    
    def get_status_payment(self, id_order):
        data = self.__order_controller.get_status_payment(id_order)
        return data

    def create_transaction(self, data):
        data = self.__order_controller.create_transaction(data)
        return data
    
    def payment_callback(self, midtrans_notification):
        data = self.__order_controller.payment_callback(midtrans_notification)
        return data
    
    def get_family_by_id_user(self, id_user):
        data = self.__family_controller.get_family_by_id_user(id_user)
        return data
    
    def get_family_by_id_user_and_name(self, id_user, name):
        data = self.__family_controller.get_family_by_id_user_and_name(id_user, name)
        return data
    
    def add_family(self, id_user, data):
        data = self.__family_controller.add_family(id_user, data)
        return data

    # def _get_family_by_id_user(self, id_user):
    #     data = self.__controller.get_family_by_id_user(id_user)
    #     return jsonify({"status": "Data received", "data": data}), 200
    
    # def _get_family_by_id_user_and_name(self, id_user, name):
    #     data = self.__controller.get_family_by_id_user_and_name(id_user, name)
    #     return jsonify({"status": "Data received", "data": data}), 200
    
    # def _add_family(self, id_user):
    #     data = request.json
    #     data = self.__controller.add_family(id_user, data)
    #     return jsonify({"status": "Data received", "data": data}), 200
