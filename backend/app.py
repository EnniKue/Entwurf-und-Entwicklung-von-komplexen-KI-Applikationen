import flask
from flask_cors import CORS
from dotenv import load_dotenv
from openai import OpenAI
import os
 
app = flask.Flask(__name__)
CORS(app, origins="*")
 
load_dotenv()
 
BASE_URL = os.environ.get("BASE_URL")
API_KEY = os.environ.get("API_KEY")
MODEL_NAME = os.environ.get("MODEL_NAME")
 
client = OpenAI(api_key=API_KEY, base_url=BASE_URL)
 
system_prompt = open("system_prompt.txt", "r").read()
 
@app.route('/api/hello')
def hello():
    return flask.jsonify({"message": "Hello, World!"})
 
@app.route('/api/echo', methods=['POST'])
def echo():
    data = flask.request.get_json()
    message = data.get('message', '')
    return flask.jsonify({'echo': message})
    
 
@app.route('/api/chat', methods=['POST'])
def chat():
    data = flask.request.get_json()
    user_message = data.get('message', '')
    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[ {"system": system_prompt},
            {"role": "user", "content": user_message}
        ]
    )
    return flask.jsonify({'response': response.choices[0].message.content})
 
 
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)