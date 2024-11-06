import sys
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import os

def identify_target_column(data):
    """
    Automatically identifies the most likely target column based on data characteristics.
    Rules:
    1. If 'target' or 'label' exists, use it
    2. If there's a column with 'total' or 'sum' in its name, use it
    3. If there's a column named 'annual' or containing year, use it
    4. Otherwise, use the last numeric column
    """
    # Convert column names to lowercase for easier matching
    columns_lower = {col.lower(): col for col in data.columns}
    
    # Rule 1: Check for explicit target columns
    target_keywords = ['target', 'label', 'output', 'prediction']
    for keyword in target_keywords:
        if keyword in columns_lower:
            return columns_lower[keyword]
    
    # Rule 2: Check for total/sum columns
    total_keywords = ['total', 'sum', 'final']
    for keyword in total_keywords:
        matches = [col for col in columns_lower.values() if keyword.lower() in col.lower()]
        if matches:
            return matches[0]
    
    # Rule 3: Check for annual/yearly columns
    time_keywords = ['annual', 'yearly', 'year']
    for keyword in time_keywords:
        matches = [col for col in columns_lower.values() if keyword.lower() in col.lower()]
        if matches:
            return matches[0]
    
    # Rule 4: Use the last numeric column
    numeric_columns = data.select_dtypes(include=['int64', 'float64']).columns
    if len(numeric_columns) > 0:
        return numeric_columns[-1]
    
    raise ValueError("Could not automatically identify a suitable target column")

def train_model(input_file, output_file):
    try:
        # Load data
        data = pd.read_csv(input_file)
        print(f"Loaded data with shape: {data.shape}")
        print(f"Columns: {data.columns.tolist()}")
        
        # Automatically identify target column
        target_column = identify_target_column(data)
        print(f"Automatically selected target column: {target_column}")
        
        # Identify numeric and categorical columns (excluding target)
        feature_columns = [col for col in data.columns if col != target_column]
        numeric_features = data[feature_columns].select_dtypes(include=['int64', 'float64']).columns
        categorical_features = data[feature_columns].select_dtypes(include=['object']).columns
        
        print(f"Numeric features: {numeric_features.tolist()}")
        print(f"Categorical features: {categorical_features.tolist()}")
        print(f"Target column: {target_column}")
        print(f"Feature columns: {feature_columns}")

        # Separate features and target
        X = data[feature_columns]
        y = data[target_column]

        # Verify data types and handle any issues
        print(f"Target column dtype: {y.dtype}")
        if not np.issubdtype(y.dtype, np.number):
            print("Warning: Target column is not numeric. Attempting to convert...")
            y = pd.to_numeric(y, errors='coerce')
            if y.isna().any():
                raise ValueError("Target column contains non-numeric values that couldn't be converted")

        # Create preprocessing pipelines
        numeric_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='median')),
            ('scaler', StandardScaler())
        ])

        categorical_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
            ('onehot', OneHotEncoder(handle_unknown='ignore'))
        ])

        # Combine preprocessing steps
        preprocessor = ColumnTransformer(
            transformers=[
                ('num', numeric_transformer, numeric_features),
                ('cat', categorical_transformer, categorical_features)
            ])

        # Create a preprocessing and modeling pipeline
        model = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
        ])

        # Split the data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # Fit the model
        model.fit(X_train, y_train)
        
        # Make predictions and calculate metrics
        y_pred = model.predict(X_test)
        mse = mean_squared_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        print(f"Mean Squared Error: {mse}")
        print(f"R-squared Score: {r2}")
        
        # Save the model
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        joblib.dump(model, output_file)
        print(f"Model saved to {output_file}")

        # Return success status and metrics
        return {
            'status': 'success',
            'metrics': {
                'mse': mse,
                'r2': r2
            },
            'target_column': target_column
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return {
            'status': 'error',
            'message': str(e)
        }

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python train_model.py <input_file> <output_file>")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]

    if not os.path.exists(input_file):
        print(f"Error: Input file '{input_file}' does not exist.")
        sys.exit(1)

    result = train_model(input_file, output_file)
    if result['status'] == 'error':
        sys.exit(1)