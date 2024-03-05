#Librairies dash
from dash import Dash, html

def main() ->None:
    app = Dash()
    app.layout = html.Div()
    app.title = "Indic'Aude"
    app.run()
    
if __name__ == "__main__":
    main()
    
