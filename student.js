const BASE_URL = "https://exam-tool-backend-clean.onrender.com";


async function studentLogin() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("msg");

  msg.innerHTML = "";

  const res = await fetch(`${BASE_URL}/api/student/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (data.status === "ok") {
    localStorage.setItem("student_id", data.student_id);
    localStorage.setItem("student_name", data.name);
    window.location.href = "student-dashboard.html";
  } else {
    msg.innerHTML = `<span class='text-danger'>${data.msg}</span>`;
  }
}
