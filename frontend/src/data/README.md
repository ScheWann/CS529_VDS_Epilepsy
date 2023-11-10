### 1. {patientID}/\_all_events.json(E.g. ep129_all_events.json)

```JS
{
    sample1:[
        {
            index:1,
            count:2, // Number of active electrodes
            electrode:[85, 84], // Activate electrode array
            time: [2012, 2014] // Electrode activation time
        },
        ...
    ],
    sample2:[...]
}
```

### 2. data/dataRegistry.json

Record summary information for each episode in two patients  
 E.g. number of lesions,  
 bbox(3D box render position)

### 3. {patientID}/{sampleID}/{patientID}/{sampleID}/{patientID}\_{sampleID}\_full_network.json

```JS
[
    // The full network array length represents the number of roi + 1(this array also includes a roi called 'rest.' This project does not care about it.)
    {
    electrodes: [...], // Electrodes included in the roi region
    matrix: [[...],[...],...], // A matrix of activation numbers consisting of electrode arrays in this ROI
    network: [{…}, {…}, ...], // Each object includes 'source' and 'target', that represents the propagation in this roi
    roi: 0 // Roi index
    },
    ...
]
```

### 4. {patientID}/{sampleID}/{patientID}\_{sampleID}\_full_network_event_new.json

```JS
{
    [
        {
            // Time-based network information
            electrodes: [...], // Electrodes included in the roi region
            matrix: [[...],[...],...], // A matrix of activation numbers consisting of electrode arrays in this ROI
            network: [{…}, {…}, ...], // Each object includes 'source' and 'target', that represents the propagation in this roi
            roi: 0 // Roi index
        },
        ...
    ],
    ...
}
```

### 5. /electrodes/{patientID}/{patientID}\_electrodes_new.csv

Recording the patient's 3D electrode positions
