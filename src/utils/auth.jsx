// utils/auth.js
import axios from "axios";

export async function checkIfLoggedIn() {
  const token = localStorage.getItem("authToken");
  if (!token) return null;

  try {
    const res = await axios.get(
      "https://0699e0a2094e.ngrok-free.app/api/users/profile",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      }
    );
    return res.data; // ترجع بيانات المستخدم
  } catch (err) {
    console.error(err);
    localStorage.removeItem("authToken");
    return null;
  }
}
