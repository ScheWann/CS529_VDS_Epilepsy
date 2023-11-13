from flask import Flask, jsonify, send_from_directory
from markupsafe import escape
from dotenv import load_dotenv
from os import getenv
from process import eeg, process

# loading env variable from .env
load_dotenv()
DATADIR = getenv("DATADIR")

app = Flask(__name__)


# get all event json file
@app.route("/data/all_events/<patientID>", methods=["GET"])
def get_data(patientID):
    data_path = f"{DATADIR}/electrodes/{patientID}/{patientID}_all_events.json"
    with open(data_path, "r") as file:
        data = file.read()
    return data


# get eeg data
@app.route(
    "/data/patient/<patient_id>/eeg/<sample_id>/<start>/<num_records>/<electrodes>",
    methods=["GET"],
)
def get_eeg_data(
    patient_id: str, sample_id: str, start: int, num_records: int, electrodes: str
):
    
    patient_id = str(patient_id)
    start = int(start)
    num_records = int(num_records)
    electrodes = [int(el) for el in electrodes.split(",")]

    output = eeg.fetch_eeg_data(patient_id, sample_id, electrodes, start, num_records)
    return jsonify(output)


# get 3D electrode data
@app.route(
    "/data/electrodes/<patient_id>",
    methods=["GET"],
)
def get_3D_electrode_data(
    patient_id: str
):
    
    patient_id = str(patient_id)

    output = process.fetch_3D_electrode_data(patient_id)
    return jsonify(output.to_dict(orient="records"))


# get electrode propagation data
@app.route(
    "/data/electrodes/propagation/<patient_id>/<sample_id>/<event_id>",
    methods=["GET"],
)
def get_electrode_propagation_data(
    patient_id: str,
    sample_id: str,
    event_id: int   
):
    patient_id = str(patient_id)
    sample_id = str(sample_id)
    event_id = int(event_id)

    output = process.fetch_propagation_data(patient_id, sample_id, event_id)
    return jsonify(output.to_dict(orient="records"))


if __name__ == "__main__":
    app.run(debug=True)