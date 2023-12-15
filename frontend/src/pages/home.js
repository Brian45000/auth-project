import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import axios from "axios";
import Blog from "../components/blog";
import { useCookies } from "react-cookie";

function Home() {
  const [blogs, setBlogs] = useState();
  const [cookies, setCookie] = useCookies(["tokenJWT"]);

  useEffect(() => {
    //function pour récuperer nos blogs
    const getBlogs = async () => {
      // on lis le champ de notre cookie grace à columnNames
      const data = [cookies];
      const columnNames = ["tokenJWT"];

      const jsonData = [
        data.reduce((obj, val, i) => {
          obj[columnNames[i]] = val;
          return obj;
        }, {}),
      ];

      await axios
        .post("http://localhost:5000/blogs", JSON.stringify(jsonData), {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          setBlogs(res.data.blogs);
        });
    };
    getBlogs();
  }, [cookies]);

  return (
    <div style={{ width: "100%" }}>
      <NavBar />
      <h2 className="titleH2">Liste des blogs : </h2>
      {blogs && (
        <div className="blog-container">
          {blogs?.map((blog) => (
            <Blog
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
    </div>
  );
}

export default Home;
