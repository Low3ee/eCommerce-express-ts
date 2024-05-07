import express, { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import db from "../lib/db.js";
import {
  validateAdminSession,
  validateRegistration,
  validateSession,
} from "../middleware/user-validation.js";
import { request } from "http";

const productRouter = express.Router();

productRouter.post(
  "/addProduct",
  validateAdminSession,
  (req: Request, res: Response, next: NextFunction) => {
    db.query(
      "SELECT id FROM products WHERE LOWER(name) = LOWER(?)",
      [req.body.name],
      (err: any, result: string | any[]) => {
        if (result && result.length) {
          return res.status(409).send({
            message: "This product already exists.",
          });
        } else {
          db.query(
            "INSERT INTO products(name, price, description, category, createdby) VALUES (?, ?, ?, ?, ?)",
            [
              req.body.name,
              req.body.price,
              req.body.description,
              req.body.category,
              req.body.createdby,
            ],
            (err: any, result: any) => {
              if (err) {
                return res.status(500).send({
                  message: err,
                });
              } else {
                return res.status(201).send({
                  message: `Product added successfully.`,
                });
              }
            }
          );
        }
      }
    );
  }
);

productRouter.get(
  "/allProducts",
  (req: Request, res: Response, next: NextFunction) => {
    db.query("SELECT * FROM products WHERE 1", (err: any, result: any) => {
      if (err) {
        return res.status(500).send({
          message: err,
        });
      }
      return res.status(200).send({
        message: "products fetched successfully.",
        products: result,
      });
    });
  }
);

productRouter.patch(
  "/editProduct",
  validateAdminSession,
  (req: Request, res: Response, next: NextFunction) => {
    db.query(
      "UPDATE products SET name = ?, price = ?, description = ?, category = ?, modifiedby = ?, modified_at = CURRENT_TIMESTAMP WHERE id = ?",
      [
        req.body.name,
        req.body.price,
        req.body.description,
        req.body.category,
        req.body.modifiedby,
        req.body.productId,
      ],
      (err: any, result: any) => {
        if (err) {
          return res.status(500).send({
            message: err,
          });
        } else {
          return res.status(201).send({
            message: `Product modified successfully.`,
          });
        }
      }
    );
  }
);

productRouter.delete(
  "/deleteProduct/:productId",
  validateAdminSession,
  (req: Request, res: Response, next: NextFunction) => {
    const productId = req.params.productId;
    db.query(
      "DELETE FROM products WHERE id = ?",
      [productId],
      (err: any, result: any) => {
        if (err) {
          return res.status(500).send({
            message: err,
          });
        } else {
          res.send({
            message: "Product deleted successfully",
          });
        }
      }
    );
  }
);

export default productRouter;
