import { MigrationInterface, QueryRunner } from "typeorm"

const products = [
    {
        name: "iPhone 9",
        description: "An apple mobile which is nothing like apple",
        category: 3,
        price: 549,
        stock: 100,
        img_src: "https://res.cloudinary.com/dizgcsbsq/image/upload/v1704712309/tokopaedi/products/iphone-9.jpg",
        public_id: "tokopaedi/products/iphone-9.jpg"
    },
    {
        name: "iPhone X",
        description: "SIM-Free, Model A19211 6.5-inch Super Retina HD display with OLED technology A12 Bionic chip with ...",
        category: 3,
        price: 899,
        stock: 100,
        img_src: "https://res.cloudinary.com/dizgcsbsq/image/upload/v1704712315/tokopaedi/products/iphone-x.jpg",
        public_id: "tokopaedi/products/iphone-x.jpg"
    },
    {
        name: "Samsung Universe 9",
        description: "Samsung's new variant which goes beyond Galaxy to the Universe",
        category: 3,
        price: 1249,
        stock: 100,
        img_src: "https://res.cloudinary.com/dizgcsbsq/image/upload/v1704712300/tokopaedi/products/samsung-universe-94.jpg",
        public_id: "tokopaedi/products/samsung-universe-94.jpg"
    },
    {
        name: "OPPOF19",
        description: "OPPO F19 is officially announced on April 2021.",
        category: 3,
        price: 280,
        stock: 100,
        img_src: "https://res.cloudinary.com/dizgcsbsq/image/upload/v1704712173/tokopaedi/products/oppo-f19.jpg",
        public_id: "tokopaedi/products/oppo-f19.jpg"
    },
    {
        name: "Huawei P30",
        description: "Huawei’s re-badged P30 Pro New Edition was officially unveiled yesterday in Germany and now the device has made its way to the UK.",
        category: 3,
        price: 280,
        stock: 5,
        img_src: "https://res.cloudinary.com/dizgcsbsq/image/upload/v1704712164/tokopaedi/products/huawei-p30.jpg",
        public_id: "tokopaedi/products/huawei-p30.jpg"
    },
    {
        name: "MacBook Pro",
        description: "MacBook Pro 2021 with mini-LED display may launch between September, November",
        category: 7,
        price: 1749,
        stock: 7,
        img_src: "https://res.cloudinary.com/dizgcsbsq/image/upload/v1704712144/tokopaedi/products/macbook-pro.jpg",
        public_id: "tokopaedi/products/macbook-pro.jpg"
    },
    {
        name: "Samsung Galaxy Book",
        description: "Samsung Galaxy Book S (2020) Laptop With Intel Lakefield Chip, 8GB of RAM Launched",
        category: 7,
        price: 1499,
        stock: 100,
        img_src: "https://res.cloudinary.com/dizgcsbsq/image/upload/v1704712131/tokopaedi/products/samsung-galaxy-book.jpg",
        public_id: "tokopaedi/products/samsung-galaxy-book.jpg"
    },
    {
        name: "Microsoft Surface Laptop 4",
        description: "Style and speed. Stand out on HD video calls backed by Studio Mics. Capture ideas on the vibrant touchscreen.",
        category: 7,
        price: 1499,
        stock: 100,
        img_src: "https://res.cloudinary.com/dizgcsbsq/image/upload/v1704712122/tokopaedi/products/microsoft-surface-pro-4.jpg",
        public_id: "tokopaedi/products/microsoft-surface-pro-4.jpg"
    },
    {
        name: "Infinix Inbook X1",
        description: "Infinix Inbook X1 Ci3 10th 8GB 256GB 14 Win10 Grey – 1 Year Warranty",
        category: 7,
        price: 1099,
        stock: 100,
        img_src: "https://res.cloudinary.com/dizgcsbsq/image/upload/v1704712108/tokopaedi/products/infinix-inbook-x1.jpg",
        public_id: "tokopaedi/products/infinix-inbook-x1.jpg"
    },
    {
        name: "HP Pavilion 15-DK1056WM",
        description: "HP Pavilion 15-DK1056WM Gaming Laptop 10th Gen Core i5, 8GB, 256GB SSD, GTX 1650 4GB, Windows 10",
        category: 7,
        price: 1099,
        stock: 100,
        img_src: "https://res.cloudinary.com/dizgcsbsq/image/upload/v1704714272/tokopaedi/products/hp-pavilion-15-DK1056WM.jpg",
        public_id: "tokopaedi/products/hp-pavilion-15-DK1056WM"
    },
    {
        name: "PlayStation 5 (PS5)",
        description: "PlayStation 5 Console with Ultra HD Blu-ray Disc Drive",
        category: 6,
        price: 499,
        stock: 30,
        img_src: "https://res.cloudinary.com/dizgcsbsq/image/upload/v1707732319/tokopaedi/products/20240212170516-playstation-5.jpg",
        public_id: "tokopaedi/products/20240212170516-playstation-5"
    },
    {
        name: "Retro Gaming T-Shirt",
        description: "Vintage Style Retro Gaming T-Shirt for Gamers",
        category: 11,
        price: 25,
        stock: 100,
        img_src: "https://res.cloudinary.com/dizgcsbsq/image/upload/v1707732219/tokopaedi/products/20240212170336-retro-gaming-tshirt.jpg",
        public_id: "tokopaedi/products/20240212170336-retro-gaming-tshirt"
    },
    {
        name: "Urban Cargo Pants",
        description: "Stylish Urban Cargo Pants with Multiple Pockets",
        category: 11,
        price: 45,
        stock: 75,
        img_src: "https://res.cloudinary.com/dizgcsbsq/image/upload/v1707732370/tokopaedi/products/20240212170607-urban-cargo-pants.png",
        public_id: "tokopaedi/products/20240212170607-urban-cargo-pants"
    },
    {
        name: "Nike Air Max 270",
        description: "Nike Air Max 270 Shoes",
        category: 15,
        price: 120,
        stock: 50,
        img_src: "https://res.cloudinary.com/dizgcsbsq/image/upload/v1707732411/tokopaedi/products/20240212170647-nike-air-max-720.png",
        public_id: "tokopaedi/products/20240212170647-nike-air-max-720"
    }
]

export class InsertIntoProducts1701859009819 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        for (const product of products) {
            await queryRunner.query(`INSERT INTO product (name, description, category, price, stock, img_src, public_id) VALUES (?, ?, ?, ?, ?, ?, ?)`, [product.name, product.description, product.category, product.price, product.stock, product.img_src, product.public_id])
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`TRUNCATE TABLE product;`)
    }
}
