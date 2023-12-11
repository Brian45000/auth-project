import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import axios from "axios";
//import Blog from "./blog";

export async function data_axios(url) {
  //let config = { headers: { Authorization: `Bearer ${token}` } };

  const { data } = await axios.get(url);
  return data;
}

function Home() {
  const [Blog, setBlogs] = useState({});
  useEffect(() => {
    data_axios("urlbrutamettre").then((res) => {
      setBlogs(res);
    });
  }, []);
  console.log(Blog);
  // const navigate = useNavigate();

  return (
    <div>
      <div>
        <NavBar />
      </div>
      <div>{/*<Blog title={"titre"} acces={"acces"} user={"user"} />*/}</div>
    </div>
  );
}

export default Home;
