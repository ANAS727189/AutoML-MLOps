import sys
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder, LabelEncoder
from sklearn.metrics import mean_squared_error, r2_score, accuracy_score, classification_report
import joblib
import os
import json
import logging
from datetime import datetime
import chardet

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def detect_encoding(file_path):
    with open(file_path, 'rb') as file:
        raw_data = file.read()
    return chardet.detect(raw_data)['encoding']

def identify_target_column(data, target_column=None):
    """
    Identifies target column either automatically or uses specified column
    
    Args:
        data: pandas DataFrame containing the dataset
        target_column: Optional specified target column name
    """
    if target_column and target_column != 'auto':
        if target_column not in data.columns:
            raise ValueError(f"Specified target column '{target_column}' not found in dataset")
        return target_column

    # Automatic identification logic
    columns_lower = {col.lower(): col for col in data.columns}
    
    target_keywords = ['target', 'label', 'output', 'prediction', 'class']
    for keyword in target_keywords:
        if keyword in columns_lower:
            return columns_lower[keyword]
    
    indicator_keywords = ['price', 'cost', 'revenue', 'sales', 'total', 'final']
    for keyword in indicator_keywords:
        matches = [col for col in columns_lower.values() if keyword.lower() in col.lower()]
        if matches:
            return matches[0]
    
    numeric_columns = data.select_dtypes(include=['int64', 'float64']).columns
    if len(numeric_columns) > 0:
        return numeric_columns[-1]
    
    raise ValueError("Could not identify a suitable target column")

def determine_problem_type(y):
    """Determines if this is a regression or classification problem"""
    unique_values = len(np.unique(y[~pd.isna(y)]))  # Exclude NaN values when counting unique values
    if unique_values <= 10 or y.dtype == 'object':
        return 'classification'
    return 'regression'

def clean_dataset(X, y):
    """
    Clean the dataset by handling NaN values
    
    Args:
        X: feature DataFrame
        y: target Series
    Returns:
        cleaned X and y
    """
    # Log initial NaN statistics
    initial_X_nans = X.isna().sum().sum()
    initial_y_nans = y.isna().sum()
    logger.info(f"Initial NaN count - Features: {initial_X_nans}, Target: {initial_y_nans}")
    
    # Remove rows where target is NaN
    valid_indices = ~pd.isna(y)
    X_cleaned = X[valid_indices]
    y_cleaned = y[valid_indices]
    
    # Log cleaning results
    logger.info(f"Removed {(~valid_indices).sum()} rows with NaN target values")
    logger.info(f"Remaining samples: {len(y_cleaned)}")
    
    return X_cleaned, y_cleaned

def train_model(input_file, output_file, target_column=None):
    """
    Trains and saves a machine learning model
    
    Args:
        input_file: Path to input CSV file
        output_file: Path to save trained model
        target_column: Optional target column name (None for automatic selection)
    """
    try:
        start_time = datetime.now()
        
        # Detect file encoding
        file_encoding = detect_encoding(input_file)
        logger.info(f"Detected file encoding: {file_encoding}")

        # Load and validate data
        logger.info(f"Loading data from {input_file}")
        data = pd.read_csv(input_file, encoding=file_encoding)
        if data.empty:
            raise ValueError("Dataset is empty")
            
        # Identify target column
        target = identify_target_column(data, target_column)
        logger.info(f"Using target column: {target}")
        
        # Prepare features and target
        X = data.drop(columns=[target])
        y = data[target]
        
        # Clean dataset
        X, y = clean_dataset(X, y)
        
        if len(y) == 0:
            raise ValueError("No valid samples remaining after cleaning")
        
        # Determine problem type
        problem_type = determine_problem_type(y)
        logger.info(f"Detected problem type: {problem_type}")
        
        # Prepare feature processors
        numeric_features = X.select_dtypes(include=['int64', 'float64']).columns
        categorical_features = X.select_dtypes(include=['object']).columns
        
        numeric_transformer = Pipeline([
            ('imputer', SimpleImputer(strategy='median')),
            ('scaler', StandardScaler())
        ])

        categorical_transformer = Pipeline([
            ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
            ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
        ])

        preprocessor = ColumnTransformer(
            transformers=[
                ('num', numeric_transformer, numeric_features),
                ('cat', categorical_transformer, categorical_features)
            ])

        # Create appropriate model based on problem type
        if problem_type == 'classification':
            model = RandomForestClassifier(n_estimators=100, random_state=42)
            if y.dtype == 'object':
                y = LabelEncoder().fit_transform(y)
        else:
            model = RandomForestRegressor(n_estimators=100, random_state=42)

        # Create and train pipeline
        pipeline = Pipeline([
            ('preprocessor', preprocessor),
            ('model', model)
        ])

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Train model
        logger.info("Training model...")
        pipeline.fit(X_train, y_train)
        
        # Evaluate model
        y_pred = pipeline.predict(X_test)
        metrics = {}
        
        if problem_type == 'classification':
            metrics['accuracy'] = accuracy_score(y_test, y_pred)
            metrics['classification_report'] = classification_report(y_test, y_pred)
            logger.info(f"Model accuracy: {metrics['accuracy']:.4f}")
        else:
            metrics['mse'] = mean_squared_error(y_test, y_pred)
            metrics['r2'] = r2_score(y_test, y_pred)
            logger.info(f"Model R² score: {metrics['r2']:.4f}")

        # Perform cross-validation
        cv_scores = cross_val_score(pipeline, X, y, cv=5)
        metrics['cv_mean'] = cv_scores.mean()
        metrics['cv_std'] = cv_scores.std()
        
        # Save model and metadata
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        joblib.dump(pipeline, output_file)
        
        # Save metadata
        metadata = {
            'target_column': target,
            'problem_type': problem_type,
            'features': list(X.columns),
            'metrics': metrics,
            'training_duration': str(datetime.now() - start_time),
            'timestamp': datetime.now().isoformat()
        }
        
        metadata_file = output_file.replace('.pkl', '_metadata.json')
        with open(metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        # Save model data as CSV
        csv_file = output_file.replace('.pkl', '.csv')
        data.to_csv(csv_file, index=False)
        
        logger.info(f"Model, metadata, and CSV saved to {output_file}")
        return {
            'status': 'success',
            'metrics': metrics,
            'metadata': metadata
        }

    except Exception as e:
        logger.error(f"Error during training: {str(e)}", exc_info=True)
        return {
            'status': 'error',
            'message': str(e)
        }

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python train_model.py <input_file> <output_file> [target_column]")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]
    target_column = sys.argv[3] if len(sys.argv) > 3 else None

    if not os.path.exists(input_file):
        print(f"Error: Input file '{input_file}' does not exist.")
        sys.exit(1)

    result = train_model(input_file, output_file, target_column)
    if result['status'] == 'error':
        sys.exit(1)