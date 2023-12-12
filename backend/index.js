const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const bcrypt = require("bcrypt");

require("dotenv").config();

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const MicrosoftStrategy = require("passport-microsoft").Strategy;

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

// Configuration de Passport Microsoft
passport.use(
  new MicrosoftStrategy(
    {
      // Standard OAuth2 options
      clientID: process.env.CLIENT_ID_MICROSOFT,
      clientSecret: process.env.CLIENT_SECRET_MICROSOFT,
      callbackURL: "http://localhost:3000/auth/microsoft/callback",
      scope: ["user.read"],

      /*// Microsoft specific options

      // [Optional] The tenant for the application. Defaults to 'common'.
      // Used to construct the authorizationURL and tokenURL
      tenant: "common",

      // [Optional] The authorization URL. Defaults to `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize`
      authorizationURL:
        "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",

      // [Optional] The token URL. Defaults to `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`
      tokenURL: "https://login.microsoftonline.com/common/oauth2/v2.0/token",*/
    },
    function (accessToken, refreshToken, profile, done) {
      User.findOrCreate({ userId: profile.id }, function (err, user) {
        return done(err, user);
      });
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
    //
    // A DECOUPER EN FONCTION POUR METTRE DANS MICROSOFT
    // Peut etre un problème avec les infos récupérer
    //
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
    console.log(":(");

    connection.query(
      `SELECT * FROM users WHERE email = '${req.user.emails[0].value}'`,
      async (err, results, fields) => {
        if (results.length === 1) {
          // Alors c'est bon.
          res.redirect("http://localhost:3000/");
        } else {
          // Sinon, on le crée
          const nouvelleLigne = {
            fullname: `${req.user.name.familyName} ${req.user.name.givenName}`,
            email: req.user.emails[0].value,
            username: req.user.displayName,
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
            }
          );

          res.redirect("http://localhost:3000/");
        }
      }
    );
  }
);

// Route d'authentification Microsoft
app.get(
  "/auth/microsoft",
  passport.authenticate("microsoft", {
    // Optionally define any authentication parameters here
    // For example, the ones in https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow

    prompt: "select_account",
  })
);

// Route callback Microsoft
app.get(
  "/auth/microsoft/callback",
  passport.authenticate("microsoft", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("http://localhost:3000/");
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

          res.send({
            status: "Success",
            message: "Connexion réussie",
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
      console.log("PAS VALIDE");
      res.send({
        status: "Error",
        message: "Token Invalide",
      });
    } else {
      // Si le token est valide, c'est oui
      console.log("VALIDE");
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
