from flask import Flask, jsonify, send_from_directory
from dotenv import load_dotenv
import pandas as pd
import os


def fetch_3D_electrode_data(
    patient_id: str,
):
    file_path = os.path.join(
        "/Users/siyuanzhao/Documents/DATADIR/patients",
        patient_id,
        f"{patient_id}_electrodes_new.csv",
    )

    eeg_data_df = pd.read_csv(file_path)

    return eeg_data_df

def fetch_propagation_data(
     patient_id: str,
     sample_id:str,
     event_id: int   
):
    file_path = os.path.join(
    "/Users/siyuanzhao/Documents/DATADIR/patients",
    patient_id,
    sample_id,
    f"{patient_id}_sorted_data.json",
    )

    propagation_df = pd.read_json(file_path)
    propagation_filtered_by_event_df = propagation_df[propagation_df["eventIndex"] == event_id]
    return propagation_filtered_by_event_df
