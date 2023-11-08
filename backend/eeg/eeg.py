from typing import Optional, List, Dict
import pandas as pd
import numpy as np
import os

def fetch_eeg_data(
    patient_id: str,
    sample_id: str,
    electrodes: List[int],
    start_ms: Optional[int],
    num_records: Optional[int],
):
    file_path = os.path.join(
        "/Users/siyuanzhao/Documents/DATADIR/patients",
        patient_id,
        sample_id,
        "eegdb.parquet"
    )

    eeg_data_df = pd.read_parquet(file_path, engine="pyarrow")
    start_ms = 0 if not start_ms else start_ms

    eeg_data_df_filtered = eeg_data_df[
        (eeg_data_df["electrode"].isin(electrodes))
        & (eeg_data_df["ms"] >= 90)
        & (eeg_data_df["ms"] <= start_ms + num_records)
    ]
    output = {}
    for electode in electrodes:
        output[electode] = eeg_data_df_filtered.loc[
            eeg_data_df_filtered.electrode == electode
        ].value.values.tolist()
    return output
