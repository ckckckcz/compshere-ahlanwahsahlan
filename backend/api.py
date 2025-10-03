from flask import request, url_for, session, jsonify, make_response
from flask_cors import CORS
# from dotenv import load_dotenv
from main_controller import MainController
import os
import base64

class Api:
    def __init__(self, app_instance):
        # load_dotenv()
        self._app = app_instance
        self.__controller = MainController(app_instance)
        
        # Enable CORS for all routes
        CORS(self._app, origins=["http://localhost:3000", "https://*.ngrok-free.app"], 
             supports_credentials=True)

        self.__setup_routes()

    def __setup_routes(self):
        self._app.add_url_rule('/get/user', view_func=self._get_user, methods=['GET'])
        self._app.add_url_rule('/get/user/<id_user>', view_func=self._get_user_by_id, methods=['GET'])
        self._app.add_url_rule('/api/login', view_func=self._login, methods=['POST'])
        self._app.add_url_rule('/api/register', view_func=self._register, methods=['POST'])
        self._app.add_url_rule('/api/user/session', view_func=self._get_user_session, methods=['GET'])
        self._app.add_url_rule('/api/complete-profile', view_func=self._update_user, methods=['POST'])

        self._app.add_url_rule('/api/send/<option>', view_func=self._send_identity, methods=['POST'])
        
        self._app.add_url_rule('/api/get/status/payment/<id_order>', view_func=self._get_status_payment_by_id, methods=['GET'])
        self._app.add_url_rule('/api/create/transaction', view_func=self._create_transaction, methods=['POST'])
        self._app.add_url_rule('/api/callback/transaction', view_func=self._callback_transaction, methods=['POST'])

        self._app.add_url_rule('/api/login/google', view_func=self._login_google, methods=['GET'])   
        self._app.add_url_rule('/api/authorize', view_func=self._authorize, methods=['GET'], endpoint='authorize')

        self._app.add_url_rule('/api/get/family/<id_user>', view_func=self._get_family_by_id_user, methods=['GET'])
        self._app.add_url_rule('/api/get/family/<id_user>/<name>', view_func=self._get_family_by_id_user_and_name, methods=['GET'])
        self._app.add_url_rule('/api/add/family/<id_user>', view_func=self._add_family, methods=['POST'])

        self._app.add_url_rule('/api/get/seat/<id_order>', view_func=self._get_seat_by_id_order, methods=['GET'])

        self._app.add_url_rule('/api/get/order/<id_user>', view_func=self._get_order_by_id_user, methods=['GET'])
        self._app.add_url_rule('/api/get/order/code/nik/<order_code>/<nik>', view_func=self._get_order_by_code_and_nik, methods=['GET'])

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
        data = request.get_json()
        nama_keluarga = data.get('nama_keluarga')
        id_user = data.get('user_id')
        foto_base64 = data.get('foto')

        foto_base64 = data.get('foto')

        if foto_base64:
            if ',' in foto_base64:
                header, foto_base64 = foto_base64.split(',', 1)
            
            mimetype = header.split(';')[0].replace('data:', 'image/') if 'data:' in header else 'image/png'
            
            foto_bytes = base64.b64decode(foto_base64)
            filename = f"{os.urandom(16).hex()}.png"

            foto_path = self.__controller.store_image(filename, foto_bytes, mimetype)
        else:
            foto_path = None

        update_data = {
            "nama_keluarga": nama_keluarga,
            "foto": foto_path
        }

        data = self.__controller.update_user(id_user, update_data)
        return jsonify({'status': 'User updated successfully', 'data': data}), 200

    
    def _login_google(self):
        # redirect_uri = url_for('authorize', _external=True)
        base_url = request.host_url.rstrip("/")
        redirect_uri = f"{base_url}/api/authorize"
        return self.__controller.login_google(redirect_uri)
    
    def _authorize(self):
        return self.__controller.authorize()
    
    def _get_status_payment_by_id(self, id_order):
        data = self.__controller.get_status_payment(id_order)
        return jsonify({"status": "Data received", "data": data}), 200

    def _create_transaction(self):
        data = request.json
        print(data)
        data = self.__controller.create_transaction(data)
        if data['status'] == 'success':
            return jsonify(data), 200
        else:
            return jsonify(data), 400

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
        print(data)
        return jsonify({"status": "Data received", "data": data}), 200

    def _get_user_profile(self):
        # try:
            session_id = request.cookies.get("session_id")
            if not session_id or not session_id.startswith("user_"):
                return jsonify({"error": "No valid session"}), 401
            
            user_id = session_id.replace("user_", "")
            
            data = self.__controller.get_user_by_id(user_id)
            if not data:
                return jsonify({"error": "User not found"}), 404
            
        # except Exception as e:
            return jsonify({"error": "Server error occurred"}), 500
    
    def _get_family_by_id_user(self, id_user):
        data = self.__controller.get_family_by_id_user(id_user)
        return jsonify({"status": "Data received", "data": data}), 200
    
    def _get_family_by_id_user_and_name(self, id_user, name):
        data = self.__controller.get_family_by_id_user_and_name(id_user, name)
        return jsonify({"status": "Data received", "data": data}), 200
    
    def _add_family(self, id_user):
        data = request.json
        print(data)
        data = self.__controller.add_family(id_user, data)
        return jsonify({"status": "Data received", "data": data}), 200

    def _get_seat_by_id_order(self, id_order):
        data = self.__controller.get_seat_by_id_order(id_order)
        return jsonify({"status": "Data received", "data": data}), 200
    
    def _get_order_by_id_user(self, id_user):
        data = self.__controller.get_order_by_id_user(id_user)
        return jsonify({"status": "Data received", "data": data}), 200
    
    def _get_order_by_code_and_nik(self, order_code, nik):
        print(order_code, nik)
        data = self.__controller.get_order_by_code_and_nik(order_code, nik)
        return jsonify({"status": "Data received", "data": data}), 200


    def run(self):
        self.app.run(host='0.0.0.0')
