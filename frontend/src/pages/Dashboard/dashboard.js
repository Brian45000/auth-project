import NavBar from "../../components/NavBar";
import "./styles.css";
import { useCookies } from "react-cookie";
import axios from "axios";
import BlogsDashboard from "../../components/BlogDashboard";
import { useState, useEffect } from "react";

function Dashboard() {
  const [blogsDashboard, setBlogsDashboard] = useState();
  const [IsAddBlog, SetIsAddBlog] = useState(false);
  const [cookies, setCookie] = useCookies(["tokenJWT"]);

  const [values, setValues] = useState({
    username: "",
    email: "",
    newTitle: "",
    newAccess: "",
    ID_user: "",
  });

  const handleChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  useEffect(() => {
    const getCookies = async () => {
      const data = [cookies];
      const columnNames = ["tokenJWT", "BlogUserId"];

      const jsonData = [
        data.reduce((obj, val, i) => {
          obj[columnNames[i]] = val;
          return obj;
        }, {}),
      ];

      await axios
        .post("http://localhost:5000/get-cookies", JSON.stringify(jsonData), {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          setValues({
            ...values,
            username: res.data.username,
            email: res.data.email,
            ID_user: res.data.ID_user,
          });
          //setValues({ ...values, email: res.data.email });
        });
    };
    getCookies();
    const getBlogs = async () => {
      const data = [cookies];
      const columnNames = ["tokenJWT"];

      const jsonData = [
        data.reduce((obj, val, i) => {
          obj[columnNames[i]] = val;
          return obj;
        }, {}),
      ];

      //
      // A MODIFIER C'EST PAS LA BONNE ROUTE !!
      //
      //
      await axios
        .post(
          "http://localhost:5000/blogs-dashboard",
          JSON.stringify(jsonData),
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        .then((res) => {
          setBlogsDashboard(res.data.blogs);
        });
    };
    getBlogs();
  }, [cookies]);

  const handleSubmitAdd = async (e) => {
    try {
      const sendAdd = async () => {
        const data = [values.newTitle, values.newAccess, values.ID_user];
        const columnNames = ["newTitle", "newAccess", "userID"];

        const jsonData = [
          data.reduce((obj, val, i) => {
            obj[columnNames[i]] = val;
            return obj;
          }, {}),
        ];

        await axios
          .post("http://localhost:5000/add-blog", JSON.stringify(jsonData), {
            headers: {
              "Content-Type": "application/json",
            },
          })
          .then((res) => {
            if (res.data.status === "Success") {
              SetIsAddBlog(false);
              window.location.reload();
            }
          });
      };
      sendAdd();
    } catch (e) {}
  };

  return (
    <div style={{ width: "100%" }}>
      <NavBar />
      <h2 className="titleH2">Bienvenue dans Votre Espace Personnel</h2>

      <section className="InfoUser">
        <h3>Informations Personnelles : </h3>
        <p>
          Nom: <span id="nomUtilisateur">{values.username}</span>
        </p>
        <p>
          Email: <span id="emailUtilisateur">{values.email}</span>
        </p>
      </section>

      <section>
        <h2 className="titleH2">
          Mes blogs :
          <>
            <button
              onClick={() => SetIsAddBlog(true)}
              className="detail-button"
            >
              Ajouter un blog ➕
            </button>
          </>
        </h2>
        {blogsDashboard && (
          <div className="blog-container">
            {IsAddBlog && (
              <div className="blog-card">
                <form>
                  <div>
                    <label htmlFor="newTitle">Titre :</label>
                    <input
                      type="text"
                      id="newTitle"
                      value={values.newTitle}
                      onChange={handleChange("newTitle")}
                    />
                  </div>
                  <div>
                    <label htmlFor="newAccess">Accès :</label>
                    <select
                      id="newAccess"
                      value={values.newAccess}
                      onChange={handleChange("newAccess")}
                    >
                      <option value="Public">Public</option>
                      <option value="Private">Private</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSubmitAdd()}
                    className="detail-button"
                  >
                    Enregistrer✏️
                  </button>
                  <button
                    onClick={() => SetIsAddBlog(false)}
                    className="delete-button"
                  >
                    Annuler ❌
                  </button>
                </form>
              </div>
            )}
            {blogsDashboard?.map((blog) => (
              <BlogsDashboard
                id={blog.ID_blog}
                title={blog.Title}
                access={blog.Access}
                key={blog.ID_blog}
                name={blog.FullName}
                nb_publi={blog.nb_publi}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
