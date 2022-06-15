const express = require("express");
const request = require("request");
const app = express();
app.use(express.json());
app.get("/", function (req, res) {
  res.send("hello world");
});

app.get("/getToken", function (req, res) {
  const client_id = "14dc5193caff412f8f89e92a4c43faba";
  const client_secret = "01515647e97d44b198aad1db032dd72e";
  const test = new Buffer(client_id + ":" + client_secret).toString("base64");
  const postQuery = "grant_type=client_credentials";

  request(
    {
      url: "https://accounts.spotify.com/api/token",
      method: "POST",
      headers: {
        Authorization: "Basic " + test,
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": postQuery.length,
      },
      body: postQuery,
    },

    function (error, response, data) {
      //send the access token back to client
      console.log(data);
      res.end(data);
    }
  );
});

app.listen(5000, () => {
  console.log("listening at port 5000");
});
