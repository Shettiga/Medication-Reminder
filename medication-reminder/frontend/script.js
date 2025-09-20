// frontend/script.js

const registerForm = document.getElementById("register-form");

if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            const response = await fetch("http://127.0.0.1:5000/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();
            alert(data.message || "Registered successfully");
        } catch (error) {
            alert("Error: " + error.message);
        }
    });
}
// frontend/script.js

const loginForm = document.getElementById("login-form");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;

        try {
            const response = await fetch("http://127.0.0.1:5000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

           if (response.ok) {
                // ✅ Save email to localStorage
                localStorage.setItem("loggedInEmail", email);
                alert("Login successful!");
                window.location.href = "dashboard.html";
            }

             else {
                alert(data.message || "Invalid email or password.");
            }
        } catch (error) {
            alert("Login failed: " + error.message);
        }
    });
}

// Get reminder form element
const reminderForm = document.getElementById("reminder-form");
const remindersList = document.getElementById("reminders");
const loggedInEmail = localStorage.getItem("loggedInEmail");

let reminders = [];

// Add submit event listener to form
if (reminderForm) {
    reminderForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("med-name").value;
        const time = document.getElementById("med-time").value;
        const date = document.getElementById("med-date").value;

        if (!loggedInEmail) {
            alert("User not logged in");
            window.location.href = "login.html";
            return;
        }

        // Save new reminder via backend API
        const res = await fetch("http://127.0.0.1:5000/add_reminder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: loggedInEmail, name, time, date })
        });

        const data = await res.json();

        if (res.ok) {
            alert(data.message || "Reminder saved successfully");
            await loadReminders();  // Refresh reminders list after save
            reminderForm.reset();   // Clear form inputs
        } else {
            alert(data.message || "Failed to save reminder");
        }
    });

    // Load reminders when page loads
    loadReminders();
}

// Function to fetch reminders from backend
async function loadReminders() {
  const res = await fetch(`/get_reminders?email=${loggedInEmail}`);
  const data = await res.json();
  if(res.ok && Array.isArray(data.reminders)) {
    reminders = data.reminders;
    displayReminders();
  } else {
    reminders = [];
    displayReminders();
  }
}

// Function to update reminders list in the UI
function displayReminders() {
    remindersList.innerHTML = "";
    reminders.forEach((reminder, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span><strong>${reminder.name}</strong> - ${reminder.date} at ${reminder.time}</span>
            <span class="reminder-actions">
                <button onclick="editReminder(${index})">Edit</button>
                <button onclick="deleteReminder(${index})">Delete</button>
            </span>
        `;
        remindersList.appendChild(li);
    });
}
