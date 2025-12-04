import fetch from "node-fetch";

const adminData = {
  email: "admin@ktkshop.com",
  password: "MallAdmin#Secure2025"
};

const response = await fetch("https://mall-backend-8erq.onrender.com/api/admin/create", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(adminData)
});

const data = await response.json();
console.log(data);
