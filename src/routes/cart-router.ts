import express, { Request, Response, NextFunction } from "express";
import db from "../lib/db.js";
import { validateSession } from "../middleware/user-validation.js";

const cartRouter = express.Router();

// Add item to cart
cartRouter.post(
  "/addItem",
  // validateSession,
  (req: Request, res: Response, next: NextFunction) => {
    const { userId, productId, quantity } = req.body;

    db.query(
      "SELECT id FROM cart WHERE userId = ?",
      [userId],
      (err: any, result: any) => {
        if (err) {
          return res.status(500).send({
            message: err,
          });
        }

        let cartId;
        if (result && result.length) {
          cartId = result[0].id;
          addToCart(cartId, productId, quantity, res);
        } else {
          // If cart doesn't exist, create a new cart
          db.query(
            "INSERT INTO cart (userId) VALUES (?)",
            [userId],
            (err: any, result: any) => {
              if (err) {
                return res.status(500).send({
                  message: err,
                });
              }
              cartId = result.insertId;
              addToCart(cartId, productId, quantity, res);
            }
          );
        }
      }
    );
  }
);

function addToCart(
  cartId: number,
  productId: number,
  quantity: number,
  res: Response
) {
  // Insert the item into cart_items
  db.query(
    "INSERT INTO cart_items (cartId, productId, quantity) VALUES (?, ?, ?)",
    [cartId, productId, quantity],
    (err: any, result: any) => {
      if (err) {
        return res.status(500).send({
          message: err,
        });
      }
      res.status(201).send({
        message: `Item added to cart successfully.`,
      });
    }
  );
}
// Remove item from cart
cartRouter.delete(
  "/removeItem/:cartItemId",
  validateSession,
  (req: Request, res: Response, next: NextFunction) => {
    const cartItemId = req.params.cartItemId;

    db.query(
      "DELETE FROM cart_items WHERE id = ?",
      [cartItemId],
      (err: any, result: any) => {
        if (err) {
          return res.status(500).send({
            message: err,
          });
        }
        res.status(200).send({
          message: `Item removed from cart successfully.`,
        });
      }
    );
  }
);

// Update quantity of an item in the cart
cartRouter.patch(
  "/updateQuantity",
  validateSession,
  (req: Request, res: Response, next: NextFunction) => {
    const { cartItemId, quantity } = req.body;

    db.query(
      "UPDATE cart_items SET quantity = ? WHERE id = ?",
      [quantity, cartItemId],
      (err: any, result: any) => {
        if (err) {
          return res.status(500).send({
            message: err,
          });
        }
        res.status(200).send({
          message: `Quantity updated successfully.`,
        });
      }
    );
  }
);

// Get all items in the cart
cartRouter.get(
  "/getAllItems/:userId",
  validateSession,
  (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;

    db.query(
      "SELECT ci.id, p.name AS productName, ci.quantity FROM cart_items ci JOIN products p ON ci.productId = p.id WHERE ci.cartId = (SELECT id FROM cart WHERE userId = ?)",
      [userId],
      (err: any, result: any) => {
        if (err) {
          return res.status(500).send({
            message: err,
          });
        }
        res.status(200).send({
          message: `Items fetched successfully.`,
          items: result,
        });
      }
    );
  }
);

export default cartRouter;
