// =============================
// CONFIG
// =============================
const BASE_URL = "https://exam-tool-backend-clean.onrender.com";



// =============================
// ADMIN LOGIN (userId + password)
// =============================
async function adminLogin() {
    const userId = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const msg = document.getElementById("msg");
    msg.innerHTML = "";

    if (!userId || !password) {
        msg.innerHTML = "<span class='text-danger'>Enter user id and password</span>";
        return;
    }

    const response = await fetch(`${BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password })
    });

    const data = await response.json();

    if (data.status === "ok" && data.token) {
        localStorage.setItem("adminToken", data.token);
        window.location.href = "admin-dashboard.html";
    } else {
        msg.innerHTML = `<span class='text-danger'>Invalid user id or password</span>`;
    }
}


// =============================
// ADMIN LOGOUT
// =============================
function adminLogout() {
    localStorage.removeItem("adminToken");
    window.location.href = "admin-login.html";
}


// =============================
// ADD QUESTION
// =============================
async function addQuestion() {
    const msg = document.getElementById("msg");

    const text = document.getElementById("qtext").value.trim();
    const opta = document.getElementById("opta").value.trim();
    const optb = document.getElementById("optb").value.trim();
    const optc = document.getElementById("optc").value.trim();
    const optd = document.getElementById("optd").value.trim();
    const correct = document.getElementById("correct").value;
    const per_question_time = Number(document.getElementById("qtime").value);

    if (!text || !correct) {
        msg.innerHTML = `<span class='text-danger'>Please fill all required fields.</span>`;
        return;
    }

    const response = await fetch(`${BASE_URL}/api/admin/add-question`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-ADMIN-TOKEN": localStorage.getItem("adminToken")
        },
        body: JSON.stringify({
            text, opta, optb, optc, optd,
            correct,
            per_question_time
        })
    });

    const data = await response.json();

    if (data.status === "ok") {
        msg.innerHTML = `<span class='text-success'>Question added successfully ✔</span>`;
        document.getElementById("qtext").value = "";
        document.getElementById("opta").value = "";
        document.getElementById("optb").value = "";
        document.getElementById("optc").value = "";
        document.getElementById("optd").value = "";
        document.getElementById("correct").value = "";
        document.getElementById("qtime").value = 60;
    } else {
        msg.innerHTML = `<span class='text-danger'>Failed to add question</span>`;
    }
}


// =============================
// LOAD QUESTIONS
// =============================
async function loadQuestions() {
    const table = document.getElementById("questions-table");
    table.innerHTML = "";

    const response = await fetch(`${BASE_URL}/api/admin/questions`, {
        headers: { "X-ADMIN-TOKEN": localStorage.getItem("adminToken") }
    });

    const data = await response.json();
    const questions = data.questions || data;

    if (!questions || questions.length === 0) {
        table.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No questions found</td></tr>`;
        return;
    }

    questions.forEach((q, index) => {
        table.innerHTML += `
        <tr>
            <td>${index + 1}</td>
            <td>${q.text}</td>
            <td>
                A: ${q.opt_a}<br>
                B: ${q.opt_b}<br>
                C: ${q.opt_c}<br>
                D: ${q.opt_d}
            </td>
            <td>${q.correct}</td>
            <td>${q.order_index}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteQuestion(${q.id})">
                    Delete
                </button>
            </td>
        </tr>`;
    });
}


// =============================
// DELETE QUESTION
// =============================
async function deleteQuestion(id) {
    if (!confirm("Are you sure you want to delete this question?")) return;

    const response = await fetch(`${BASE_URL}/api/admin/delete-question/${id}`, {
        method: "DELETE",
        headers: { "X-ADMIN-TOKEN": localStorage.getItem("adminToken") }
    });

    const data = await response.json();

    if (data.status === "ok") {
        loadQuestions();
    } else {
        alert("Failed to delete question");
    }
}


// =============================
// UPLOAD STUDENTS EXCEL
// =============================
function uploadStudentsExcel() {
    const fileInput = document.getElementById("excelFile");
    const statusDiv = document.getElementById("uploadStatus");

    if (!fileInput.files[0]) {
        alert("Please select an Excel file first!");
        return;
    }

    const file = fileInput.files[0];
    if (!file.name.endsWith(".xlsx")) {
        alert("Only .xlsx files allowed!");
        return;
    }

    statusDiv.innerHTML = `<div class="text-info">Uploading & processing...</div>`;

    const formData = new FormData();
    formData.append("file", file);

    fetch(`${BASE_URL}/api/admin/upload-students`, {
        method: "POST",
        headers: { "X-ADMIN-TOKEN": localStorage.getItem("adminToken") },
        body: formData
    })
    .then(r => r.json())
    .then(data => {
        if (data.status === "ok") {
            statusDiv.innerHTML = `<div class="alert alert-success">
                ${data.total} students updated successfully
            </div>`;
            fileInput.value = "";
        } else {
            statusDiv.innerHTML = `<div class="alert alert-danger">${data.msg}</div>`;
        }
    })
    .catch(() => {
        statusDiv.innerHTML = `<div class="alert alert-danger">Upload failed</div>`;
    });
}


// =============================
// LOAD STUDENTS
// =============================
function loadAllStudents() {
    fetch(`${BASE_URL}/api/admin/students`, {
        headers: { "X-ADMIN-TOKEN": localStorage.getItem("adminToken") }
    })
    .then(r => r.json())
    .then(data => {
        const tbody = document.getElementById("studentsTableBody");
        if (!tbody) return;

        tbody.innerHTML = "";

        if (!data.students || data.students.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" class="text-center">No students found</td></tr>`;
            return;
        }

        data.students.forEach((s, i) => {
            tbody.innerHTML += `
            <tr>
                <td>${i + 1}</td>
                <td>${s.roll_no || "—"}</td>
                <td>${s.name}</td>
                <td>${s.email}</td>
                <td>${s.phone || "—"}</td>
                <td>${s.score ?? "—"}</td>
                <td>${s.status}</td>
                <td>${s.started_at ? new Date(s.started_at).toLocaleString() : "—"}</td>
                <td>
                    <a href="student-result-detail.html?attempt=${s.attempt_id}" class="btn btn-sm btn-primary">
                        View
                    </a>
                </td>
            </tr>`;
        });
    });
}


// =============================
// AUTO LOAD
// =============================
document.addEventListener("DOMContentLoaded", () => {
    if (window.location.href.includes("view-questions.html")) loadQuestions();
    if (window.location.href.includes("student-details.html")) loadAllStudents();
});
