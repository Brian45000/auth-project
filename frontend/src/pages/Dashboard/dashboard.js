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
