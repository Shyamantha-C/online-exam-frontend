const BASE_URL = "https://online-exam-backend-f3rp.onrender.com";

async function studentLogin() {
    const roll = document.getElementById("roll").value.trim();
    const password = document.getElementById("password").value.trim();
    const msg = document.getElementById("msg");

    if (!roll || !password) {
        msg.innerHTML = `<span class="text-danger">Please enter both fields.</span>`;
        return;
    }

    const response = await fetch(`${BASE_URL}/api/student/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: roll, password: password })
    });

    const data = await response.json();

    if (data.status === "ok") {
        // Save student data
        localStorage.setItem("student_id", data.student_id);
        localStorage.setItem("student_name", data.name);

        // Redirect to dashboard
        window.location.href = "student-dashboard.html";
    } else {
        msg.innerHTML = `<span class="text-danger">Invalid credentials</span>`;
    }
}

function studentLogout() {
    localStorage.removeItem("student_id");
    localStorage.removeItem("student_name");
    window.location.href = "student-login.html";
}
