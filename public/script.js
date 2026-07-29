const signupForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");

// Sign up form
if (signupForm) {
    signupForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const username =
            document.getElementById("signup-username").value;

        const email =
            document.getElementById("signup-email").value;

        const password =
            document.getElementById("signup-password").value;

        const message =
            document.getElementById("signup-message");

        message.textContent = "Creating account...";

        try {
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            message.textContent = data.message;

            if (response.ok) {
                signupForm.reset();

                setTimeout(function () {
                    window.location.href = "/login.html";
                }, 1200);
            }
        } catch (error) {
            console.error(error);
            message.textContent = "Could not connect to the server.";
        }
    });
}

// Login form
if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email =
            document.getElementById("login-email").value;

        const password =
            document.getElementById("login-password").value;

        const message =
            document.getElementById("login-message");

        message.textContent = "Logging in...";

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            message.textContent = data.message;

            if (response.ok) {
                setTimeout(function () {
                    window.location.href = "/dashboard.html";
                }, 800);
            }
        } catch (error) {
            console.error(error);
            message.textContent = "Could not connect to the server.";
        }
    });
}