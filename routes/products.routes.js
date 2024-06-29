import express from "express";
import { Products } from "../services/products.services.js";

const products = new Products();
const router = express.Router() 

router.get("/", (req, res) => {
  products.getter
  .then((resolve, reject) => {
    res.json(resolve);
  })
});

router.get('/:id', (req, res) => {
  const { id } = req.params
  res.json(products.find(id))
})

router.post("/", (req, res) => {
  const { name, price } = req.body;
  res.status(201).json(products.setter(name, price));
});

export default router
