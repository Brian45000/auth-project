const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

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

    connection.query(
      `SELECT * FROM users WHERE email = '${userData.email}'`,
      async (err, results, fields) => {
        if (results.length === 1) {
          var tokenJWT = jwt.sign(
            {
              iss: "http://localhost",
              loggedIn: true,
              doubleAuthent: false,
              email: userData.email,
              username: userData.username,
              ID_user: results[0]["ID_user"],
            },
            process.env.SECRET_KEY_JWT
          );

          // Ajouter l'ajout en BD
          const SQLquery = `INSERT INTO UserJWT (User_ID, JWT) VALUES ('${results[0]["ID_user"]}', '${tokenJWT}')`;

          connection.query(SQLquery, (err, results, fields) => {
            if (!err) {
              console.error("Insertion du JWT :");
            } else {
              console.error("Erreur lors de l'insertion du JWT:", err);
            }
          });
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

              var tokenJWT = jwt.sign(
                {
                  iss: "http://localhost",
                  loggedIn: true,
                  doubleAuthent: false,
                  email: userData.email,
                  username: userData.username,
                  ID_user: results.insertId,
                },
                process.env.SECRET_KEY_JWT
              );

              // On stocke le JWT en BD (WhiteList)
              const SQLquery = `INSERT INTO UserJWT (User_ID, JWT) VALUES ('${results.insertId}', '${tokenJWT}')`;

              connection.query(SQLquery, (err, results, fields) => {
                if (err) {
                  console.error("Erreur lors de l'insertion du JWT:", err);
                }
              });
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

  bcrypt.hash(newPassword, 10, function (err, hash) {
    // Exemple de requête INSERT
    const nouvelleLigne = {
      fullname: fullname,
      email: email,
      username: newUsername,
      password: hash,
    };

    const connection = mysql.createConnection({
      host: process.env.HOST_MYSQL,
      user: process.env.USERNAME_MYSQL,
      password: process.env.PASSWORD_MYSQL,
      database: process.env.DATABASE_MYSQL,
    });

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
              connection.end();
              res.send({
                status: "Success",
              });
            }
          );
        } else {
          connection.end();
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

  const connection = mysql.createConnection({
    host: process.env.HOST_MYSQL,
    user: process.env.USERNAME_MYSQL,
    password: process.env.PASSWORD_MYSQL,
    database: process.env.DATABASE_MYSQL,
  });
  connection.query(
    `SELECT * FROM users WHERE Email = '${identifiant}'`,
    async (err, results, fields) => {
      if (results.length === 1) {
        const passwordHash = results[0]["Password"];

        const isPasswordValid = await bcrypt.compare(mdp, passwordHash);
        if (isPasswordValid) {
          // Alors c'est bon.

          checkIf2faIsActivated = results[0]["2faIsActivated"];

          // On génère le JWT
          var tokenJWT = jwt.sign(
            {
              iss: "http://localhost",
              loggedIn: true,
              doubleAuthent: false,
              email: identifiant,
              username: results[0]["Username"],
              ID_user: results[0]["ID_user"],
            },
            process.env.SECRET_KEY_JWT
          );
          // { expiresIn: '2d' } pour rajouter un délai d'expiration sur le JWT

          // On stocke le JWT en BD (WhiteList)

          const SQLquery = `INSERT INTO UserJWT (User_ID, JWT) VALUES ('${results[0]["ID_user"]}', '${tokenJWT}')`;
          connection.query(SQLquery, (err, results, fields) => {
            if (err) {
              console.error("Erreur lors de l'insertion du JWT:", err);
            }
          });
          connection.end();

          res.send({
            status: "Success",
            message: "Connexion réussie",
            is2faIsActivated: checkIf2faIsActivated,
            email: identifiant,
            tokenJWT: tokenJWT,
            ID_user: results[0]["ID_user"],
          });
        } else {
          connection.end();
          res.send({
            status: "Error",
            message: "Connexion échouée",
          });
        }
      } else {
        connection.end();
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
  let tokenJWT = req.body[0].tokenJWT.tokenJWT;
  let SQLquery;

  SQLquery = `SELECT blogs.Access, blogs.Title, blogs.ID_blog, users.FullName, COALESCE(count(publications.ID_publication), 0) AS nb_publi
  FROM blogs
  INNER JOIN users ON blogs.User_ID = users.ID_user
  LEFT JOIN publications ON blogs.ID_blog = publications.Blog_ID
  WHERE blogs.Access = 'Public'
  GROUP BY blogs.Access, blogs.Title, blogs.ID_blog, users.FullName;`;

  try {
    var decoded = jwt.verify(tokenJWT, process.env.SECRET_KEY_JWT);

    if (decoded.loggedIn == true) {
      SQLquery = `SELECT blogs.Access, blogs.Title, blogs.ID_blog, users.FullName, COALESCE(count(publications.ID_publication), 0) AS nb_publi
      FROM blogs
      INNER JOIN users ON blogs.User_ID = users.ID_user
      LEFT JOIN publications ON blogs.ID_blog = publications.Blog_ID
      GROUP BY blogs.Access, blogs.Title, blogs.ID_blog, users.FullName;`;
    }
  } catch (error) {}

  const connection = mysql.createConnection({
    host: process.env.HOST_MYSQL,
    user: process.env.USERNAME_MYSQL,
    password: process.env.PASSWORD_MYSQL,
    database: process.env.DATABASE_MYSQL,
  });

  connection.query(SQLquery, async (err, results, fields) => {
    if (results.length != 0) {
      connection.end();
      res.send({
        blogs: results,
      });
    } else {
      connection.end();
      res.send({
        status: "Error",
        message: "echec envoi des blogs",
      });
    }
  });
});

// Route pour récupérer l'intégralité de ses blogs
app.post("/blogs-dashboard", async (req, res) => {
  let tokenJWT = req.body[0].tokenJWT.tokenJWT;
  let SQLquery;
  var decoded = jwt.verify(tokenJWT, process.env.SECRET_KEY_JWT);
  const authenticatorSecret = await getSecretKeyById(decoded.ID_user);
  try {
    var decoded = jwt.verify(tokenJWT, process.env.SECRET_KEY_JWT);

    if (decoded.loggedIn && decoded.doubleAuthent) {
      SQLquery = `SELECT blogs.Access, blogs.Title, blogs.ID_blog, users.FullName, blogs.User_ID
      FROM blogs
      INNER JOIN users ON blogs.User_ID = users.ID_user
      WHERE blogs.User_ID = ${decoded.ID_user}
      GROUP BY blogs.Access, blogs.Title, blogs.ID_blog, users.FullName;`;
    } else {
      // Faire une redirection vers /login
    }
  } catch (error) {}

  const connection = mysql.createConnection({
    host: process.env.HOST_MYSQL,
    user: process.env.USERNAME_MYSQL,
    password: process.env.PASSWORD_MYSQL,
    database: process.env.DATABASE_MYSQL,
  });

  connection.query(SQLquery, async (err, results, fields) => {
    if (results.length != 0) {
      connection.end();
      res.send({
        blogs: results,
      });
    } else {
      connection.end();
      res.send({
        status: "Error",
        message: "echec envoi des blogs",
      });
    }
  });
});

// Route pour récupérer l'intégralité des blogs
app.post("/publications", (req, res) => {
  let tokenJWT = req.body[0].tokenJWT.tokenJWT;
  let id_blog = req.body[0].id_blog;

  // On vérifie si le token existe, si il n'existe pas alors la variable doubleAuthent est forcement à false
  let doubleAuthent;
  if (tokenJWT) {
    var decoded = jwt.verify(tokenJWT, process.env.SECRET_KEY_JWT);
    doubleAuthent = decoded.doubleAuthent;
  } else {
    doubleAuthent = false;
  }

  let SQLquery;

  SQLquery = `SELECT publications.ID_publication as id_publication, publications.Title, publications.Date_creation, publications.Description, publications.Blog_ID, publications.User_ID, blogs.Title as nom_blog, users.FullName, users.ID_User as id_user
  FROM publications 
  INNER JOIN blogs ON publications.Blog_ID = blogs.ID_blog
  INNER JOIN users ON publications.User_ID = users.ID_User
  WHERE Blog_ID = ${id_blog}`;

  const connection = mysql.createConnection({
    host: process.env.HOST_MYSQL,
    user: process.env.USERNAME_MYSQL,
    password: process.env.PASSWORD_MYSQL,
    database: process.env.DATABASE_MYSQL,
  });

  connection.query(SQLquery, async (err, results, fields) => {
    if (results.length != 0) {
      connection.end();
      res.send({
        status: "Success",
        publications: results,
        nom_blog: results[0]["nom_blog"],
        id_user: results[0]["id_user"],
        doubleAuthent: doubleAuthent,
      });
    } else {
      SQLquery = `SELECT blogs.Title as nom_blog, blogs.User_ID as id_user 
          FROM blogs 
          WHERE ID_blog = ${id_blog}`;
      connection.query(SQLquery, async (err, results, fields) => {
        if (results.length != 0) {
          connection.end();
          res.send({
            status: "Success",
            publications: [],
            nom_blog: results[0]["nom_blog"],
            id_user: results[0]["id_user"],
            doubleAuthent: doubleAuthent,
          });
        } else {
          connection.end();
          res.send({
            status: "Error",
            publications: [],
            nom_blog: "NC",
            id_user: decoded.ID_user,
            doubleAuthent: doubleAuthent,
          });
        }
      });
    }
  });
});

app.post("/delete-publication", (req, res) => {
  id_publication = req.body[0].id_publication;
  SQLquery = `DELETE FROM publications WHERE ID_publication = ${id_publication}`;

  const connection = mysql.createConnection({
    host: process.env.HOST_MYSQL,
    user: process.env.USERNAME_MYSQL,
    password: process.env.PASSWORD_MYSQL,
    database: process.env.DATABASE_MYSQL,
  });

  connection.query(SQLquery, async (err, results, fields) => {
    connection.end();
    res.send({
      status: "Success",
      message: "Publication supprimée avec succès",
    });
  });
});

app.post("/add-publication", (req, res) => {
  const newTitle = req.body[0]["newTitle"];
  const newDescription = req.body[0]["newDescription"];
  const userID = req.body[0]["userID"];
  const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");
  const blogID = req.body[0]["blogID"];

  const SQLquery = `INSERT INTO publications (Title, Description, User_ID, date_creation, Blog_ID) VALUES ('${newTitle}', '${newDescription}', ${userID}, '${currentDate}', ${blogID})`;

  const connection = mysql.createConnection({
    host: process.env.HOST_MYSQL,
    user: process.env.USERNAME_MYSQL,
    password: process.env.PASSWORD_MYSQL,
    database: process.env.DATABASE_MYSQL,
  });

  connection.query(SQLquery, (err, results, fields) => {
    if (!err) {
      connection.end();
      res.send({
        status: "Success",
        message: "Publication ajoutée avec succès",
      });
    } else {
      connection.end();
      console.error("Erreur lors de l'insertion de la publication :", err);
      res.send({
        status: "Error",
        message: "Échec de l'ajout de la publication",
      });
    }
  });
});

app.post("/add-blog", (req, res) => {
  const newTitle = req.body[0]["newTitle"];
  const newAccess = req.body[0]["newAccess"];
  const userID = req.body[0]["userID"];

  const SQLquery = `INSERT INTO blogs (Title, Access, User_ID) VALUES ('${newTitle}', '${newAccess}', ${userID})`;

  const connection = mysql.createConnection({
    host: process.env.HOST_MYSQL,
    user: process.env.USERNAME_MYSQL,
    password: process.env.PASSWORD_MYSQL,
    database: process.env.DATABASE_MYSQL,
  });

  connection.query(SQLquery, (err, results, fields) => {
    if (!err) {
      connection.end();
      res.send({
        status: "Success",
        message: "Blog ajouté avec succès",
      });
    } else {
      console.error("Erreur lors de l'insertion du blog :", err);
      connection.end();
      res.send({
        status: "Error",
        message: "Échec de l'ajout du blog",
      });
    }
  });
});

// Route pour mettre à jour une publication
app.post("/edit-publication", (req, res) => {
  let newTitle = req.body[0]["newTitle"];
  let newDescription = req.body[0]["newDescription"];
  let id_publication = req.body[0]["id_publication"];

  let SQLquery;

  SQLquery = `UPDATE publications SET Title = '${newTitle}', Description = '${newDescription}' WHERE ID_publication = ${id_publication}`;

  const connection = mysql.createConnection({
    host: process.env.HOST_MYSQL,
    user: process.env.USERNAME_MYSQL,
    password: process.env.PASSWORD_MYSQL,
    database: process.env.DATABASE_MYSQL,
  });

  connection.query(SQLquery, async (err, results, fields) => {
    if (results.length != 0) {
      connection.end();
      res.send({
        status: "Success",
        message: "Modification effectué avec succès ",
      });
    } else {
      connection.end();
      res.send({
        status: "Error",
        message: "echec de la modification",
      });
    }
  });
});

// Route pour mettre à jour un blog
app.post("/edit-blog", (req, res) => {
  let newTitle = req.body[0]["newTitle"];
  let newAccess = req.body[0]["newAccess"];
  let id_blog = req.body[0]["id_blog"];

  let SQLquery;

  SQLquery = `UPDATE blogs SET Title = '${newTitle}', Access = '${newAccess}' WHERE ID_blog = ${id_blog}`;

  const connection = mysql.createConnection({
    host: process.env.HOST_MYSQL,
    user: process.env.USERNAME_MYSQL,
    password: process.env.PASSWORD_MYSQL,
    database: process.env.DATABASE_MYSQL,
  });

  connection.query(SQLquery, async (err, results, fields) => {
    if (results.length != 0) {
      connection.end();
      res.send({
        status: "Success",
        message: "Modification effectué avec succès ",
      });
    } else {
      connection.end();
      res.send({
        status: "Error",
        message: "echec de la modification",
      });
    }
  });
});

app.post("/delete-blog", (req, res) => {
  let SQLquery;

  let id_blog = req.body[0]["id_blog"];

  const connection = mysql.createConnection({
    host: process.env.HOST_MYSQL,
    user: process.env.USERNAME_MYSQL,
    password: process.env.PASSWORD_MYSQL,
    database: process.env.DATABASE_MYSQL,
  });

  SQLquery = `DELETE FROM publications WHERE Blog_ID = ${id_blog}`;
  connection.query(SQLquery, async (err, results, fields) => {
    SQLquery = `DELETE FROM blogs WHERE ID_blog = ${id_blog}`;
    connection.query(SQLquery, async (err, results, fields) => {
      connection.end();
      res.send({
        status: "Success",
        message: "Publication supprimée avec succès",
      });
    });
  });
});

// Route pour récupérer l'intégralité des blogs
app.get("/blog", (req, res) => {
  const id_blog = req.query.idblog;

  const connection = mysql.createConnection({
    host: process.env.HOST_MYSQL,
    user: process.env.USERNAME_MYSQL,
    password: process.env.PASSWORD_MYSQL,
    database: process.env.DATABASE_MYSQL,
  });

  connection.query(
    `SELECT * from blogs WHERE ID_blog = ${id_blog}`,
    async (err, results, fields) => {
      if (results.length != 0) {
        connection.end();
        res.send({
          blog: results[0],
        });
      } else {
        connection.end();
        res.send({
          status: "Error",
          message: "echec envoi des blogs",
        });
      }
    }
  );
});

app.get("/qrcode/:user", (req, res) => {
  const authenticatorSecret = genererCleSecrete();
  const user = req.params.user;
  const service = "ProjetDevAuthLiveCampus";

  const otpauth = authenticator.keyuri(user, service, authenticatorSecret);

  qrcode.toDataURL(otpauth, (err, imageUrl) => {
    if (err) {
      res.status(500).send({
        status: "Error",
        message: "Internal Server Error",
      });
      return;
    }

    res.send({
      //status: "Success",
      //message: "Code Valide",
      secretKey: authenticatorSecret,
      qrcode: "<img src='" + imageUrl + "' alt='qrcode'>",
    });
  });
});

app.post("/verify", async (req, res) => {
  //Récupération du code saisi par l'utilisateur
  const token = req.body[0].token;
  let tokenJWT = req.body[0].tokenJWT.tokenJWT;
  var decoded = jwt.verify(tokenJWT, process.env.SECRET_KEY_JWT);
  const authenticatorSecret = await getSecretKeyById(decoded.ID_user);

  try {
    // Si la personne n'a pas saisi le token, c'est non
    if (!token) {
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

        // On stocke le JWT en BD (WhiteList)

        const SQLquery = `INSERT INTO UserJWT (User_ID, JWT) VALUES ('${decoded.ID_user}', '${tokenJWT}')`;

        const connection = mysql.createConnection({
          host: process.env.HOST_MYSQL,
          user: process.env.USERNAME_MYSQL,
          password: process.env.PASSWORD_MYSQL,
          database: process.env.DATABASE_MYSQL,
        });

        connection.query(SQLquery, (err, results, fields) => {
          if (err) {
            console.error("Erreur lors de l'insertion du JWT:", err);
          }
        });

        connection.end();
        res.send({
          status: "Success",
          message: "Code Valide",
          tokenJWT: tokenJWT,
        });
      } catch (error) {
        connection.end();
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

app.post("/enable-2fa", async (req, res) => {
  //Récupération du code saisi par l'utilisateur
  const token = req.body[0].token;
  let tokenJWT = req.body[0].tokenJWT.tokenJWT;
  var decoded = jwt.verify(tokenJWT, process.env.SECRET_KEY_JWT);
  const authenticatorSecret = req.body[0].secretKey;

  const emailUser = req.body[0].emailUser;

  try {
    // Si la personne n'a pas saisi le token, c'est non
    if (!token) {
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

      const connection = mysql.createConnection({
        host: process.env.HOST_MYSQL,
        user: process.env.USERNAME_MYSQL,
        password: process.env.PASSWORD_MYSQL,
        database: process.env.DATABASE_MYSQL,
      });

      const insertSecretKeyQuery = `UPDATE Users SET secretKey = '${authenticatorSecret}' WHERE email = '${emailUser}'`;
      connection.query(insertSecretKeyQuery, (err, results, fields) => {
        if (err) {
          console.error(
            "Erreur lors de l'ajout de la clé secrète à la base de données :",
            err
          );
          return;
        }
      });

      connection.query(
        `UPDATE USERS SET 2faIsActivated = 1 WHERE Email = '${emailUser}'`,
        async (err, results, fields) => {
          if (!err) {
            connection.end();
            res.send({
              status: "Success",
              message: "Code Valide",
            });
          } else {
            console.error("Erreur de connexion à la base de données :", err);
            connection.end();
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

app.post("/get-cookies", async (req, res) => {
  if (req.body[0].tokenJWT.tokenJWT) {
    let tokenJWT = req.body[0].tokenJWT.tokenJWT;
    var decoded = jwt.verify(tokenJWT, process.env.SECRET_KEY_JWT);

    //let secretKeyExist = !isNull(getSecretKeyById(decoded.ID_user));
    let secretKeyExist = (await getSecretKeyById(decoded.ID_user))
      ? true
      : false;
    const loggedIn = decoded.loggedIn;
    const doubleAuthent = decoded.doubleAuthent;
    res.send({
      status: "Success",
      loggedIn: loggedIn,
      doubleAuthent: doubleAuthent,
      email: decoded.email,
      username: decoded.username,
      ID_user: decoded.ID_user,
      secretKeyExist: secretKeyExist,
    });
  } else {
    res.send({
      status: "Error",
      loggedIn: false,
      doubleAuthent: false,
      email: false,
      secretKeyExist: false,
    });
  }
});

app.post("/logoutAll", async (req, res) => {
  //Récupération du code saisi par l'utilisateur
  const token = req.body[0].token;
  let tokenJWT = req.body[0].tokenJWT.tokenJWT;
  var decoded = jwt.verify(tokenJWT, process.env.SECRET_KEY_JWT);
  const authenticatorSecret = await getSecretKeyById(decoded.ID_user);

  // On vérifie si le code est bon
  const isValid = authenticator.check(token, authenticatorSecret);
  if (isValid) {
    SQLquery = `DELETE FROM UserJWT WHERE User_ID = ${decoded.ID_user}`;

    const connection = mysql.createConnection({
      host: process.env.HOST_MYSQL,
      user: process.env.USERNAME_MYSQL,
      password: process.env.PASSWORD_MYSQL,
      database: process.env.DATABASE_MYSQL,
    });

    connection.query(SQLquery, async (err, results, fields) => {
      connection.end();
      res.send({
        status: "Success",
        message: "Token supprimés avec succès",
      });
    });
  } else {
    connection.end();
    res.send({
      status: "Error",
      message: "Token Invalide",
    });
  }
});

app.post("/logout", (req, res) => {
  let tokenJWT = req.body[0].tokenJWT.tokenJWT;

  SQLquery = `DELETE FROM UserJWT WHERE JWT = '${tokenJWT}'`;

  const connection = mysql.createConnection({
    host: process.env.HOST_MYSQL,
    user: process.env.USERNAME_MYSQL,
    password: process.env.PASSWORD_MYSQL,
    database: process.env.DATABASE_MYSQL,
  });
  connection.query(SQLquery, async (err, results, fields) => {
    if (!err) {
      connection.end();
      res.send({
        status: "Success",
        message: "Vous êtes déconnecté avec succès",
      });
    } else {
      connection.end();
      res.send({
        status: "Error",
        message: "Erreur de déconnexion",
      });
    }
  });
});

app.post("/check-jwt", (req, res) => {
  let tokenJWT = req.body[0].tokenJWT.tokenJWT;

  const connection = mysql.createConnection({
    host: process.env.HOST_MYSQL,
    user: process.env.USERNAME_MYSQL,
    password: process.env.PASSWORD_MYSQL,
    database: process.env.DATABASE_MYSQL,
  });
  SQLquery = `SELECT JWT from userjwt WHERE JWT = '${tokenJWT}'`;

  connection.query(SQLquery, async (err, results, fields) => {
    if (results.length !== 0) {
      connection.end();
      res.send({
        status: "Success",
      });
    } else {
      connection.end();
      res.send({
        status: "Error",
        message: "Veuillez vous reconnecter ! ",
      });
    }
  });
});

function genererCleSecrete() {
  const caracteresPermis =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let cleSecrete = "";

  for (let i = 0; i < 50; i++) {
    const index = Math.floor(Math.random() * caracteresPermis.length);
    cleSecrete += caracteresPermis.charAt(index);
  }

  return cleSecrete;
}

function getSecretKeyById(userID) {
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection({
      host: process.env.HOST_MYSQL,
      user: process.env.USERNAME_MYSQL,
      password: process.env.PASSWORD_MYSQL,
      database: process.env.DATABASE_MYSQL,
    });

    const selectSecretKeyQuery = `SELECT secretKey FROM users WHERE ID_user = ${userID}`;

    connection.query(selectSecretKeyQuery, (err, results, fields) => {
      if (results.length > 0) {
        if (results[0].secretKey !== null) {
          const secretKey = results[0].secretKey;
          connection.end();
          resolve(secretKey.toString());
        } else {
          connection.end();
          resolve(null);
        }
      } else {
        console.log("Aucun utilisateur trouvé avec l'ID spécifié.");
        connection.end();
        resolve(null);
      }
    });
  });
}

app.listen(5000, () => {
  console.log("listening");
});
