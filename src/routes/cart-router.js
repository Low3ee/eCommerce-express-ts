"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_js_1 = __importDefault(require("../lib/db.js"));
const user_validation_js_1 = require("../middleware/user-validation.js");
const cartRouter = express_1.default.Router();
// Add item to cart
cartRouter.post("/addItem", 
// validateSession,
(req, res, next) => {
    const { userId, productId, quantity } = req.body;
    db_js_1.default.query("SELECT id FROM cart WHERE userId = ?", [userId], (err, result) => {
        if (err) {
            return res.status(500).send({
                message: err,
            });
        }
        let cartId;
        if (result && result.length) {
            cartId = result[0].id;
            addToCart(cartId, productId, quantity, res);
        }
        else {
            // If cart doesn't exist, create a new cart
            db_js_1.default.query("INSERT INTO cart (userId) VALUES (?)", [userId], (err, result) => {
                if (err) {
                    return res.status(500).send({
                        message: err,
                    });
                }
                cartId = result.insertId;
                addToCart(cartId, productId, quantity, res);
            });
        }
    });
});
function addToCart(cartId, productId, quantity, res) {
    // Insert the item into cart_items
    db_js_1.default.query("INSERT INTO cart_items (cartId, productId, quantity) VALUES (?, ?, ?)", [cartId, productId, quantity], (err, result) => {
        if (err) {
            return res.status(500).send({
                message: err,
            });
        }
        res.status(201).send({
            message: `Item added to cart successfully.`,
        });
    });
}
// Remove item from cart
cartRouter.delete("/removeItem/:cartItemId", user_validation_js_1.validateSession, (req, res, next) => {
    const cartItemId = req.params.cartItemId;
    db_js_1.default.query("DELETE FROM cart_items WHERE id = ?", [cartItemId], (err, result) => {
        if (err) {
            return res.status(500).send({
                message: err,
            });
        }
        res.status(200).send({
            message: `Item removed from cart successfully.`,
        });
    });
});
// Update quantity of an item in the cart
cartRouter.patch("/updateQuantity", user_validation_js_1.validateSession, (req, res, next) => {
    const { cartItemId, quantity } = req.body;
    db_js_1.default.query("UPDATE cart_items SET quantity = ? WHERE id = ?", [quantity, cartItemId], (err, result) => {
        if (err) {
            return res.status(500).send({
                message: err,
            });
        }
        res.status(200).send({
            message: `Quantity updated successfully.`,
        });
    });
});
// Get all items in the cart
cartRouter.get("/getAllItems/:userId", user_validation_js_1.validateSession, (req, res, next) => {
    const userId = req.params.userId;
    db_js_1.default.query("SELECT ci.id, p.name AS productName, ci.quantity FROM cart_items ci JOIN products p ON ci.productId = p.id WHERE ci.cartId = (SELECT id FROM cart WHERE userId = ?)", [userId], (err, result) => {
        if (err) {
            return res.status(500).send({
                message: err,
            });
        }
        res.status(200).send({
            message: `Items fetched successfully.`,
            items: result,
        });
    });
});
exports.default = cartRouter;
