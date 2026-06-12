import flask
from flask_cors import CORS
from dotenv import load_dotenv
from openai import OpenAI
import os

app = flask.Flask(__name__)
CORS(app, origins="*")

load_dotenv()

BASE_URL = os.environ.gt("BASE_URL")
API_KEY = os.environ.gt("API_KEY")
MODEL_NAME = os.environ.gt("MODEL_NAME")

client = OpenAI (api_key=API_KEY, base_url=BASE_URL)

@app.route('/api/hello')
def hello():
    return flask.jsonify({"message": "Hello World!"})

@app.route('/api/echo', methods=['POST'])
def echo():
        data = flask.request.get_json()
        message = data.get('message', '')
        return flask.jsonify({'echo': message})

if __name__ == "__main__":
        app.run(debug=True, host="0.0.0.0", port=5000)