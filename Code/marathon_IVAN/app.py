import dash
from dash import html, dcc
from dash.dependencies import Input, Output, State
import pandas as pd

# Import functions from your custom modules
from data import normalize_data
from calculator import calculate_scores

# Load your data
df = pd.read_csv('data_test.csv')  # Make sure the path is correct

# Initialize the Dash app
app = dash.Dash(__name__)

app.layout = html.Div([
    dcc.Dropdown(
        id='variable-selector',
        options=[{'label': col, 'value': col} for col in df.columns if col not in ['Libellé', 'OtherNonVariableColumn']],
        value=[df.columns[2]],  # Default selected variable(s), adjust as needed
        multi=True
    ),
    html.Button('Calculate Scores', id='calculate-button', n_clicks=0),
    html.Div(id='score-output')
])

@app.callback(
    Output('score-output', 'children'),
    [Input('calculate-button', 'n_clicks')],
    [State('variable-selector', 'value')]
)
def update_output(n_clicks, selected_variables):
    if n_clicks > 0:
        # Normalize only the selected variables
        normalized_df = df.copy()  # Start with a copy of the original dataframe
        if selected_variables:
            # Assuming your normalize_data function takes the dataframe and a list of columns to normalize
            normalized_df = normalize_data(normalized_df, selected_variables)
        # Assuming your calculate_scores function takes the dataframe and a list of columns based on which to calculate scores
        scores = calculate_scores(normalized_df, selected_variables)
        return html.Table(
            # Header
            [html.Tr([html.Th(col) for col in scores.columns])] +
            # Body
            [html.Tr([html.Td(scores.iloc[i][col]) for col in scores.columns]) for i in range(len(scores))]
        )
    return 'Select variables and click "Calculate Scores" to see the results.'

if __name__ == '__main__':
    app.run_server(debug=True)
