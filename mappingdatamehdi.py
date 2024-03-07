# -*- coding: utf-8 -*-
"""Untitled20.ipynb

Automatically generated by Colaboratory.

Original file is located at
    https://colab.research.google.com/drive/1dP7XvGtthXEh1wk5vkfH7iIalWMmIbPw
"""

import json

# Assuming you've uploaded a file named 'data.json'
with open('/content/data.json', 'r') as file:
    data= json.load(file)
    print(data) # Or any other operation to inspect the data

# Assuming you've uploaded a file named 'communes-11-aude.geojson'
with open('/content/communes-11-aude.geojson', 'r') as file:
    geojson = json.load(file)
    print(geojson) # Or any other operation to inspect the data

# Extraire les noms des communes de data.json
data_communes = {item['Libellé'] for item in data}

# Extraire les noms des communes de communes-11-aude.geojson
geojson_communes = {feature['properties']['nom'] for feature in geojson['features']}

# Vérifier les communes manquantes dans chaque fichier
missing_in_data = geojson_communes - data_communes
missing_in_geojson = data_communes - geojson_communes

print(f"Manquant dans data.json: {missing_in_data}")
print(f"Manquant dans communes-11-aude.geojson: {missing_in_geojson}")