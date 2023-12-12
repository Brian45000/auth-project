function Blog(props) {
  const { title, acces, user } = props;

  return (
    <div>
      <p>{title}</p>
      {/*Token !== "" ? <p>{access}</p> : ""*/}
      <p>{acces}</p>
      <p>{user}</p>
    </div>
  );
}

export default Blog;
