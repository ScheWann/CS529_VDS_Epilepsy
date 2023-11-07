from flask import Flask, jsonify, send_from_directory
from dotenv import load_dotenv
from os import getenv

# loading env variable from .env
load_dotenv() 
DATADIR = getenv("DATADIR")

app = Flask(__name__)

# get all event json file
@app.route("/data/all_events/<string:patientID>", methods=["GET"])
def get_data(patientID):
    data_path = f"{DATADIR}/electrodes/{patientID}/{patientID}_all_events.json"
    with open(data_path, "r") as file:
        data = file.read() 
    return data



if __name__ == "__main__":
    app.run(debug=True)