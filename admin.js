// =============================
// CONFIG
// =============================
const BASE_URL = "https://online-exam-backend-f3rp.onrender.com";


// =============================
// ADMIN LOGIN
// =============================
async function adminLogin() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const msg = document.getElementById("msg");
    msg.innerHTML = "";

    const response = await fetch(`${BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (data.status === "ok") {
        localStorage.setItem("adminToken", data.token);
        window.location.href = "admin-dashboard.html";
    } else {
        msg.innerHTML = `<span class='text-danger'>Invalid username or password</span>`;
    }
}


// =============================
// ADMIN LOGOUT
// =============================
function adminLogout() {
    localStorage.removeItem("adminToken");
    window.location.href = "../index.html";
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

    if (data.status !== "ok") {
        table.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error loading questions</td></tr>`;
        return;
    }

    data.questions.forEach((q, index) => {
        const row = `
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
        table.innerHTML += row;
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
// LOAD RESULTS LIST
// =============================
async function loadResults() {
    fetch("https://online-exam-backend-f3rp.onrender.com/api/results", {
        headers: {
            "X-ADMIN-TOKEN": localStorage.getItem("adminToken")
        }
    })
    .then(r => r.json())
    .then(data => {
        const tbody = document.getElementById("results-table");
        if (!tbody) {
            console.error("Table body not found!");
            return;
        }

        if (!data.results || data.results.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">No results yet</td></tr>`;
            return;
        }

        tbody.innerHTML = "";  // clear first

        data.results.forEach((res, i) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${i + 1}</td>
                <td>${res.roll_no || "—"}</td>
                <td>${res.name || "—"}</td>
                <td><strong>${res.score}</strong></td>
                <td>${new Date(res.started_at).toLocaleString()}</td>
                <td>${res.finished_at ? new Date(res.finished_at).toLocaleString() : "—"}</td>
                <td>
                    <a href="result-detail.html?attempt=${res.attempt_id}" class="btn btn-sm btn-primary">
                        View Details
                    </a>
                </td>
                <td>
                    <button onclick="deleteAttempt(${res.attempt_id})" class="btn btn-sm btn-danger">
                        Delete
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    })
    .catch(err => {
        console.error(err);
        alert("Failed to load results");
    });
}


// =============================
// LOAD SINGLE RESULT DETAIL
// =============================
async function loadSingleResult(attempt_id) {
    const response = await fetch(`${BASE_URL}/api/admin/result/${attempt_id}`, {
        headers: { "X-ADMIN-TOKEN": localStorage.getItem("adminToken") }
    });

    const data = await response.json();

    if (data.status !== "ok") {
        document.body.innerHTML = "<h3 class='text-danger text-center'>Unable to load result</h3>";
        return;
    }

    document.getElementById("student-info").innerHTML = `
        <div class="card p-3 shadow-sm">
            <h5>Student: ${data.student.name} (${data.student.roll_no})</h5>
            <p>Score: <strong>${data.student.score}</strong></p>
            <p>Started: ${new Date(data.student.started_at).toLocaleString()}</p>
            <p>Finished: ${new Date(data.student.finished_at).toLocaleString()}</p>
        </div>
    `;

    const table = document.getElementById("detail-table");

    data.answers.forEach(ans => {
        const row = `
        <tr>
            <td>${ans.question}</td>
            <td>A: ${ans.opt_a}<br>B: ${ans.opt_b}<br>C: ${ans.opt_c}<br>D: ${ans.opt_d}</td>
            <td>${ans.correct}</td>
            <td>${ans.selected || "-"}</td>
            <td class="${
                ans.status === "Correct" ? "text-success" :
                ans.status === "Wrong"   ? "text-danger"  :
                "text-muted"
            }">${ans.status}</td>
        </tr>`;
        table.innerHTML += row;
    });
}
