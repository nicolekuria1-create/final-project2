(function () {
  const STORAGE_KEY = "clubMembers";

  const joinForm = document.getElementById("joinForm");
  const nameInput = document.getElementById("name");
  const clubSelect = document.getElementById("club");
  const sportOption = document.getElementById("sportOption");
  const membersList = document.getElementById("membersList");
  const memberCount = document.getElementById("memberCount");
  const clearAllBtn = document.getElementById("clearAllBtn");
  const toastToggle = document.getElementById("toastToggle");
  const message = document.getElementById("message");

  if (!joinForm || !clubSelect || !membersList) {
    return;
  }

  function getMembers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  }

  function saveMembers(members) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  }

  function showToast(text) {
    if (!toastToggle || !toastToggle.checked) {
      return;
    }

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = text;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add("show");
    });

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 220);
    }, 1700);
  }

  function renderMembers() {
    const members = getMembers();
    membersList.innerHTML = "";

    members.forEach((member) => {
      const li = document.createElement("li");

      const textWrap = document.createElement("div");
      const nameSpan = document.createElement("span");
      nameSpan.textContent = member.name;

      const details = document.createElement("small");
      const activityPart = member.activity ? ` • Activity: ${member.activity}` : "";
      details.textContent = `${member.club}${activityPart}`;

      textWrap.appendChild(nameSpan);
      textWrap.appendChild(details);

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "delete-btn";
      deleteBtn.textContent = "Remove";
      deleteBtn.addEventListener("click", () => {
        const updated = getMembers().filter((entry) => entry.id !== member.id);
        saveMembers(updated);
        renderMembers();
      });

      li.appendChild(textWrap);
      li.appendChild(deleteBtn);
      membersList.appendChild(li);
    });

    if (memberCount) {
      memberCount.textContent = String(members.length);
    }
  }

  function updateSportVisibility() {
    const isSports = clubSelect.value === "Sports Club";
    sportOption.style.display = isSports ? "block" : "none";
    sportOption.required = isSports;

    if (!isSports) {
      sportOption.value = "";
    }
  }

  function setClubFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const clubFromQuery = params.get("club");
    if (!clubFromQuery) {
      return;
    }

    const options = Array.from(clubSelect.options).map((option) => option.textContent);
    if (options.includes(clubFromQuery)) {
      clubSelect.value = clubFromQuery;
      updateSportVisibility();
    }
  }

  clubSelect.addEventListener("change", updateSportVisibility);

  joinForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const memberName = (nameInput.value || "").trim();
    const selectedClub = clubSelect.value;
    const selectedActivity = sportOption.style.display === "block" ? sportOption.value : "";

    if (!memberName || !selectedClub) {
      return;
    }

    if (selectedClub === "Sports Club" && !selectedActivity) {
      if (message) {
        message.textContent = "Please select a sports activity.";
      }
      return;
    }

    const members = getMembers();
    members.push({
      id: Date.now(),
      name: memberName,
      club: selectedClub,
      activity: selectedActivity
    });

    saveMembers(members);
    renderMembers();

    if (message) {
      message.textContent = `${memberName} successfully joined ${selectedClub}.`;
    }

    showToast("Registration successful");

    joinForm.reset();
    updateSportVisibility();
    setClubFromUrl();
  });

  if (clearAllBtn) {
    clearAllBtn.addEventListener("click", () => {
      saveMembers([]);
      renderMembers();
      if (message) {
        message.textContent = "All members cleared.";
      }
    });
  }

  setClubFromUrl();
  updateSportVisibility();
  renderMembers();
})();
