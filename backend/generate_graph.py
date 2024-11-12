import sys
import json
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import base64
from io import BytesIO

def generate_graph(csv_file, graph_type, x_column, y_column):
    # Read the CSV file
    df = pd.read_csv(csv_file)

    # Create the plot
    plt.figure(figsize=(10, 6))
    if graph_type == 'line':
        sns.lineplot(data=df, x=x_column, y=y_column)
    elif graph_type == 'bar':
        sns.barplot(data=df, x=x_column, y=y_column)
    elif graph_type == 'scatter':
        sns.scatterplot(data=df, x=x_column, y=y_column)
    else:
        raise ValueError(f"Unsupported graph type: {graph_type}")

    plt.title(f"{graph_type.capitalize()} Plot: {y_column} vs {x_column}")
    plt.xlabel(x_column)
    plt.ylabel(y_column)

    # Save the plot to a base64 encoded string
    buffer = BytesIO()
    plt.savefig(buffer, format='png')
    buffer.seek(0)
    image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    plt.close()

    return image_base64

if __name__ == "__main__":
    if len(sys.argv) != 5:
        print("Usage: python generate_graph.py <csv_file> <graph_type> <x_column> <y_column>")
        sys.exit(1)

    csv_file = sys.argv[1]
    graph_type = sys.argv[2]
    x_column = sys.argv[3]
    y_column = sys.argv[4]

    try:
        image_base64 = generate_graph(csv_file, graph_type, x_column, y_column)
        print(json.dumps({"status": "success", "image": image_base64}))
    except Exception as e:
        print(json.dumps({"status": "error", "message": str(e)}))
        sys.exit(1)