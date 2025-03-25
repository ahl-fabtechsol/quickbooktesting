require("dotenv").config();
const express = require("express");
const OAuthClient = require("intuit-oauth");

const app = express();
const port = 3000;

const oauthClient = new OAuthClient({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  environment: process.env.ENVIRONMENT,
  redirectUri: process.env.REDIRECT_URI,
});

app.get("/auth", (req, res) => {
  const authUri = oauthClient.authorizeUri({
    scope: [OAuthClient.scopes.Accounting, OAuthClient.scopes.OpenId],
    state: "testState",
  });
  res.redirect(authUri);
});

app.get("/callback", async (req, res) => {
  const parseRedirect = req.url;
  try {
    const authResonse = await oauthClient.createToken(parseRedirect);
    res.redirect("/payments");
  } catch (error) {
    console.error(error);
  }
});

app.get("/payments", async (req, res) => {
  try {
    const response = await oauthClient.makeApiCall({
      url: "https://sandbox-quickbooks.api.intuit.com/v3/company/9341454349391557/query?query=select * from Payment&minorversion=75",
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    res.json(response.json);
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
