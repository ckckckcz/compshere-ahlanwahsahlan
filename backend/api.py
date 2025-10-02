from flask import request, url_for, session, jsonify, make_response
from flask_cors import CORS
from dotenv import load_dotenv
from main_controller import MainController
import os

class Api:
    def __init__(self, app_instance):
        load_dotenv()
        self._app = app_instance
        self.__controller = MainController(app_instance)
        
        # Enable CORS for all routes
        CORS(self._app, origins=["http://localhost:3000", "https://*.ngrok-free.app"], 
             supports_credentials=True)

        self.__setup_routes()

    def __setup_routes(self):
        self._app.add_url_rule('/get/user', view_func=self._get_user, methods=['GET'])
        self._app.add_url_rule('/api/user/<id_user>', view_func=self._get_user_by_id, methods=['GET'])
        self._app.add_url_rule('/api/login', view_func=self._login, methods=['POST'])
        self._app.add_url_rule('/api/register', view_func=self._register, methods=['POST'])
        self._app.add_url_rule('/api/user/session', view_func=self._get_user_session, methods=['GET'])
        self._app.add_url_rule('/api/complete-profile', view_func=self._update_user, methods=['POST'])
        # self._app.add_url_rule('/delete/user/<id_user>', view_func=self._delete_user, methods=['DELETE'])  
        # self._app.add_url_rule('/delete/user/foto/<id_user>', view_func=self._delete_user_foto, methods=['DELETE']) 

        self._app.add_url_rule('/api/send/<option>', view_func=self._send_identity, methods=['POST'])
        
        # self._app.add_url_rule('/get/status/payment', view_func=self._get_status_payment, methods=['GET'])
        # self._app.add_url_rule('/create/transaction', view_func=self._create_transaction, methods=['POST'])
        # self._app.add_url_rule('/callback/transaction', view_func=self._callback_transaction, methods=['POST'])

        # self._app.add_url_rule('/login/google', view_func=self._login_google, methods=['GET'])   
        # self._app.add_url_rule('/authorize', view_func=self._authorize, methods=['GET'], endpoint='authorize')

    def _get_user(self):
        data = self.__controller.get_user()
        return jsonify({"status": "Data received", "data": data}), 200
    
    def _get_user_by_id(self, id_user):
        try:
            print(f"Fetching user with ID: {id_user}")
            data = self.__controller.get_user_by_id(id_user)
            print(f"User data retrieved: {data}")
            
            if not data:
                return jsonify({"status": "Error", "error": "User not found"}), 404
                
            return jsonify({"status": "Data received", "data": data}), 200
        except Exception as e:
            print(f"Error in _get_user_by_id: {str(e)}")
            return jsonify({"status": "Error", "error": "Internal server error"}), 500
    
    def _login(self):
        email = request.json.get('email')
        password = request.json.get('password')
        print(email, password)
        data = self.__controller.login(email, password)
        if data['status'] == 'success':
            resp = make_response(jsonify({
                    "message": "Login successful", 
                    "user_id": data['data']["id"],
                    "email": data['data']["email"],
                    "nama_keluarga": data['data']["nama_keluarga"] or "User"
                }), 200)
            resp.set_cookie(
                'session_id',
                value=f'user_{data["data"]["id"]}',
                max_age=3600,
                httponly=True,
                secure=False,
                samesite='Lax'
            )

            return resp
        else: 
            return jsonify(data), 400
        
    def _register(self):
        email = request.json.get('email')
        password = request.json.get('password')
        confirm_password = request.json.get('confirmPassword')
        data = self.__controller.register(email, password, confirm_password)
        if data['status'] == 'success':
            return jsonify(data), 200
        else: 
            return jsonify(data), 400
    
    def _get_user_session(self):
        session_id = request.cookies.get("session_id")
        data = self.__controller.get_session_id(session_id)

        if data['status'] == 'success':
            return jsonify(data), 200
        else: 
            return jsonify(data), 400
        
    def _update_user(self):
        nama_keluarga = request.json.get('nama_keluarga')
        id_user = request.json.get('user_id')

        if 'foto' in request.files:
            file = request.files['foto']
            if file.filename != '':
                user = self.__controller.get_user_by_id(id_user)

                if user is None:
                    return jsonify({'error': 'User not found'}), 404
                
                if user['foto'] is not None:
                    self.__controller.delete_image(user['foto'])

                filename = f'{os.urandom(16).hex()}_{file.filename}'

                file_bytes = file.read()

                foto = self.__controller.store_image(filename, file_bytes, file)

        data['foto'] = foto
        data['nama_keluarga'] = nama_keluarga

        data = self.__controller.update_user(id_user, data)

        return jsonify({'status': 'User updated successfully', 'data': data}), 200




        

        # data = self.__controller.update_user(data)
        # if data['status'] == 'success':
        #     return jsonify(data), 200
        # else: 
        #     return jsonify(data), 400



    # def _update_user(self):
    #     data = request.form.to_dict()

    #     if data['password'] == '':
    #         data.pop('password')
    #     else:
    #         data['password'] = self.__auth_controller.hash_password(data['password'])

    #     foto = None
    #     if 'file' in request.files:
    #         file = request.files['file']

    #         if file.filename != '':
    #             user = self.__main_model.get_user_by_id(data['user_id'])

    #             if user is None:
    #                 return jsonify({'error': 'User not found'}), 404
                
    #             if user['foto'] is not None:
    #                 self.__main_model.delete_image(user['foto'])

    #             filename = f'{os.urandom(16).hex()}_{file.filename}'

    #             file_bytes = file.read()

    #             foto = self.__main_model.store_image(filename, file_bytes, file)

    #     data['foto'] = foto

    #     data = self.__main_model.update_user(id_user, data)

    #     return jsonify({'status': 'User updated successfully', 'data': data}), 200
    
    def _send_identity(self, option):
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files['file']

        data = self.__controller.detect(file.read(), option)
        return jsonify({"status": "Data received", "data": data}), 200

    def _get_user_profile(self):
        try:
            # Get session from cookie
            session_id = request.cookies.get("session_id")
            if not session_id or not session_id.startswith("user_"):
                return jsonify({"error": "No valid session"}), 401
            
            user_id = session_id.replace("user_", "")
            
            # Get user data using existing controller method
            data = self.__controller.get_user_by_id(user_id)
            if not data:
                return jsonify({"error": "User not found"}), 404
            
            # Transform data to match frontend interface
            user_data = {
                "id": data.get("id", ""),
                "name": data.get("nama_keluarga", "Unknown User"),
                "email": data.get("email", ""),
                "phone": data.get("phone", "Not provided"),
                "position": data.get("position", "Not specified"),
                "department": data.get("department", "Not specified"),
                "avatar": data.get("foto"),
                "personalInfo": {
                    "gender": data.get("gender", "Not specified"),
                    "dateOfBirth": data.get("date_of_birth", "Not specified"),
                    "identifyCode": data.get("identify_code", "Not specified"),
                    "hometown": data.get("hometown", "Not specified"),
                    "nationality": data.get("nationality", "Not specified"),
                    "religion": data.get("religion", "Not specified"),
                    "languages": data.get("languages", "Not specified"),
                    "maritalStatus": data.get("marital_status", "Not specified"),
                    "permanentAddress": data.get("permanent_address", "Not specified"),
                    "currentAddress": data.get("current_address", "Not specified"),
                }
            }
            
            return jsonify(user_data), 200
            
        except Exception as e:
            return jsonify({"error": "Server error occurred"}), 500

    def run(self):
        self.app.run(host='0.0.0.0')
