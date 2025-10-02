import bcrypt
class UserController:
    def __init__(self, database):
        self.__database = database

    def get_user(self):
        data = self.__database.get_user()
        return data
    
    def get_user_by_id(self, id_user):
        data = self.__database.get_user_by_id(id_user)
        return data
    
    def __verify_password(self, password, hashed_password):
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
    
    def login(self, email, password):
        if not all([email, password]):
            return {'status': 'error', 'message': 'Missing email or password'}
        
        response = self.__database.get_user_by_email(email)

        if response is None:
            return {'status': 'error', 'message': 'User not found'}

        if not self.__verify_password(password, response['password']):
            return {'status': 'error', 'message': 'Invalid password'}
        
        return {'status': 'success', 'data': response}

        
        