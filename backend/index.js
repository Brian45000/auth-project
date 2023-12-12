const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const bcrypt = require("bcrypt");

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
const verifyAndAddUser = (userData, redirectUrl) => {
  const connection = mysql.createConnection({
    host: process.env.HOST_MYSQL,
    user: process.env.USERNAME_MYSQL,
    password: process.env.PASSWORD_MYSQL,
    database: process.env.DATABASE_MYSQL,
  });

  connection.connect((err) => {
    if (err) {
      console.error("Erreur de connexion à la base de données :", err);
      throw err;
    }
    console.log("Connecté à la base de données MySQL");
  });

  connection.query(
    `SELECT * FROM users WHERE email = '${userData.email}'`,
    async (err, results, fields) => {
      if (results.length === 1) {
        // L'utilisateur existe déjà, pas besoin de l'ajouter
        connection.end(); // Fermer la connexion après usage
        return redirectUrl();
      } else {
        // L'utilisateur n'existe pas, on le crée
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
            if (err) throw err;

            console.log(
              "Nouvelle ligne insérée avec succès. ID de la nouvelle ligne :",
              results.insertId
            );

            connection.end(); // Fermer la connexion après usage
            return redirectUrl();
          }
        );
      }
    }
  );
};

// Route d'authentification Google
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["https://www.googleapis.com/auth/plus.login", "email", "profile"],
  })
);

// Route callback Google
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    userDataGoogle = {
      name: `${req.user.name.familyName} ${req.user.name.givenName}`,
      email: req.user.emails[0].value,
      username: req.user.displayName,
    };

    verifyAndAddUser(userDataGoogle, () => {
      // Successful authentication, redirect home.
      res.redirect("http://localhost:3000/");
    });
  }
);

// Route d'authentification Github
app.get("/auth/github", passport.authenticate("github", {}));

// Route callback GitHub
app.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  function (req, res) {
    console.log(req.user);

    userDataGitHub = {
      name: req.user.displayName,
      email: req.user.emails[0].value,
      username: req.user.username,
    };
    verifyAndAddUser(userDataGitHub, () => {
      // Successful authentication, redirect home.
      res.redirect("http://localhost:3000/");
    });
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

        console.log("mdp :", mdp);
        console.log("hash:", passwordHash);
        const isPasswordValid = await bcrypt.compare(mdp, passwordHash);
        if (isPasswordValid) {
          // Alors c'est bon.
          console.log("C'est bon.");

          checkIf2faIsActivated = results[0]["2faIsActivated"];
          res.send({
            status: "Success",
            message: "Connexion réussie",
            is2faIsActivated: checkIf2faIsActivated,
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
app.get("/blogs", (req, res) => {
  const connection = mysql.createConnection({
    host: process.env.HOST_MYSQL,
    user: process.env.USERNAME_MYSQL,
    password: process.env.PASSWORD_MYSQL,
    database: process.env.DATABASE_MYSQL,
  });

  connection.query(`SELECT * from blogs`, async (err, results, fields) => {
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

app.get("/qrcode/:user", (req, res) => {
  const authenticatorSecret = process.env.AUTHENTICATOR_SECRET;
  // Le nom d'utilisateur de la personne connectée
  const user = req.params.user;
  console.log(user);
  // Le nom de votre service (à vous de le définir)
  const service = "ProjetDevAuthLiveCampus";

  // Crée une clef pour l'application d'authentification
  const otpauth = authenticator.keyuri(user, service, authenticatorSecret);
  // Génère un qrcode à partir de cette clef
  qrcode.toDataURL(otpauth, (err, imageUrl) => {
    if (err) {
      console.log("Error with QR");
      return;
    }
    res.writeHead(200, "OK", {
      "Content-Type": "text/html",
    });
    res.write("<img src='" + imageUrl + "' alt='qrcode'>");
    res.end();
  });
});

app.post("/verify", (req, res) => {
  const authenticatorSecret = process.env.AUTHENTICATOR_SECRET;
  //Récupération du code saisi par l'utilisateur
  const token = req.body[0].token;

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
      res.send({
        status: "Success",
        message: "Code Valide",
      });
    }
  } catch (err) {
    // On affiche l'erreur à l'utilisateur
    // Possible errors
    // - options validation
    // - "Invalid input - it is not base32 encoded string" (if thiry-two is used)
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
