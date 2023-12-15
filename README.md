# Installation :

## INSTALLER LE PROJET

./backend --> npm i
./frontend --> npm i

## DEMARRER LE PROJET

./backend --> nodemon index.js
./frontend --> npm start

## Script SQL à importer

```sql
-- Création de la table Users
CREATE TABLE Users (
  ID_user INT AUTO_INCREMENT PRIMARY KEY,
  FullName VARCHAR(255) NOT NULL,
  Email VARCHAR(255) NOT NULL,
  Username VARCHAR(255) NOT NULL,
  Password VARCHAR(255) NULL,
  2faIsActivated INT NOT NULL DEFAULT '0',
  secretKey VARCHAR(50) NULL
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

-- Création de la table UserJWT
CREATE TABLE UserJWT (
  User_ID INT,
  JWT TEXT,
  CONSTRAINT FK_UserID FOREIGN KEY (User_ID) REFERENCES Users(ID_user)
);


-- Insertion de données dans la table Users
INSERT INTO Users (FullName, Email, Username, Password, 2faIsActivated) VALUES
  ('Alice Dupont', 'alice@example.com', 'alice123', '$2b$10$S/Fy0WYR4tusswl6A/xtfe1y4lVCLXt9P8HJrZe6P5VO1bfhV60eO', 1), -- Password
  ('Bob Martin', 'bob@example.com', 'bobmartin', '$2b$10$S/Fy0WYR4tusswl6A/xtfe1y4lVCLXt9P8HJrZe6P5VO1bfhV60eO', 0), -- Password
  ('Claire Johnson', 'claire@example.com', 'clairej', '$2b$10$S/Fy0WYR4tusswl6A/xtfe1y4lVCLXt9P8HJrZe6P5VO1bfhV60eO', 0); -- Password
INSERT INTO Users (FullName, Email, Username, Password, 2faIsActivated) VALUES
  ('Élise Tremblay', 'elise@example.com', 'eliset', '$2b$10$S/Fy0WYR4tusswl6A/xtfe1y4lVCLXt9P8HJrZe6P5VO1bfhV60eO', 1), -- Password
  ('Gabriel Lefevre', 'gabriel@example.com', 'gabriel89', '$2b$10$S/Fy0WYR4tusswl6A/xtfe1y4lVCLXt9P8HJrZe6P5VO1bfhV60eO', 0), -- Password
  ('Sophie Martin', 'sophie@example.com', 'sophiem', '$2b$10$S/Fy0WYR4tusswl6A/xtfe1y4lVCLXt9P8HJrZe6P5VO1bfhV60eO', 0); -- Password

-- Insertion de données dans la table Blogs
INSERT INTO Blogs (Title, Access, User_ID) VALUES
  ('Blog de Cuisine Facile', 'Public', 1),
  ('Secrets de la Cuisine Maison', 'Private', 2),
  ('Recettes Gourmandes', 'Public', 3);
INSERT INTO Blogs (Title, Access, User_ID) VALUES
  ('Voyages autour du Monde', 'Public', 4),
  ('Aventures Culinaires', 'Private', 5),
  ('Conseils de Jardinage', 'Public', 6);

-- Insertion de données dans la table Publications
INSERT INTO Publications (Title, Date_creation, Description, Blog_ID, User_ID) VALUES
  ('Délicieuse Tarte aux Pommes', '2023-01-15 10:30:00', 'Une recette simple et délicieuse de tarte aux pommes.', 1, 1),
  ('Recette Secrète de Gâteau au Chocolat', '2023-02-20 15:45:00', 'La meilleure recette de gâteau au chocolat jamais révélée!', 2, 2),
  ('Poulet Rôti aux Herbes', '2023-03-10 18:00:00', 'Une façon parfaite de préparer le poulet pour un repas savoureux.', 3, 3),
  ('Spaghetti Bolognese Classique', '2023-04-05 12:00:00', 'La recette authentique de la sauce bolognaise italienne.', 1, 1),
  ('Soupe de Tomates Maison', '2023-05-12 14:30:00', 'Une soupe saine et délicieuse à base de tomates fraîches.', 2, 2);
INSERT INTO Publications (Title, Date_creation, Description, Blog_ID, User_ID) VALUES
  ('Carnet de Voyage - Asie', '2023-06-01 09:00:00', "Explorez les cultures fascinantes de l'Asie à travers mes aventures.", 4, 4),
  ('Recette Secrète de Pâtisserie', '2023-07-15 13:30:00', 'Découvrez mes créations pâtissières exclusives et apprenez les astuces.', 5, 5),
  ('Les Meilleurs Plants de Tomates', '2023-08-22 16:45:00', 'Guide complet pour cultiver des tomates savoureuses dans votre jardin.', 6, 6),
  ('Escapade en Amérique du Sud', '2023-09-10 11:15:00', "Explorez la beauté de l'Amérique du Sud à travers mes récits de voyage.", 4, 4),
  ('Recette Santé - Salade Fraîcheur', '2023-10-05 14:00:00', 'Une recette de salade légère et nutritive pour une alimentation saine.', 5, 5);

```

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

L'application permet de se connecter directement avec Google et Microsoft, elle vérifie si l'utilisateur existe ou non et l'insert par la suite en BD avec la colonne mot de passe vide

# Two-Factor Authentification

L'utilisateur une fois connecté accède à la page pour l'authentification à deux facteurs, il n'est pas obligé de la faire.
Il peut également activer son authentification à deux facteurs en passant dans "Mon compte" > "Mon QRCode"
Il faudrait cacher le menu "Mon QrCode" si l'utilisateur a activé l'authentification à deux facteurs sur son compte. (BD User.2faIsActivated == 1 )
Ou simplement activer son accès administrateur depuis le menu "Mon compte"

# Maintien de la connexion

Mise en place d'un JWT, stocké dans un cookie,

```js
var tokenJWT = jwt.sign(
{
  iss: "http://localhost",
  loggedIn: ,
  doubleAuthent: ,
  email: ,
  username: ,
  ID_user: ,
},
  process.env.SECRET_KEY_JWT
);

```

# Déconnexion

L'utilisateur peut se déconnecter depuis l'application dans l'onglet "Mon Compte" cela supprime son cookie ainsi que son token JWT en base de données (whitelist).

Il peut également se déconnecter de tout ses équipements, cela lui demandera un code de validation, ainsi tout les tokens associés à l'utilisateur seront supprimés en base de données (whitelist), son cookie sera également supprimé.

# Routes de l'application :

## Accès public :

Ces routes sont accessible par n'importe qui, sauf la route /blog, il y a une vérification pour les sites avec un accès privé

- /login Permet de se connecter sur l'application
- /register Permet de s'enregistrer sur l'application
- /home Page d'accueil
- /blog?id Page détail d'un blog

## Accès utilisateur connecté :

- /blog?id avec les blogs en accès privé
- /enable-2fa Permet d'activer son authentification à deux facteurs
- /verify S'authentifier à deux facteurs
- /logout Permet de se déconnecter

## Accès utilisateur authentifié a deux facteurs :

- /logoutAll Permet de déconnecter tout les équipements
- /dashboard Permet d'accéder à son espace

# Bonus

## CRSF ( non implémenté )

Ajout de https://www.npmjs.com/package/csrf
Cette fonctionnalitée aurait pu être rajouter pour la suppression des contenus

## Serveur OAuth2
