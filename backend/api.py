from flask import request, url_for, session, jsonify, make_response
from dotenv import load_dotenv
from main_controller import MainController

class Api:
    def __init__(self, app_instance):
        load_dotenv()
        self._app = app_instance
        self.__controller = MainController(app_instance)

        self.__setup_routes()

    def __setup_routes(self):
        self._app.add_url_rule('/get/user', view_func=self._get_user, methods=['GET'])
        self._app.add_url_rule('/get/user/<id_user>', view_func=self._get_user_by_id, methods=['GET'])
        self._app.add_url_rule('/login', view_func=self._login, methods=['POST'])
        # self._app.add_url_rule('/register', view_func=self._register, methods=['POST'])
        # self._app.add_url_rule('/update/user/<id_user>', view_func=self._update_user, methods=['PUT'])
        # self._app.add_url_rule('/delete/user/<id_user>', view_func=self._delete_user, methods=['DELETE'])  
        # self._app.add_url_rule('/delete/user/foto/<id_user>', view_func=self._delete_user_foto, methods=['DELETE']) 

        # self._app.add_url_rule('/send/<option>', view_func=self._send_identity, methods=['POST'])
        
        # self._app.add_url_rule('/get/status/payment', view_func=self._get_status_payment, methods=['GET'])
        # self._app.add_url_rule('/create/transaction', view_func=self._create_transaction, methods=['POST'])
        # self._app.add_url_rule('/callback/transaction', view_func=self._callback_transaction, methods=['POST'])

        # self._app.add_url_rule('/login/google', view_func=self._login_google, methods=['GET'])   
        # self._app.add_url_rule('/authorize', view_func=self._authorize, methods=['GET'], endpoint='authorize')

    def _get_user(self):
        data = self.__controller.get_user()
        return jsonify({"status": "Data received", "data": data}), 200
    
    def _get_user_by_id(self, id_user):
        data = self.__controller.get_user_by_id(id_user)
        return jsonify({"status": "Data received", "data": data}), 200
    
    def _login(self):
        email = request.form.get('email')
        password = request.form.get('password')
        data = self.__controller.login(email, password)
        if data == 'success':
            resp = make_response(jsonify({'status': 'Login successful', 'data': data.response}), 200)
            resp.set_cookie(
                    'session_id',
                    value=f'user_{data.response["id"]}',
                    max_age=3600,
                    httponly=True,
                    secure=False,
                    samesite='Lax'
                )
            return resp
        else: 
            return jsonify(data), 400

    def run(self):
        self.app.run(host='0.0.0.0')
