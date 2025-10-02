from flask import request, url_for, session, jsonify, make_response
from dotenv import load_dotenv
from main_controller import MainController
import os

class Api:
    def __init__(self, app_instance):
        load_dotenv()
        self._app = app_instance
        self.__controller = MainController(app_instance)

        self.__setup_routes()

    def __setup_routes(self):
        self._app.add_url_rule('/get/user', view_func=self._get_user, methods=['GET'])
        self._app.add_url_rule('/get/user/<id_user>', view_func=self._get_user_by_id, methods=['GET'])
        self._app.add_url_rule('/api/login', view_func=self._login, methods=['POST'])
        self._app.add_url_rule('/api/register', view_func=self._register, methods=['POST'])
        self._app.add_url_rule('/api/user/session', view_func=self._get_user_session, methods=['GET'])
        self._app.add_url_rule('/api/complete-profile', view_func=self._update_user, methods=['POST'])
        # self._app.add_url_rule('/delete/user/<id_user>', view_func=self._delete_user, methods=['DELETE'])  
        # self._app.add_url_rule('/delete/user/foto/<id_user>', view_func=self._delete_user_foto, methods=['DELETE']) 

        self._app.add_url_rule('/api/send/<option>', view_func=self._send_identity, methods=['POST'])
        
        self._app.add_url_rule('/api/get/status/payment/<id_order>', view_func=self._get_status_payment_by_id, methods=['GET'])
        self._app.add_url_rule('/api/create/transaction', view_func=self._create_transaction, methods=['POST'])
        self._app.add_url_rule('/api/callback/transaction', view_func=self._callback_transaction, methods=['POST'])

        self._app.add_url_rule('/api/login/google', view_func=self._login_google, methods=['GET'])   
        self._app.add_url_rule('/api/authorize', view_func=self._authorize, methods=['GET'], endpoint='authorize')

    def _get_user(self):
        data = self.__controller.get_user()
        return jsonify({"status": "Data received", "data": data}), 200
    
    def _get_user_by_id(self, id_user):
        data = self.__controller.get_user_by_id(id_user)
        return jsonify({"status": "Data received", "data": data}), 200
    
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
        print(data)
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
        nama_keluarga = request.form.get('nama_keluarga')
        id_user = request.form.get('user_id')
        nomor_telepon = request.form.get('nomor_telepon')
        data = {}
        foto = None
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

                print(foto)

        data['foto'] = foto
        data['nama_keluarga'] = nama_keluarga

        data = self.__controller.update_user(id_user, data)

        return jsonify({'status': 'User updated successfully', 'data': data}), 200
    
    def _login_google(self):
        redirect_uri = url_for('authorize', _external=True)
        return self.__controller.login_google(redirect_uri)
    
    def _authorize(self):
        return self.__controller.authorize()
    
    def _get_status_payment_by_id(self, id_order):
        data = self.__controller.get_status_payment(id_order)
        return jsonify({"status": "Data received", "data": data}), 200

    def _create_transaction(self):
        data = request.json
        data = self.__controller.create_transaction(data)
        return jsonify({"status": "Data received", "data": data}), 200

    def _callback_transaction(self):
        midtrans_notification = request.get_json()
        response =self.__controller.payment_callback(midtrans_notification)
        print(response)
        return jsonify({"status": "Payment data received", "data": response}), 200

    
    def _send_identity(self, option):
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files['file']

        data = self.__controller.detect(file.read(), option)
        return jsonify({"status": "Data received", "data": data}), 200


    def run(self):
        self.app.run(host='0.0.0.0')
