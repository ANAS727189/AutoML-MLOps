import sys
import json
import pandas as pd
import joblib
import traceback
import logging
import warnings
from packaging import version
import sklearn
import numpy as np

import os

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def check_sklearn_version(model):
    model_sklearn_version = model.__getstate__().get('_sklearn_version', '0.0.0')
    current_sklearn_version = sklearn.__version__
    logger.info(f"Model sklearn version: {model_sklearn_version}")
    logger.info(f"Current sklearn version: {current_sklearn_version}")
    
    if version.parse(current_sklearn_version) < version.parse(model_sklearn_version):
        warnings.warn(f"The current scikit-learn version ({current_sklearn_version}) is older than "
                      f"the version used to train the model ({model_sklearn_version}). "
                      "This may cause compatibility issues.")
    elif version.parse(current_sklearn_version) > version.parse(model_sklearn_version):
        warnings.warn(f"The current scikit-learn version ({current_sklearn_version}) is newer than "
                      f"the version used to train the model ({model_sklearn_version}). "
                      "This may cause compatibility issues.")

def predict(model_path, input_data):
    try:
        # Load the model
        logger.info(f"Loading model from {model_path}")
        with warnings.catch_warnings(record=True) as w:
            warnings.simplefilter("always")
            model = joblib.load(model_path)
            for warning in w:
                logger.warning(f"Warning during model loading: {warning.message}")
        
        # Check sklearn version
        check_sklearn_version(model)
        
        # Convert input data to DataFrame
        logger.info("Converting input data to DataFrame")
        df = pd.DataFrame([input_data])

        df.replace("", np.nan, inplace=True)

        
        # Make prediction
        logger.info("Making prediction")
        prediction = model.predict(df)
        
        # Return the prediction
        return prediction[0]
    except Exception as e:
        logger.error(f"Error in prediction: {str(e)}")
        logger.error(traceback.format_exc())
        raise

if __name__ == "__main__":

    if len(sys.argv) != 3:
        logger.error("Invalid arguments")
        print(json.dumps({"status": "error", "message": "Invalid arguments"}))
        sys.exit(1)

    model_path = sys.argv[1]
    input_path = sys.argv[2]

    try:
        
        logger.info(f"Reading input data from {input_path}")
        with open(input_path, 'r') as f:
            input_data = json.load(f)
        
        result = predict(model_path, input_data)
        print(json.dumps({"status": "success", "prediction": result.tolist() if hasattr(result, 'tolist') else result}))
    except Exception as e:
        logger.error(f"Error in main: {str(e)}")
        logger.error(traceback.format_exc())
        print(json.dumps({"status": "error", "message": str(e), "traceback": traceback.format_exc()}))
        sys.exit(1)