# Installation :

## Script SQL

```sql
-- Création de la table Users
CREATE TABLE Users (
  ID_user INT AUTO_INCREMENT PRIMARY KEY,
  FullName VARCHAR(255) NOT NULL,
  Email VARCHAR(255) NOT NULL,
  Username VARCHAR(255) NOT NULL,
  Password VARCHAR(255) NULL
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
INSERT INTO Users (FullName, Email, Username, Password) VALUES
  ('Alice Dupont', 'alice@example.com', 'alice123', '$2y$10$WejmYkvWx1qVbdQiUGI8ReJNOMM3VRocvfkKKeMUAFgtaQvcg/fi6'), -- Password
  ('Bob Martin', 'bob@example.com', 'bobmartin', '$2y$10$03a3zuTlxVJRcZQjh3cmR.w3HjsQFseVkiLtZ0z8H7osbSunfDXTG'), -- mdpsecret456
  ('Claire Johnson', 'claire@example.com', 'clairej', '$2y$10$N.wVXRLxutohi6uLgJwoTutG9HJkT7JkUgDFaQn6ZPihu9aii.5nO'); -- p@ssword789


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

# Routes :

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