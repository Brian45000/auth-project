import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import axios from "axios";
import Blog from "../components/blog";
import { useCookies } from "react-cookie";

export async function data_axios(url) {
  //let config = { headers: { Authorization: `Bearer ${token}` } };

  const { data } = await axios.get(url);
  return data;
}

function Home() {
  const [blogs, setBlogs] = useState();
  const [cookies, setCookie] = useCookies(["tokenJWT"]);

  useEffect(() => {
    const getBlogs = async () => {
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
      {/*blogs?.map((blog) => (
        <Blog title={blog.title} acces={blog.acces} user={blog.user} />
      ))}
      {/*<div>{/*<Blog title={"titre"} acces={"acces"} user={"user"} />}</div>*/}
    </div>
  );
}

export default Home;