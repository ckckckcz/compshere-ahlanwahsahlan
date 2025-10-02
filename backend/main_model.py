import os
from supabase import create_client, Client

from model.user_model import UserModel
from model.role_model import RoleModel

class MainModel:
    def __init__(self):
        self.__url = os.getenv("SUPABASE_URL")
        self.__key = os.getenv("SUPABASE_KEY")
        self.__database = create_client(self.__url, self.__key)

        self.__user_model = UserModel(self.__database)
        self.__role_model = RoleModel(self.__database)

    def get_database(self):
        return self.__database

# User
    
    def get_user(self):
        return self.__user_model.get_user()
    
    def get_user_by_id(self, id_user):
        return self.__user_model.get_user_by_id(id_user)
    
    def get_user_by_email(self, email):
        return self.__user_model.get_user_by_email(email)
    
    def update_user(self, id_user, data):
        response = self.__user_model.update_user(id_user, data)
        return response
    
    def login(self):
        return self.__user_model.login()
    
    def add_user(self, email, password, id_role):
        print('test')
        return self.__user_model.add_user(email, password, id_role)

# Role 
    def get_role_by_role(self, role_name):
        return self.__role_model.get_role_by_role(role_name)
    
    def delete_image(self, url):
        self.__user_model.delete_image(url)

    def store_image(self, filename, file_bytes, file):
        data = self.__user_model.store_image(filename, file_bytes, file)
        return data
            