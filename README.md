# ShopKart

ShopKart is a full-stack ecommerce application built with React, Redux Toolkit,
Express, and MongoDB. It includes a product catalog, customer accounts, a
shopping cart and wishlist, and Razorpay Test Mode checkout.

## Features

- Register, log in, view your profile, and change your password
- Browse products and view product details
- Add products to a cart, update quantities, and manage a wishlist
- Enter shipping details and pay using Razorpay Test Mode
- View order history and individual order details
- Keep cart and wishlist state synchronized in the UI with Redux Toolkit

## Tech stack

| Area | Technologies |
| --- | --- |
| Frontend | React, Vite, React Router, Redux Toolkit |
| Backend | Node.js, Express |
| Database | MongoDB with Mongoose |
| Authentication | JWT in an HttpOnly cookie |
| Payments | Razorpay Test Mode |

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- MongoDB (local instance or hosted cluster)
- Razorpay Test Mode credentials to complete checkout

## Run locally

### 1. Configure the backend

Create `Backend/.env` with your local configuration:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/shopkart
JWT_SECRET=replace_with_a_long_random_secret
RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
```

`PORT` is optional and defaults to `5000`. `MONGODB_URI` and `JWT_SECRET` are
required. Razorpay keys are required to create and verify payment orders; the
rest of the application can be explored without configuring payments.

### 2. Configure the frontend

Create `Frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

`Frontend/.env.example` contains the local API URL template.

### 3. Install dependencies

From the project root:

```sh
cd Backend
npm install
cd ../Frontend
npm install
```

### 4. Start the applications

Start the backend in one terminal:

```sh
cd Backend
npm run dev
```

Start the frontend in a second terminal:

```sh
cd Frontend
npm run dev
```

Open the local URL printed by Vite, typically
[`http://localhost:5173`](http://localhost:5173).

To build the frontend for production:

```sh
cd Frontend
npm run build
```

## API overview

The backend listens on port `5000` by default. Protected endpoints require the
customer's authentication cookie.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/customers/register` | Create a customer account |
| `POST` | `/customers/login` | Sign in |
| `GET` | `/customers/me` | Get the signed-in customer's profile |
| `POST` | `/customers/logout` | Sign out |
| `PATCH` | `/customers/change-password` | Change the account password |
| `GET` | `/products` | List products |
| `GET` | `/products/:id` | Get product details |
| `GET` | `/cart` | Get the cart |
| `POST` | `/cart/:productId` | Add a product to the cart |
| `PATCH` | `/cart/:productId` | Update a cart item's quantity |
| `DELETE` | `/cart/:productId` | Remove a cart item |
| `GET` | `/wishlist` | Get the wishlist |
| `POST` | `/wishlist/:productId` | Add a product to the wishlist |
| `PATCH` | `/wishlist/:productId/toggle` | Add or remove a wishlist product |
| `DELETE` | `/wishlist/:productId` | Remove a wishlist product |
| `POST` | `/orders/create-payment-order` | Create an order and payment |
| `POST` | `/orders/verify-payment` | Verify payment and place the order |
| `GET` | `/orders` | List the signed-in customer's orders |
| `GET` | `/orders/:id` | Get one of the signed-in customer's orders |

## Security notes

- Never commit `.env` files, database credentials, JWT secrets, or payment
  secrets. Use your own local values and configure production secrets through
  your hosting provider.
- Use Razorpay Test Mode credentials for local testing. Do not put the Razorpay
  secret in frontend configuration.
- In production, the authentication cookie uses `SameSite=None; Secure` so the
  separately hosted frontend and API can share the login session. Some browsers
  block third-party cookies regardless; hosting both under the same site with
  a custom domain is more reliable.
- The product creation endpoint is not protected by an admin authentication
  route in this project; do not expose it as a public production admin feature
  without adding appropriate authorization.
