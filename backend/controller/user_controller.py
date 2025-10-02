import bcrypt
class UserController:
    def __init__(self, database, google):
        self.__model = database
        self.__google = google

    def login_google(self, redirect_uri):
        return self.__google.authorize_redirect(redirect_uri)
    
    def authorize(self):
        token = self.__google.authorize_access_token()
        return token

    def get_user(self):
        data = self.__model.get_user()
        return data
    
    def get_user_by_id(self, id_user):
        data = self.__model.get_user_by_id(id_user)
        return data
    
    def __verify_password(self, password, hashed_password):
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
    
    def login(self, email, password):
        if not all([email, password]):
            return {'status': 'error', 'message': 'Missing email or password'}
        
        response = self.__model.get_user_by_email(email)

        if response is None:
            return {'status': 'error', 'message': 'User not found'}

        if not self.__verify_password(password, response['password']):
            return {'status': 'error', 'message': 'Invalid password'}
        
        return {'status': 'success', 'data': response}
    
    def update_user(self, id_user, data):
        data = self.__model.update_user(id_user, data)
        return data
    
    def register(self, email, password, confirm_password):
        if not all([email, password, confirm_password]):
            return {'status' : 'error', 'message' : 'Invalid data'}

        if password != confirm_password:
            return {'status' : 'error', 'message' : 'Password and confirm password not match'}

        role = self.__model.get_role_by_role('User')

        if role is None:
            return {'status' : 'error', 'message' : 'Role not found'}

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        data = self.__model.add_user(email, hashed_password, role['id'])

        return {'status': 'success', 'data': data}
    
    def get_session_id(self, session_id):
        if not session_id or not session_id.startswith("user_"):
            return {'status': 'error', 'message': 'No valid session'}
        
        user_id = session_id.replace("user_", "")

        response = self.__model.get_user_by_id(user_id)

        if hasattr(response, "error") and response.error:
            return {'status' : 'error', 'message' : response.error.message}
        if not response.data:
            return {'status' : 'error', 'message' : 'User not founf'}
        
        return {'status': 'success', 'data': {
            "user_id": response["id"],
            "email": response["email"],
            "nama_keluarga": response["nama_keluarga"] or "User"
        }}
    
    def delete_image(self, url):
        self.__model.delete_image(url)

    def store_image(self, filename, file_bytes, file):
        data = self.__model.store_image(filename, file_bytes, file)
        return data
            




        
        