# Installation :

## Script SQL

```sql
-- Création de la table Users
CREATE TABLE Users (
  ID_user INT AUTO_INCREMENT PRIMARY KEY,
  FullName VARCHAR(255) NOT NULL,
  Email VARCHAR(255) NOT NULL,
  Username VARCHAR(255) NOT NULL,
  Password VARCHAR(255) NULL,
  2faIsActivated INT NOT NULL DEFAULT '0'
);

-- Création de la table Blogs
CREATE TABLE Blogs (
  ID_blog INT AUTO_INCREMENT PRIMARY KEY,
  Title TEXT NOT NULL,
  Access ENUM('Public', 'Private') DEFAULT 'Public',
  User_ID INT,
  FOREIGN KEY (User_ID) REFERENCES Users(ID_user)
);

-- Création de la table Publications
CREATE TABLE Publications (
  ID_publication INT AUTO_INCREMENT PRIMARY KEY,
  Title TEXT NOT NULL,
  Date_creation DATETIME NOT NULL,
  Description TEXT,
  Blog_ID INT,
  User_ID INT,
  FOREIGN KEY (User_ID) REFERENCES Users(ID_user),
  FOREIGN KEY (Blog_ID) REFERENCES Blogs(ID_blog)
);

-- Insertion de données dans la table Users
INSERT INTO Users (FullName, Email, Username, Password, 2faIsActivated) VALUES
  ('Alice Dupont', 'alice@example.com', 'alice123', '$2b$10$S/Fy0WYR4tusswl6A/xtfe1y4lVCLXt9P8HJrZe6P5VO1bfhV60eO', 1), -- Password
  ('Bob Martin', 'bob@example.com', 'bobmartin', '$2b$10$S/Fy0WYR4tusswl6A/xtfe1y4lVCLXt9P8HJrZe6P5VO1bfhV60eO', 0), -- Password
  ('Claire Johnson', 'claire@example.com', 'clairej', '$2b$10$S/Fy0WYR4tusswl6A/xtfe1y4lVCLXt9P8HJrZe6P5VO1bfhV60eO', 0); -- Password


-- Insertion de données dans la table Blogs
INSERT INTO Blogs (Title, Access, User_ID) VALUES
  ('Blog de Cuisine Facile', 'Public', 1),
  ('Secrets de la Cuisine Maison', 'Private', 2),
  ('Recettes Gourmandes', 'Public', 3);

-- Insertion de données dans la table Publications
INSERT INTO Publications (Title, Date_creation, Description, Blog_ID, User_ID) VALUES
  ('Délicieuse Tarte aux Pommes', '2023-01-15 10:30:00', 'Une recette simple et délicieuse de tarte aux pommes.', 1, 1),
  ('Recette Secrète de Gâteau au Chocolat', '2023-02-20 15:45:00', 'La meilleure recette de gâteau au chocolat jamais révélée!', 2, 2),
  ('Poulet Rôti aux Herbes', '2023-03-10 18:00:00', 'Une façon parfaite de préparer le poulet pour un repas savoureux.', 3, 3),
  ('Spaghetti Bolognese Classique', '2023-04-05 12:00:00', 'La recette authentique de la sauce bolognaise italienne.', 1, 1),
  ('Soupe de Tomates Maison', '2023-05-12 14:30:00', 'Une soupe saine et délicieuse à base de tomates fraîches.', 2, 2);

```

# Structure de données :

## Blogs

- ID_blog : autoincrement
- Title : text
- Access : Public/Private
- User_ID : users

## Publications

- ID_publication : autoincrement
- Title : text
- Date_creation : Datetime
- Description : text
- Blog_ID : Blogs
- User_ID : Users

## Users

- ID_user = autoincrement
- FullName = text
- Email = text
- Username = text
- Password = text ( hash )
- type = text

# Inscription

Un utilisateur peut s'enregistrer sur l'application en renseignant :

- Nom et prénom,
- Email,
- Username
- Mot de passe
  L'application vérifie si l'utilisateur existe déjà ou non et l'insert par la suite en BD

# Connexion basique

L'application permet de se connecter avec identifiant mot de passe, tant que le compte existe dans la BD, le mot de passe est hashé en utilisant bcrypt.

# Connexion avec Provider

## Google et Microsoft

L'application permet de se connecter directement avec Google et Microsoft, elle verifie si l'utilisateur existe ou non et l'insert par la suite en BD avec la colonne mot de passe vide

# Two-Factor Authentification

L'utilisateur une fois connecté recoit une notification comme quoi il peut s'authentifier en double facteur en passant dans "Mon compte" : " TFA Form " puis saisi son code.
Il peut également générer son QRCode dans le menu "Mon Compte" et "Mon QRCode"
la génération du QRCode se fera par rapport à l'email de l'utilisateur connecté.

# Maintien de la connexion

Mise en place d'un JWT,
var tokenJWT = jwt.sign(
{
iss: "http://localhost",
loggedIn: ,
doubleAuthent: ,
email: ,
username: ,
},
process.env.SECRET_KEY_JWT
);

# Déconnexion

L'utilisateur peut se déconnecter depuis l'application dans l'onglet "Mon Compte"
Suppression du tokenJWT

# Liste des routes :

## Routes publiques :

- /login : Permet de se connecter sur l'application
- /register : Permet de s'enregistrer sur l'application
- /home : liste des blogs pour un user non authentifié
- /blog/:id : liste les publications pour un blog

## Routes privées :

- /home : Liste de tout les blogs même privé
- /blog/:id : liste les publications pour un blog

## Authentification à deux facteurs :

- /create : Permet de créer un blog
- /addPublication : Permet d'ajouter une publication
- /updatePublication/:id : Permet de modifier une publication
- /deletePublication/:id : Permet de supprimer une publication
