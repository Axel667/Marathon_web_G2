import pandas as pd
from sklearn.preprocessing import MinMaxScaler

def load_data(filepath):
    # Load data from CSV
    return pd.read_csv(filepath)

def normalize_data(df, selected_columns):
    # Normalize only selected columns to range [0, 1] using MinMaxScaler
    if selected_columns:
        scaler = MinMaxScaler()
        df[selected_columns] = scaler.fit_transform(df[selected_columns])
    return df