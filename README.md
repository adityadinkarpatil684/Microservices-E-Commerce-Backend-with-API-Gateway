# Microservices E-Commerce Backend with API Gateway

## Overview

This project demonstrates a distributed backend system built using **Node.js**, **Express.js**, and **MySQL** following core **Microservices Architecture** principles.

The system consists of independent services communicating over HTTP and exposed through a centralized API Gateway.

### Implemented Features

* API Gateway
* Microservices Architecture
* Database-per-Service Pattern
* Service-to-Service Communication
* Round-Robin Load Balancing
* Health-Aware Failover
* Sliding Window Rate Limiting
* Centralized Logging
* Error Handling
* Health Check Endpoints
* MySQL Integration

---
<img width="2760" height="2480" alt="architecture_overview" src="https://github.com/user-attachments/assets/f1f71abe-83a9-4235-b46d-6626538605e5" />

<img width="2720" height="2000" alt="order_request_flow" src="https://github.com/user-attachments/assets/7da07840-3c76-4acd-83be-b59ded79d21d" />


# Architecture

```text
                        CLIENT
                           |
                           V

                    API GATEWAY
                         3000

 --------------------------------------------------

 Custom Logger
 Morgan Logger
 Rate Limiter
 Error Handler
 Load Balancer

 --------------------------------------------------

        |                |                |
        |                |                |
        V                V                V

 USER SERVICE      PRODUCT SERVICE      ORDER SERVICE
     3001              3002               3003
                         |
                         |
                  PRODUCT SERVICE
                        3004

 --------------------------------------------------

      user_db       product_db       order_db
```

---

# Microservices

## User Service

Port:

```text
3001
```

Database:

```text
user_db
```

Responsibilities:

* Get Users
* Get User By ID
* Create User

Endpoints:

```http
GET  /users
GET  /users/:id
POST /users
GET  /health
```

---

## Product Service

Ports:

```text
3002
3004
```

Database:

```text
product_db
```

Responsibilities:

* Get Products
* Get Product By ID
* Create Product

Endpoints:

```http
GET  /products
GET  /products/:id
POST /products
GET  /health
```

---

## Order Service

Port:

```text
3003
```

Database:

```text
order_db
```

Responsibilities:

* Create Orders
* Get Orders
* Validate User
* Validate Product

Endpoints:

```http
GET  /orders
GET  /orders/:id
POST /orders
GET  /health
```

---

# API Gateway

Port:

```text
3000
```

The Gateway acts as the single entry point for all client requests.

Routes:

```text
/users     -> User Service
/products  -> Product Service
/orders    -> Order Service
```

Features:

* Logging
* Rate Limiting
* Load Balancing
* Error Handling
* Health Monitoring

---

# Database Design

## user_db

Table: users

```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    email VARCHAR(100)
);
```

---

## product_db

Table: products

```sql
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    price DECIMAL(10,2),
    stock INT
);
```

---

## order_db

Table: orders

```sql
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    product_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

# Request Flow

Example:

```http
POST /orders
```

Request Body:

```json
{
  "userId": 1,
  "productId": 1
}
```

Execution Flow:

```text
Client
   |
   V
API Gateway
   |
   +--> Logger
   |
   +--> Morgan
   |
   +--> Rate Limiter
   |
   +--> Order Service
            |
            +--> User Service Validation
            |
            +--> Product Service Validation
            |
            +--> Insert Order
            |
            +--> Return Response
```

---

# Round Robin Load Balancing

The Product Service is replicated.

Instances:

```text
3002
3004
```

Traffic Distribution:

```text
Request 1 -> Product-1 (3002)
Request 2 -> Product-2 (3004)
Request 3 -> Product-1 (3002)
Request 4 -> Product-2 (3004)
```

This demonstrates horizontal scaling.

---

# Health-Aware Failover

Before routing traffic, the Gateway checks:

```http
GET /health
```

on each Product Service instance.

Scenario:

```text
Product-1 DOWN
Product-2 UP
```

Gateway Behavior:

```text
Request
   |
   +--> Product-1 Health Check FAIL
   |
   +--> Product-2 Health Check PASS
   |
   +--> Route Request To Product-2
```

No downtime is visible to the client.

---

# Service-to-Service Communication

The Order Service communicates with other services before creating an order.

```text
Order Service
      |
      +--> User Service
      |
      +--> Product Service
```

Validation Steps:

1. Verify User Exists
2. Verify Product Exists
3. Create Order

This follows proper Microservice boundaries where services communicate through APIs instead of directly accessing another service's database.

---

# Rate Limiting

Implemented using a Sliding Window algorithm.

Configuration:

```text
Window Size: 60 Seconds
Max Requests: 10
```

If exceeded:

```http
429 Too Many Requests
```

Response:

```json
{
  "success": false,
  "message": "Too Many Requests"
}
```

---

# Logging

Two layers of logging are implemented.

### Custom Logger

Example:

```text
[2026-06-20T10:20:31Z] GET /products
```

### Morgan Logger

Example:

```text
GET /products 200 12.45 ms
```

---

# Error Handling

Centralized error handling prevents service failures from crashing the Gateway.

Example Response:

```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

---

# Running The Project

## Start MySQL

```bash
mysql -u root -p
```

Execute schema files:

```sql
source user_db.sql;
source product_db.sql;
source order_db.sql;
```

---

## Start Services

### User Service

```bash
node services/user-service/server.js
```

### Product Service 1

```bash
node services/product-service-1/server.js
```

### Product Service 2

```bash
node services/product-service-2/server.js
```

### Order Service

```bash
node services/order-service/server.js
```

### API Gateway

```bash
node gateway/server.js
```

---

# Testing Scenarios

## Scenario 1: Fetch Users

Request:

```http
GET http://localhost:3000/users
```

Expected:

```json
[
  {
    "id": 1,
    "name": "John Doe"
  }
]
```

---

## Scenario 2: Round Robin Load Balancing

Request:

```http
GET http://localhost:3000/products
```

Expected Sequence:

```json
{
  "instance": "PRODUCT-1"
}
```

```json
{
  "instance": "PRODUCT-2"
}
```

```json
{
  "instance": "PRODUCT-1"
}
```

```json
{
  "instance": "PRODUCT-2"
}
```

---

## Scenario 3: Create User

Request:

```http
POST http://localhost:3000/users
```

Body:

```json
{
  "name": "Bob",
  "email": "bob@example.com"
}
```

Expected:

```json
{
  "success": true
}
```

---

## Scenario 4: Create Product

Request:

```http
POST http://localhost:3000/products
```

Body:

```json
{
  "name": "Monitor",
  "price": 15000,
  "stock": 5
}
```

Expected:

```json
{
  "success": true
}
```

---

## Scenario 5: Create Order

Request:

```http
POST http://localhost:3000/orders
```

Body:

```json
{
  "userId": 1,
  "productId": 1
}
```

Expected:

```json
{
  "success": true,
  "orderId": 1
}
```

---

## Scenario 6: Product Service Failover

Stop Product Service 1:

```bash
CTRL + C
```

Port:

```text
3002
```

Request:

```http
GET http://localhost:3000/products
```

Expected:

```json
{
  "instance": "PRODUCT-2"
}
```

Gateway automatically routes requests to Product Service 2.

---

## Scenario 7: Product Service Recovery

Restart:

```bash
node services/product-service-1/server.js
```

Requests will again be distributed between:

```text
3002
3004
```

using Round Robin.

---

## Scenario 8: Rate Limiting

Send more than 10 requests within 60 seconds.

Expected:

```http
429 Too Many Requests
```

Response:

```json
{
  "success": false,
  "message": "Too Many Requests"
}
```

---

## Scenario 9: User Service Failure

Stop User Service:

```bash
CTRL + C
```

Port:

```text
3001
```

Request:

```http
GET http://localhost:3000/users
```

Expected:

```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

Gateway remains operational.

---

## Scenario 10: Order Creation During Product Failover

Product Service Status:

```text
3002 DOWN
3004 UP
```

Request:

```http
POST http://localhost:3000/orders
```

Body:

```json
{
  "userId": 1,
  "productId": 1
}
```

Expected:

```json
{
  "success": true,
  "orderId": 1
}
```

The Order Service automatically discovers the healthy Product Service instance and continues processing the order.

---

# Technologies Used

* Node.js
* Express.js
* MySQL
* Axios
* Morgan
* CORS

---

# Key Concepts Demonstrated

* Microservices Architecture
* API Gateway Pattern
* Database-per-Service Pattern
* Service Discovery
* Service-to-Service Communication
* Round Robin Load Balancing
* Health Checks
* Sliding Window Rate Limiting
* Centralized Logging
* Fault Tolerance
* Error Handling
