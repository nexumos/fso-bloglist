const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);

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

beforeEach(async () => {
  await Blog.deleteMany({});
  let blogObject = new Blog(initialBlogs[0]);
  await blogObject.save();
  blogObject = new Blog(initialBlogs[1]);
  await blogObject.save();
});

test("blogs are returned as json", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("blogs have an 'id' property", async () => {
  const response = await api.get("/api/blogs");

  expect(response.body[0].id).toBeDefined();
});

test("blogs can be posted", async () => {
  const blogToPost = {
    title: "My very new blog",
    author: "Ricardo",
    url: "www.blog.com",
    likes: 0,
  };

  const numBlogsBefore = (await api.get("/api/blogs")).body.length;
  await api.post("/api/blogs").send(blogToPost);
  const numBlogsAfter = (await api.get("/api/blogs")).body.length;
  expect(numBlogsAfter).toBe(numBlogsBefore + 1);
});

test("there are two blogs", async () => {
  const response = await api.get("/api/blogs");

  expect(response.body).toHaveLength(2);
});

test("the first note is about HTTP methods", async () => {
  const response = await api.get("/api/blogs");

  expect(response.body[0].title).toBe("HTML is easy");
});

test("can get blog by id", async () => {
  const response = await api.get("/api/blogs");
  const idToGet = response.body[0].id;
  const responseBlog = await api.get(`/api/blogs/${idToGet}`);
  expect(responseBlog.body.title).toBe("HTML is easy");
});

test("blogs can be deleted", async () => {
  const response = await api.get("/api/blogs");
  const idToDelete = response.body[0].id;
  await api.delete(`/api/blogs/${idToDelete}`).expect(204);
});

test("blogs can be updated", async () => {
  const response = await api.get("/api/blogs");
  const idToUpdate = response.body[0].id;
  const updatedBlog = {
    title: "Totally Transformed",
    author: "Tina",
    url: "www.TMC.com",
    likes: 99,
  };
  await api.put(`/api/blogs/${idToUpdate}`).send(updatedBlog);
  const newResponse = await api.get(`/api/blogs/${idToUpdate}`);
  expect(newResponse.body.likes).toBe(99);
});

afterAll(async () => {
  await mongoose.connection.close();
});
