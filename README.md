# Beauty Shop E-commerce Platform

A complete e-commerce web application for selling bags, perfumes, and cosmetics with bilingual support (French and Moroccan Arabic).

## Features

- 🛍️ Product browsing by category
- 🔍 Product details view
- 📱 Fully responsive design
- 🌍 Bilingual support (French & Moroccan Arabic)
- 📲 WhatsApp order integration
- 👨‍💼 Admin panel for product, banner, and order management

## Tech Stack

### Frontend
- React.js
- React Router for navigation
- Tailwind CSS for styling
- react-i18next for internationalization

### Backend
- Node.js with Express
- JWT authentication
- Multer for file uploads

### Database
- MySQL (using XAMPP)

## Installation and Setup

### Prerequisites

- Node.js and npm installed
- XAMPP installed (for MySQL database)

### Database Setup

1. Start XAMPP and make sure MySQL service is running
2. Import the database schema:

```bash
mysql -u root -p < database/schema.sql