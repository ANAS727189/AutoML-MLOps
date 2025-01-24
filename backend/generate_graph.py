import sys
import json
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import base64
from io import BytesIO
import logging
import os

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def generate_graph(csv_file, graph_type, x_column, y_column):
    try:
        # Verify file exists
        logger.info(f"Reading CSV file: {csv_file}")
        if not os.path.exists(csv_file):
            raise FileNotFoundError(f"CSV file not found: {csv_file}")

        # Read the CSV file
        df = pd.read_csv(csv_file)
        
        # Verify columns exist
        if x_column not in df.columns:
            raise ValueError(f"X column '{x_column}' not found in dataset")
        if y_column not in df.columns:
            raise ValueError(f"Y column '{y_column}' not found in dataset")
            
        logger.info(f"Generating {graph_type} graph for {x_column} vs {y_column}")

        # Create the plot
        plt.figure(figsize=(10, 6))
        
        valid_types = ['line', 'bar', 'scatter']
        if graph_type not in valid_types:
            raise ValueError(f"Invalid graph type. Must be one of: {', '.join(valid_types)}")

        if graph_type == 'line':
            sns.lineplot(data=df, x=x_column, y=y_column)
        elif graph_type == 'bar':
            sns.barplot(data=df, x=x_column, y=y_column)
        elif graph_type == 'scatter':
            sns.scatterplot(data=df, x=x_column, y=y_column)

        plt.title(f"{graph_type.capitalize()} Plot: {y_column} vs {x_column}")
        plt.xlabel(x_column)
        plt.ylabel(y_column)
        plt.xticks(rotation=45)
        
        # Save the plot
        buffer = BytesIO()
        plt.savefig(buffer, format='png', bbox_inches='tight', dpi=300)
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        plt.close()

        return image_base64

    except Exception as e:
        logger.error(f"Error generating graph: {str(e)}", exc_info=True)
        raise

if __name__ == "__main__":
    try:
        if len(sys.argv) != 5:
            raise ValueError("Incorrect number of arguments. Usage: python generate_graph.py <csv_file> <graph_type> <x_column> <y_column>")

        csv_file = sys.argv[1]
        graph_type = sys.argv[2]
        x_column = sys.argv[3]
        y_column = sys.argv[4]

        logger.info(f"Starting graph generation with parameters: {csv_file}, {graph_type}, {x_column}, {y_column}")
        
        image_base64 = generate_graph(csv_file, graph_type, x_column, y_column)
        print(json.dumps({"status": "success", "image": image_base64}))
        sys.exit(0)
        
    except Exception as e:
        error_message = str(e)
        logger.error(f"Failed to generate graph: {error_message}", exc_info=True)
        print(json.dumps({"status": "error", "message": error_message}), file=sys.stderr)
        sys.exit(1)