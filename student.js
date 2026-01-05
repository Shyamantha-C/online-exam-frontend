const BASE_URL = "https://exam-tool-backend-clean.onrender.com";

async function studentLogin() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("msg");

  msg.innerHTML = "";

  if (!email || !password) {
    msg.innerHTML = "<span class='text-danger'>Email and password required</span>";
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/student/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.status === "ok") {
      localStorage.setItem("student_id", data.student_id);
      localStorage.setItem("student_name", email.split("@")[0]); // optional
      window.location.href = "student-dashboard.html";
    } else {
      msg.innerHTML = "<span class='text-danger'>Invalid email or password</span>";
    }
  } catch (err) {
    msg.innerHTML = "<span class='text-danger'>Server error. Try again later.</span>";
  }
}
