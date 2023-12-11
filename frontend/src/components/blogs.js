import axios from "axios";

async function Blogs() {
  //let config = { headers: { Authorization: `Bearer ${token}` } };

  const { data } = await axios.get("localhost:3000/blogs");
  return data;
}

export default Blogs;
