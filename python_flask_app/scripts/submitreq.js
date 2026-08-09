<script>
  // Generic form handler
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");

    if (form) {
      form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const data = {};

        formData.forEach((value, key) => {
          data[key] = value;
        });

        try {
          const response = await fetch("/api/submit", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          });

          const result = await response.json();
          alert("Success: " + result.message);

          // Redirect or update UI
          if (result.redirectUrl) {
            window.location.href = result.redirectUrl;
          }

        } catch (error) {
          console.error("Submission error:", error);
          alert("Something went wrong. Try again!");
        }
      });
    }
  });
</script>