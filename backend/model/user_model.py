class UserModel:
    def __init__(self, database):
        self.__database = database

    def get_user(self):
        response = self.__database.table('user').select('*').execute()
        return response.data
    
    def get_user_by_id(self, id_user):
        response = self.__database.table('user').select('*').eq('id', id_user).execute()
        return response.data[0] if response.data else None
    
    def get_user_by_email(self, email):
        response = self.__database.table('user').select('*').eq('email', email).execute()
        return response.data[0] if response.data else None
    
    def login(self):
        response = self.__database.table('user').select('*').execute()
        return response.data
    
    def add_user(self, email, password, id_role):
        data = {"email": email, "password": password, "id_role": id_role}
        response = self.__database.table('user').insert(data).execute()
        return response.data[0]