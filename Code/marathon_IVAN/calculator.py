from sklearn.preprocessing import MinMaxScaler

def calculate_scores(data, selected_variables, weights=None):
    # If no weights are provided, default to equal weighting
    if weights is None:
        weights = [1] * len(selected_variables)
    
    # Calculate the weighted sum for each city
    data['score'] = data[selected_variables].multiply(weights, axis=1).sum(axis=1)
    
    # Normalize scores to be between 1 and 10
    max_score = data['score'].max()
    min_score = data['score'].min()
    data['normalized_score'] = 1 + (data['score'] - min_score) / (max_score - min_score) * 9
    
    return data[['Libellé', 'normalized_score']].sort_values(by='normalized_score', ascending=False)

