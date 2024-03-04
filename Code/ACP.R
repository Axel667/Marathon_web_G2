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

# Moyenne à la place de NA
data_acp_moy <- data_acp %>% 
  mutate_all(~ifelse(is.na(.), mean(., na.rm = TRUE), .))
data_acp_moy


#Supprimer les lignes qui contiennet les NAs  (on enlève la dernière colonne qui en contient trop)
data_acp_sup <- na.omit(data_acp[,-c(16)])


#On fait l'acp:
PCA(data_acp_moy)

PCA(data_acp_sup)

#Pourcentage d'inertie expliqué
barplot(PCA(data_acp_sup))
