const User = require("../models/user");
const Blog = require("../models/blog");

const initialBlogs = [
  {
    title: "HTML is easy",
    author: "Joseph",
    url: "www.google.com",
    likes: 2,
  },
  {
    title: "Web Development is Hard",
    author: "Gregory",
    url: "www.bing.com",
    likes: 10,
  },
];

const nonExistingId = async () => {
  const blog = new Blog({ title: "willremovethissoon" });
  await blog.save();
  await blog.remove();

  return blog._id.toString();
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((u) => u.toJSON());
};

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  //console.log(blogs);
  return blogs.map((b) => b.toJSON());
};

module.exports = {
  initialBlogs,
  nonExistingId,
  blogsInDb,
  usersInDb,
};
