import express, { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { v4 } from "uuid";
import jwt from "jsonwebtoken";
import db from "../lib/db.js";
import {
  validateAdminSession,
  validateRegistration,
  validateSession,
} from "../middleware/user-validation.js";

const userRouter = express.Router();

userRouter.post(
  "/signup",
  validateRegistration,
  (req: Request, res: Response, next: NextFunction) => {
    db.query(
      "SELECT id FROM users WHERE LOWER(username) = LOWER(?)",
      [req.body.username],
      (err: any, result: string | any[]) => {
        if (result && result.length) {
          return res.status(409).send({
            message: "This username is already taken.",
          });
        } else {
          bcrypt.hash(req.body.password, 10, (err, hash) => {
            if (err) {
              res.status(500).send({
                message: err,
              });
            } else {
              db.query(
                "INSERT INTO users(id, email, fname, lname, username, password) VALUES (?, ?, ?, ?, ?, ?)",
                [
                  v4(),
                  req.body.email,
                  req.body.fname,
                  req.body.lname,
                  req.body.username,
                  hash,
                ],
                (err: any, result: any) => {
                  if (err) {
                    return res.status(500).send({
                      message: err,
                    });
                  } else {
                    return res.status(201).send({
                      message: `Registered successfully.`,
                    });
                  }
                }
              );
            }
          });
        }
      }
    );
  }
);

userRouter.post("/login", (req: Request, res: Response, next: NextFunction) => {
  const { creds, password } = req.body;
  const input = creds.includes("@") ? "email" : "username";

  console.log(`logging in using ${input}`);

  db.query(
    `SELECT * FROM users WHERE ${input} = ?`,
    [creds],
    (err: any, result: any[]) => {
      if (err) {
        return res.status(500).send({
          message: "Database error",
          error: err,
        });
      }

      if (!result.length) {
        return res.status(400).send({
          message: `There is no account with that ${input}`,
        });
      }

      const user = result[0];

      if (!user.password) {
        return res.status(400).send({
          message: "User password not found",
        });
      }

      bcrypt.compare(password, user.password, (bErr, bResult) => {
        if (bErr) {
          return res.status(500).send({
            message: "Bcrypt error",
            error: bErr,
          });
        }

        if (bResult) {
          const tokenKey = process.env.TOKEN_KEY || "secret_token";
          db.query(
            `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ${user.id}`
          );
          const token = jwt.sign(
            {
              username: user.username,
              userId: user.id,
              role: user.role,
            },
            tokenKey,
            { expiresIn: "7d" }
          );
          return res.status(200).send({
            message: "Login successful",
            token,
          });
        }

        return res.status(400).send({
          message: "Password is incorrect.",
        });
      });
    }
  );
});

userRouter.get(
  "/secret",
  validateAdminSession,
  (req: Request, res: Response, next: NextFunction) => {
    res.send("Welcome to the secret route =>");
  }
);

userRouter.patch(
  "/edit/:userId",
  validateSession,
  (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
    db.query(
      `UPDATE users SET email = ?, username = ?, fname = ?, lname = ?, modified_at = CURRENT_TIMESTAMP WHERE id = ${userId}`,
      [req.body.email, req.body.username, req.body.fname, req.body.lname],
      (err: any, result: any) => {
        if (err) {
          return res.status(500).send({
            message: "Database Error",
            error: err,
          });
        }
        return res.status(200).send({
          message: "User modified successfully!",
        });
      }
    );
  }
);

userRouter.delete(
  "/delete/:userId",
  validateSession,
  (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
    db.query(
      `DELETE FROM users WHERE id = ${userId}`,
      (err: any, result: any) => {
        if (err) {
          res.status(500).send({
            message: `Database Error ${err}`,
            err: err,
          });
        } else {
          res.status(200).send({
            message: "User Deleted successfully.",
          });
        }
      }
    );
  }
);

export default userRouter;
