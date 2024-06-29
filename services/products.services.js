import { faker } from "@faker-js/faker";
import crypto from "node:crypto";

export class Products {
  constructor(name, price) {
    this.name = name;
    this.price = price;
    this. products = [];
    this.generate(3);
  }

  generate(limit) {
    for (let i = 0; i < limit; i++) {
      this.products.push({
        id: crypto.randomUUID(),
        name: faker.commerce.productName(),
        price: parseInt(faker.commerce.price(), 10),
        image: faker.image.url(),
      });
    }
  }

  get getter() {
    return new Promise((resolve, reject) => {
      resolve(this.products)
    });
  }

  setter(name, price) {
    const product = {
      id: crypto.randomUUID(),
      name,
      price,
      image: faker.image.url() 
    }
    this.products.push(product);
    return product;
  }

  find(id) {
    const index = this.products.findIndex(item => item.id === id)
    return this.products[index]
  }
}
