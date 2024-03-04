                                                          #ACP Départ de l'Aude
#Librairie
library(FactoMineR)

#Chemin du dossier
setwd("C:/Users/mbrei/OneDrive/Bureau/Marathon du web/Marathon_web_G2")

#Données complète
data <- read.csv2(file="Data/Data.csv", dec='.',sep=',')
summary(data)
data

#On enlève les deux premières colonnes qui décrivent juste la ville 
data_acp <- data[,-c(1,2)]

#On enlève les na


PCA(data)
