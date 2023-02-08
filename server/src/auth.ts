import passport from "passport";
import { Strategy as SamlStrategy, ValidateInResponseTo, } from "@node-saml/passport-saml";
import session from "express-session";
import { v4 as uuidv4 } from "uuid";
import assert from "assert";
import fs from "fs";
import express from "express";
import {
  createUser,
  getUserByRitUsername,
} from "./repositories/Users/UserRepository";
import { getHoldsByUser } from "./repositories/Holds/HoldsRepository";
import { CurrentUser } from "./context";
import path from "path";

interface RitSsoUser {
  firstName: string;
  lastName: string;
  email: string;
  ritUsername: string;
}

// Map the test users from samltest.id to match
// the format that RIT SSO will give us.
function mapSamlTestToRit(testUser: any): RitSsoUser {
  return {
    firstName: testUser["urn:oid:2.5.4.42"],
    lastName: testUser["urn:oid:2.5.4.4"],
    email: testUser.email,
    ritUsername: testUser.email.split("@")[0],
  };
}

export function setupAuth(app: express.Application) {

  const secret = process.env.SESSION_SECRET;
  const issuer = process.env.ISSUER;
  const callbackUrl = process.env.CALLBACK_URL;
  const entryPoint = process.env.ENTRY_POINT;
  const reactAppUrl = process.env.REACT_APP_URL;
  const idpLogoutUrl = process.env.IDP_LOGOUT_URL;

  assert(secret, "SESSION_SECRET env value is null");
  assert(issuer, "ISSUER env value is null");
  assert(entryPoint, "ENTRY_POINT env value is null");
  assert(reactAppUrl, "REACT_APP_URL env value is null");

  app.use(
    session({
      genid: (req) => uuidv4(),
      secret: secret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: true,   // this will make cookies send only over https
        maxAge: 900000  // 15 minutes in milliseconds
      },
    })
  );

  const samlConfig = {
    issuer: issuer,
    path: "/login/callback",
    callbackUrl: callbackUrl,
    entryPoint: entryPoint,
    identifierFormat: undefined,
    decryptionPvk: fs.readFileSync(process.cwd() + "/cert/key.pem", "utf8"),
    privateCert: fs.readFileSync(process.cwd() + "/cert/key.pem", "utf8"),
    cert: fs.readFileSync(process.cwd() + "/cert/idp_cert.pem", "utf8"),
    validateInResponseTo: ValidateInResponseTo.never,
    disableRequestedAuthnContext: true,
    
    // TODO production solution
    acceptedClockSkewMs: 900000, // "SAML assertion not yet valid" fix
  };

  const samlStrategy = new SamlStrategy(
    samlConfig,
    (profile: any, done: any) => {
      // your body implementation on success, this is where we get attributes from the idp
      return done(null, profile);
    },
    (profile: any, done: any) => {
      // your body implementation on success, this is where we get attributes from the idp
      return done(null, profile);
    }
  );

  passport.use(samlStrategy);

  passport.serializeUser(async (user: any, done) => {
    const ritUser =
      process.env.SAML_IDP === "TEST" ? mapSamlTestToRit(user) : user;

    // Create user in our database if they don't exist
    const existingUser = await getUserByRitUsername(ritUser.ritUsername);
    if (!existingUser) {
      await createUser(ritUser);
    }

    done(null, ritUser.ritUsername);
  });

  passport.deserializeUser(async (username: string, done) => {
    const user = (await getUserByRitUsername(username)) as CurrentUser;

    if (!user) throw new Error("Tried to deserialize user that doesn't exist");

    // Populate user.hasHolds
    const holds = await getHoldsByUser(user.id);
    user.hasHolds = holds.some((hold) => !hold.removeDate);

    /* @ts-ignore */
    done(null, user);
  });

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  const authenticate = passport.authenticate("saml", {
    successRedirect: reactAppUrl,
    failureRedirect: "/login/fail",
  });

  app.get("/login", authenticate);

  app.post("/login/callback", authenticate);

  app.get("/login/fail", function (req, res) {
    res.status(401).send("Login failed");
  });

  app.post('/logout', (req, res) => {
    console.log("Test");
    console.log(req.user);
    if (req.session) {
      req.session.destroy(err => {
        console.log("Session destroyed");
        if (err) {
          console.log("Err");
          res.status(400).send('Logout failed');
        } else {
          console.log("Sending redirect...");
          res.clearCookie("connect.sid");
          res.redirect(reactAppUrl);
        }
      });
    } else {
      res.end();
    }
  });

  app.get("/Shibboleth.sso/Metadata", function (req, res) {
    res.type("application/xml");
    res
      .status(200)
      .send(
        samlStrategy.generateServiceProviderMetadata(
          fs.readFileSync(process.cwd() + "/cert/cert.pem", "utf8")
        )
      );
  });

  app.use(express.static(path.join(__dirname, '../../client/build')));
}
