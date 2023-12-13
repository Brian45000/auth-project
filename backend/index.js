const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;

const session = require("express-session");

const qrcode = require("qrcode");
const { authenticator } = require("otplib");

const app = express();

// Utilisez express-session middleware
app.use(
  session({ secret: "azerty123", resave: true, saveUninitialized: true })
);

app.use(express.json());
app.use(cors());

// Initialisation de Passport et utilisation de sessions
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());

// Configuration de Passport Google
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID_GOOGLE,
      clientSecret: process.env.CLIENT_SECRET_GOOGLE,
      callbackURL: "http://localhost:5000/auth/google/callback",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
      scope: ["openid", "email", "profile"],
    },
    (accessToken, refreshToken, profile, done) => {
      // Utilisateur authentifié
      return done(null, profile);
    }
  )
);

// Configuration de Passport GitHub
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.CLIENT_ID_GITHUB,
      clientSecret: process.env.CLIENT_SECRET_GITHUB,
      callbackURL: "http://localhost:5000/auth/github/callback",
      scope: ["user:email"], // Ajoutez cette ligne pour demander l'accès à l'adresse e-mail de l'utilisateur
    },
    function (accessToken, refreshToken, profile, done) {
      // Utilisateur authentifié
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Initialisation de Passport et utilisation de sessions
app.use(passport.initialize());
app.use(passport.session());

// Fonction pour la vérification et l'ajout d'un utilisateur en base de données
async function verifyAndAddUser(userData) {
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection({
      host: process.env.HOST_MYSQL,
      user: process.env.USERNAME_MYSQL,
      password: process.env.PASSWORD_MYSQL,
      database: process.env.DATABASE_MYSQL,
    });

    connection.connect((err) => {
      if (err) {
        console.error("Erreur de connexion à la base de données :", err);
        reject(err);
      }
      console.log("Connecté à la base de données MySQL");
    });

    var tokenJWT = jwt.sign(
      {
        iss: "http://localhost",
        loggedIn: true,
        doubleAuthent: false,
        email: userData.email,
        username: userData.username,
      },
      process.env.SECRET_KEY_JWT
    );

    connection.query(
      `SELECT * FROM users WHERE email = '${userData.email}'`,
      async (err, results, fields) => {
        if (results.length === 1) {
          connection.end();

          if (results[0]["2faIsActivated"] === 1) {
            resolve(`http://localhost:3000/verify?tokenJWT=${tokenJWT}`);
          } else {
            resolve(
              `http://localhost:3000/enable-2fa?email=${userData.email}&tokenJWT=${tokenJWT}`
            );
          }
        } else {
          const nouvelleLigne = {
            fullname: userData.name,
            email: userData.email,
            username: userData.username,
            password: "",
          };

          connection.query(
            "INSERT INTO users SET ?",
            nouvelleLigne,
            (err, results, fields) => {
              if (err) {
                connection.end();
                reject(err);
              }

              console.log(
                "Nouvelle ligne insérée avec succès. ID de la nouvelle ligne :",
                results.insertId
              );

              connection.end();
              resolve(
                `http://localhost:3000/enable-2fa?email=${userData.email}&tokenJWT=${tokenJWT}`
              );
            }
          );
        }
      }
    );
  });
}

// Route d'authentification Google
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["https://www.googleapis.com/auth/plus.login", "email", "profile"],
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  async (req, res) => {
    userDataGoogle = {
      name: `${req.user.name.familyName} ${req.user.name.givenName}`,
      email: req.user.emails[0].value,
      username: req.user.displayName,
    };

    try {
      const urlDirection = await verifyAndAddUser(userDataGoogle);
      res.redirect(urlDirection);
    } catch (error) {
      console.error("Erreur dans verifyAndAddUser :", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Route d'authentification Github
app.get("/auth/github", passport.authenticate("github", {}));

// Route callback GitHub
app.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  async (req, res) => {
    console.log(req.user);

    userDataGitHub = {
      name: req.user.displayName,
      email: req.user.emails[0].value,
      username: req.user.username,
    };

    try {
      const urlDirection = await verifyAndAddUser(userDataGitHub);
      res.redirect(urlDirection);
    } catch (error) {
      console.error("Erreur dans verifyAndAddUser :", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Route de déconnexion
app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

// Route protégée
app.get("/profile", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }
  res.json(req.user);
});

// Chemin register "secret"
app.post("/register", async (req, res) => {
  const jsonData = req.body;
  const fullname = jsonData[0]["fullname"];
  const email = jsonData[0]["email"];
  const newUsername = jsonData[0]["newUsername"];
  let newPassword = jsonData[0]["newPassword"];

  // Configure les paramètres de connexion à la base de données
  const connection = mysql.createConnection({
    host: process.env.HOST_MYSQL,
    user: process.env.USERNAME_MYSQL,
    password: process.env.PASSWORD_MYSQL,
    database: process.env.DATABASE_MYSQL,
  });

  // Connecte-toi à la base de données
  connection.connect((err) => {
    if (err) {
      console.error("Erreur de connexion à la base de données :", err);
      throw err;
    }
    console.log("Connecté à la base de données MySQL");
  });

  bcrypt.hash(newPassword, 10, function (err, hash) {
    // Exemple de requête INSERT
    const nouvelleLigne = {
      fullname: fullname,
      email: email,
      username: newUsername,
      password: hash,
    };

    connection.query(
      `SELECT * FROM users WHERE Email = '${email}' OR Username = '${newUsername}'`,
      (err, results, fields) => {
        if (results.length === 0) {
          connection.query(
            "INSERT INTO users SET ?",
            nouvelleLigne,
            (err, results, fields) => {
              if (err) throw err;

              console.log(
                "Nouvelle ligne insérée avec succès. ID de la nouvelle ligne :",
                results.insertId
              );

              // Ferme la connexion à la base de données après avoir effectué les opérations nécessaires
              connection.end((err) => {
                if (err) {
                  console.error(
                    "Erreur lors de la déconnexion de la base de données :",
                    err
                  );
                  throw err;
                }
                console.log("Déconnecté de la base de données MySQL");
              });

              res.send({
                status: "Success",
              });
            }
          );
        } else {
          // Ferme la connexion à la base de données après avoir effectué les opérations nécessaires
          connection.end((err) => {
            if (err) {
              console.error(
                "Erreur lors de la déconnexion de la base de données :",
                err
              );
              throw err;
            }
            console.log("Déconnecté de la base de données MySQL");
          });

          res.send({
            status: "Error",
          });
        }
      }
    );
  });
});

// Chemin login "secret"
app.post("/login", async (req, res) => {
  const jsonData = req.body;
  const identifiant = jsonData[0]["identifiant"];
  const mdp = jsonData[0]["mdp"];

  // Configure les paramètres de connexion à la base de données
  const connection = mysql.createConnection({
    host: process.env.HOST_MYSQL,
    user: process.env.USERNAME_MYSQL,
    password: process.env.PASSWORD_MYSQL,
    database: process.env.DATABASE_MYSQL,
  });

  // Connecte-toi à la base de données
  connection.connect((err) => {
    if (err) {
      console.error("Erreur de connexion à la base de données :", err);
      throw err;
    }
    console.log("Connecté à la base de données MySQL");
  });

  connection.query(
    `SELECT * FROM users WHERE Email = '${identifiant}'`,
    async (err, results, fields) => {
      if (results.length === 1) {
        const passwordHash = results[0]["Password"];

        const isPasswordValid = await bcrypt.compare(mdp, passwordHash);
        if (isPasswordValid) {
          // Alors c'est bon.
          console.log("C'est bon.");

          checkIf2faIsActivated = results[0]["2faIsActivated"];

          // On génère le JWT
          var tokenJWT = jwt.sign(
            {
              iss: "http://localhost",
              loggedIn: true,
              doubleAuthent: false,
              email: identifiant,
              username: results[0]["Username"],
            },
            process.env.SECRET_KEY_JWT
          );
          // { expiresIn: '2d' } pour rajouter un délai d'expiration sur le JWT

          res.send({
            status: "Success",
            message: "Connexion réussie",
            is2faIsActivated: checkIf2faIsActivated,
            email: identifiant,
            tokenJWT: tokenJWT,
          });
        } else {
          console.log("Pas bon compte");

          res.send({
            status: "Error",
            message: "Connexion échouée",
          });
        }
      } else {
        console.log("Pas bon compte");

        res.send({
          status: "Error",
          message: "Connexion échouée",
        });
      }
    }
  );
});
// Route pour récupérer l'intégralité des blogs
app.post("/blogs", (req, res) => {
  const authenticatorSecret = process.env.AUTHENTICATOR_SECRET;
  let tokenJWT = req.body[0].tokenJWT.tokenJWT;
  let SQLquery;
  const connection = mysql.createConnection({
    host: process.env.HOST_MYSQL,
    user: process.env.USERNAME_MYSQL,
    password: process.env.PASSWORD_MYSQL,
    database: process.env.DATABASE_MYSQL,
  });

  SQLquery = `SELECT blogs.Access, blogs.Title, blogs.ID_blog, users.FullName, count(publications.ID_publication) AS nb_publi
  FROM blogs
  INNER JOIN users ON blogs.User_ID = users.ID_user
  INNER JOIN publications ON blogs.ID_blog = publications.Blog_ID
  WHERE blogs.Access = 'Public'
  GROUP BY blogs.Access, blogs.Title, blogs.ID_blog, users.FullName;`;

  try {
    var decoded = jwt.verify(tokenJWT, process.env.SECRET_KEY_JWT);

    if (decoded.loggedIn == true) {
      SQLquery = `SELECT blogs.Access, blogs.Title, blogs.ID_blog, users.FullName, count(publications.ID_publication) AS nb_publi
      FROM blogs
      INNER JOIN users ON blogs.User_ID = users.ID_user
      INNER JOIN publications ON blogs.ID_blog = publications.Blog_ID
      GROUP BY blogs.Access, blogs.Title, blogs.ID_blog, users.FullName;`;
    }
  } catch (error) {}

  connection.query(SQLquery, async (err, results, fields) => {
    console.log("RESULTAT : ", results);
    if (results.length != 0) {
      res.send({
        blogs: results,
      });
    } else {
      res.send({
        status: "Error",
        message: "echec envoi des blogs",
      });
    }
  });
});

// Route pour récupérer l'intégralité des blogs
app.get("/blog", (req, res) => {
  const connection = mysql.createConnection({
    host: process.env.HOST_MYSQL,
    user: process.env.USERNAME_MYSQL,
    password: process.env.PASSWORD_MYSQL,
    database: process.env.DATABASE_MYSQL,
  });

  const id_blog = req.query.idblog;

  connection.query(
    `SELECT * from blogs WHERE ID_blog = ${id_blog}`,
    async (err, results, fields) => {
      if (results.length != 0) {
        res.send({
          blog: results[0],
        });
      } else {
        res.send({
          status: "Error",
          message: "echec envoi des blogs",
        });
      }
    }
  );
});

app.get("/qrcode/:user", (req, res) => {
  const authenticatorSecret = process.env.AUTHENTICATOR_SECRET;
  const user = req.params.user;
  const service = "ProjetDevAuthLiveCampus";

  const otpauth = authenticator.keyuri(user, service, authenticatorSecret);

  qrcode.toDataURL(otpauth, (err, imageUrl) => {
    if (err) {
      console.log("Error with QR");
      res.status(500).send({
        status: "Error",
        message: "Internal Server Error",
      });
      return;
    }

    res.send({
      //status: "Success",
      //message: "Code Valide",
      qrcode: "<img src='" + imageUrl + "' alt='qrcode'>",
    });
  });
});

app.post("/verify", (req, res) => {
  const authenticatorSecret = process.env.AUTHENTICATOR_SECRET;
  //Récupération du code saisi par l'utilisateur
  const token = req.body[0].token;
  let tokenJWT = req.body[0].tokenJWT.tokenJWT;

  try {
    // Si la personne n'a pas saisi le token, c'est non
    if (!token) {
      console.log("PAS DE TOKEN");
      res.send({
        status: "Error",
        message: "Veuillez saisir un code ! ",
      });
    }

    // Si le token n'est pas valide, c'est non
    const isValid = authenticator.check(token, authenticatorSecret);
    if (!isValid) {
      res.send({
        status: "Error",
        message: "Code Invalide",
      });
    } else {
      // Si le token est valide, c'est oui
      try {
        var decoded = jwt.verify(tokenJWT, process.env.SECRET_KEY_JWT);
        decoded.doubleAuthent = true;
        tokenJWT = jwt.sign(decoded, process.env.SECRET_KEY_JWT);
        res.send({
          status: "Success",
          message: "Code Valide",
          tokenJWT: tokenJWT,
        });
      } catch (error) {
        console.log(error);
        res.send({
          status: "Error",
          message: error.message,
        });

        return;
      }
    }
  } catch (err) {
    console.error(err);
    res.send({
      status: "Error",
      message: err.message,
    });
  }
});

app.post("/enable-2fa", (req, res) => {
  const authenticatorSecret = process.env.AUTHENTICATOR_SECRET;
  //Récupération du code saisi par l'utilisateur
  const token = req.body[0].token;
  const emailUser = req.body[0].emailUser;

  try {
    // Si la personne n'a pas saisi le token, c'est non
    if (!token) {
      console.log("PAS DE TOKEN");
      res.send({
        status: "Error",
        message: "Veuillez saisir un code ! ",
      });
    }

    // Si le token n'est pas valide, c'est non
    const isValid = authenticator.check(token, authenticatorSecret);
    if (!isValid) {
      res.send({
        status: "Error",
        message: "Token Invalide",
      });
    } else {
      // Si le token est valide, c'est oui

      // Update dans la BD
      const connection = mysql.createConnection({
        host: process.env.HOST_MYSQL,
        user: process.env.USERNAME_MYSQL,
        password: process.env.PASSWORD_MYSQL,
        database: process.env.DATABASE_MYSQL,
      });

      connection.query(
        `UPDATE USERS SET 2faIsActivated = 1 WHERE Email = '${emailUser}'`,
        async (err, results, fields) => {
          if (!err) {
            // Redirection vers Home avec stockage de la double authent
            res.send({
              status: "Success",
              message: "Code Valide",
            });
          } else {
            console.error("Erreur de connexion à la base de données :", err);
            res.send({
              status: "Error",
              message: "Impossible de mettre à jour le compte :" + err,
            });
          }
        }
      );
    }
  } catch (err) {
    console.error(err);
    res.send({
      status: "Error",
      message: err.message,
    });
  }
});

app.listen(5000, () => {
  console.log("listening");
});
