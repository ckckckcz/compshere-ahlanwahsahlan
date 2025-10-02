from api import Api
from flask import Flask
import os
from dotenv import load_dotenv
from flask_cors import CORS


app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY_FLASK")
CORS(app, supports_credentials=True)
api = Api(app)

if __name__ == '__main__':
    app.run()