"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_js_1 = __importDefault(require("../lib/db.js"));
const user_validation_js_1 = require("../middleware/user-validation.js");
const productRouter = express_1.default.Router();
productRouter.post("/addProduct", (req, res, next) => {
    db_js_1.default.query("SELECT id FROM products WHERE LOWER(name) = LOWER(?)", [req.body.name], (err, result) => {
        if (result && result.length) {
            return res.status(409).send({
                message: "This product already exists.",
            });
        }
        else {
            db_js_1.default.query("INSERT INTO products(name, price, description, category, createdby) VALUES (?, ?, ?, ?, ?)", [
                req.body.name,
                req.body.price,
                req.body.description,
                req.body.category,
                req.body.createdby,
            ], (err, result) => {
                if (err) {
                    return res.status(500).send({
                        message: err,
                    });
                }
                else {
                    return res.status(201).send({
                        message: `Product added successfully.`,
                    });
                }
            });
        }
    });
});
productRouter.get("/newArrivals", (req, res, next) => {
    db_js_1.default.query("SELECT * FROM products ORDER BY created_at LIMIT 10", (err, result) => {
        if (err) {
            return res.status(500).send({
                message: err,
            });
        }
        return res.status(200).send({
            message: "new products fetched successfully.",
            products: result,
        });
    });
});
productRouter.get("/allProducts", (req, res, next) => {
    db_js_1.default.query("SELECT * FROM products WHERE 1", (err, result) => {
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
});
productRouter.patch("/editProduct", user_validation_js_1.validateAdminSession, (req, res, next) => {
    db_js_1.default.query("UPDATE products SET name = ?, price = ?, description = ?, category = ?, modifiedby = ?, modified_at = CURRENT_TIMESTAMP WHERE id = ?", [
        req.body.name,
        req.body.price,
        req.body.description,
        req.body.category,
        req.body.modifiedby,
        req.body.productId,
    ], (err, result) => {
        if (err) {
            return res.status(500).send({
                message: err,
            });
        }
        else {
            return res.status(201).send({
                message: `Product modified successfully.`,
            });
        }
    });
});
productRouter.delete("/deleteProduct/:productId", user_validation_js_1.validateAdminSession, (req, res, next) => {
    const productId = req.params.productId;
    db_js_1.default.query("DELETE FROM products WHERE id = ?", [productId], (err, result) => {
        if (err) {
            return res.status(500).send({
                message: err,
            });
        }
        else {
            res.send({
                message: "Product deleted successfully",
            });
        }
    });
});
exports.default = productRouter;
