document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="" disabled selected>Select an activity</option>';
      
      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;


        // Add participants section (custom list, no bullets)
        const participantsContainer = document.createElement("div");
        participantsContainer.className = "participants";

        const participantsHeading = document.createElement("h5");
        participantsHeading.textContent = "Participants";
        participantsContainer.appendChild(participantsHeading);

        const participantsList = document.createElement("div");
        participantsList.className = "participants-list no-bullets";

        if (Array.isArray(details.participants) && details.participants.length > 0) {
          details.participants.forEach((p) => {
            const participantRow = document.createElement("div");
            participantRow.className = "participant-row";

            const emailSpan = document.createElement("span");
            emailSpan.textContent = p;
            emailSpan.className = "participant-email";

            // Delete icon
            const deleteBtn = document.createElement("button");
            deleteBtn.className = "delete-participant";
            deleteBtn.title = "Remove participant";
            deleteBtn.innerHTML = "&#128465;"; // Trash can icon
            deleteBtn.onclick = async () => {
              if (confirm(`Remove ${p} from ${name}?`)) {
                try {
                  const response = await fetch(`/activities/${encodeURIComponent(name)}/unregister?email=${encodeURIComponent(p)}`, {
                    method: "POST"
                  });
                  const result = await response.json();
                  if (response.ok) {
                    messageDiv.textContent = result.message;
                    messageDiv.className = "success";
                    fetchActivities();
                  } else {
                    messageDiv.textContent = result.detail || "An error occurred";
                    messageDiv.className = "error";
                  }
                  messageDiv.classList.remove("hidden");
                  setTimeout(() => { messageDiv.classList.add("hidden"); }, 5000);
                } catch (error) {
                  messageDiv.textContent = "Failed to remove participant.";
                  messageDiv.className = "error";
                  messageDiv.classList.remove("hidden");
                }
              }
            };

            participantRow.appendChild(emailSpan);
            participantRow.appendChild(deleteBtn);
            participantsList.appendChild(participantRow);
          });
        } else {
          const noP = document.createElement("div");
          noP.className = "no-participants";
          noP.textContent = "No participants yet";
          participantsList.appendChild(noP);
        }

        participantsContainer.appendChild(participantsList);
        activityCard.appendChild(participantsContainer);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
