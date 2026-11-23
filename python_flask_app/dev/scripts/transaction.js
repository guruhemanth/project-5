document.getElementById("transactionForm").addEventListener("submit", function () {
  document.getElementById("loading").style.display = "flex";
});
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("transactionForm");
  
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    try {
      const res = await fetch("/success", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        // 🔁 Instead of reading JSON, just redirect
        window.location.href = "/success";
        form.reset();
      } else {
        alert("Submission failed.");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Transaction error occurred.");
    }
  });
});