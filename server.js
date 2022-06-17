const express = require("express");
require("dotenv").config();
const fs = require("fs");
const request = require("request");
const cors = require("cors");
const querystring = require("querystring");
const cookieParser = require("cookie-parser");
const cookie = require("cookie");
const app = express();
app.use(express.json());

const client_id = process.env.CLIENT_ID; // Your client id
const client_secret = process.env.CLIENT_SECRET; // Your secret
const redirect_uri = process.env.REDIRECT_URI; // Your redirect uri

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://bobnearents.com"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/login", function (req, res) {
  // your application requests authorization
  const scope =
    "user-read-recently-played user-read-playback-position user-read-playback-state user-read-currently-playing";
  res.send(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
      })
  );
});

app.get("/access-token", function (req, res) {
  // your application requests refresh and access tokens
  // after checking the state parameter

  const code = req.query.code;

  const authOptions = {
    url: "https://accounts.spotify.com/api/token",
    form: {
      code: code,
      redirect_uri: redirect_uri,
      grant_type: "authorization_code",
    },
    headers: {
      Authorization:
        "Basic " +
        new Buffer(client_id + ":" + client_secret).toString("base64"),
    },
    json: true,
  };
  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      const access_token = body.access_token;
      const refresh_token = body.refresh_token;

      const options = {
        url: "https://api.spotify.com/v1/me",
        headers: { Authorization: "Bearer " + access_token },
        json: true,
      };

      // we can also pass the token to the browser to make requests from there
      res.send({
        access_token: access_token,
        refresh_token: refresh_token,
      });
    } else {
      res.redirect(
        "/#" +
          querystring.stringify({
            error: "invalid_token",
          })
      );
    }
  });
});

app.get("/refresh_token", function (req, res) {
  // requesting access token from refresh token
  const refresh_token = req.query.refresh_token;
  const authOptions = {
    url: "https://accounts.spotify.com/api/token",
    headers: {
      Authorization:
        "Basic " +
        new Buffer(client_id + ":" + client_secret).toString("base64"),
    },
    form: {
      grant_type: "refresh_token",
      refresh_token: refresh_token,
    },
    json: true,
  };

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      const access_token = body.access_token;
      res.send({
        access_token: access_token,
      });
    }
  });
});

app.get("/current-song", function (req, res) {
  const { token } = req.query;
  const authOptions = {
    url: "https://api.spotify.com/v1/me/player/currently-playing?market=ES",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    json: true,
  };
  request.get(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      res.send(body);
    } else {
      console.log(response.statusCode, body);
    }
  });
});

app.get("/lyrics", function (req, res) {
  const { artist, title } = req.query;
  const authOptions = {
    url: `https://api.lyrics.ovh/v1/${artist}/${title}`,
    headers: {
      "Content-Type": "application/json",
    },
    json: true,
  };
  request.get(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      res.send(body);
    } else {
      res.send("no lyrics");
      console.log("lyrics error");
    }
  });
});

app.listen(5000, () => {
  console.log("listening at port 5000");
});
