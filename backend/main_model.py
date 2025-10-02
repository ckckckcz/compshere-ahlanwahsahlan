import os
from supabase import create_client, Client

from model.user_model import UserModel

class MainModel:
    def __init__(self):
        self.__url = os.getenv("SUPABASE_URL")
        self.__key = os.getenv("SUPABASE_KEY")
        self.__database = create_client(self.__url, self.__key)

        self.__user_model = UserModel(self.__database)

    def get_database(self):
        return self.__database
    
    def get_user(self):
        return self.__user_model.get_user()
    
    def get_user_by_id(self, id_user):
        return self.__user_model.get_user_by_id(id_user)
    
    def get_user_by_email(self, email):
        return self.__user_model.get_user_by_email(email)
    
    def login(self):
        return self.__user_model.login()
    
            