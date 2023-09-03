const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const helper = require("./test_helper");
const Blog = require("../models/blog");

describe("when there are initially two blogs in db", () => {
  beforeEach(async () => {
    await Blog.deleteMany({});
    for (let blog of helper.initialBlogs) {
      let blogObject = new Blog(blog);
      await blogObject.save();
    }
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

  test("blogs can be created", async () => {
    const blogToPost = {
      title: "My very new blog",
      author: "Ricardo",
      url: "www.blog.com",
      likes: 0,
    };
    await api.post("/api/blogs").send(blogToPost);
    const blogsAfter = await helper.blogsInDb();
    expect(blogsAfter).toHaveLength(helper.initialBlogs.length + 1);
  });

  test("created blogs have a 'user' property", async () => {
    const blogToPost = {
      title: "My very new blog",
      author: "Ricardo",
      url: "www.blog.com",
      likes: 0,
    };
    await api.post("/api/blogs").send(blogToPost);
    const newBlog = await Blog.findOne({ title: "My very new blog" });
    console.log(newBlog.user);
    expect(newBlog.user).toBeDefined();
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
});
