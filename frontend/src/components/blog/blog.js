function Blog(props) {
  const { title, access, user } = props;

  return (
    <div>
      <p>{title}</p>
      {/*Token !== "" ? <p>{access}</p> : ""*/}
      <p>{user}</p>
    </div>
  );
}

export default Blog;
