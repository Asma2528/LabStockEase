# 🔬 LabStockEase

**LabStockEase** is a full-fledged inventory and requisition management system developed for academic laboratories and colleges. It ensures complete lifecycle tracking of lab items—from procurement to stock issuance—while maintaining transparency and control via role-based access.

> 🚫 **Note:** This repository is for demonstration purposes only. The code is proprietary and cannot be reused, copied, or redistributed.

---

## 🛠️ Tech Stack

| Layer      | Technology                        |
|------------|------------------------------------|
| Frontend   | React.js, Tailwind CSS, Vite       |
| Backend    | Node.js, Express.js, MongoDB       |
| AI Module  | FastAPI, Pandas, Scikit-learn      |
| Realtime   | Socket.IO                          |
| Caching    | Redis                              |

---

## 🎯 Key Features

### ✅ Role-Based Access
- **Admin**: User registration, management
- **Faculty**: Submit requisitions (chemicals, equipment, etc.)
- **Manager**: Approve requisitions & generate orders
- **Stores**: Register inward stock & update inventory
- **Accountant**: Manage invoices & payments

### ✅ Inventory Classes
Supports:
- Chemicals
- Equipment
- Glassware
- Consumables
- Others

### ✅ Category Types
- General
- Practical
- Project
- Others

### ✅ Requisition Handling
- **Requisition** (in-stock)
- **Order Request** (out-of-stock)
- **Indent** (new items)

### ✅ Order & Vendor Management
- Vendor master list
- Item-level rate, tax, cost handling
- Linked orders to requisitions & projects

### ✅ Invoice Management
- Multi-role approval
- Billing entries & status tracking

### 🧠 AI Dashboard (FastAPI)
- Item-specific reorder recommendations
- Low stock & expiry detection
- Personalized suggestions via:
  - **SVD** (Collaborative Filtering)
  - **Linear Regression** (Trend Analysis)

### ⚡ Notifications
- Realtime alerts (Socket.IO)
- Email-based workflow updates

### 🔐 Security & Optimization
- Token-based auth
- Redis-based caching
- Cron jobs for background expiry checks

---

## 📊 UI Highlights

- Role-specific dashboards
- Visual analytics (Pie/Bar charts)
- Light/Dark mode toggle
- Exportable PDF reports

---

## 🚀 Deployment

> ✅ Deployed in production at **Jai Hind College**

---

College_LabStockEase/
│
├── backend/ → Node.js + Express server
├── frontend/ → React.js + Vite UI
├── aimodule/ → FastAPI + ML engine
└── .gitignore → Managed exclusions


---

## 🛑 License

This project is proprietary and **not open for reuse or redistribution**. All rights reserved by the author.

---

## 🙋‍♀️ Developed By

**Asma Sayed**  
