import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://feriqnmbfzixgeedmvzw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlcmlxbm1iZnppeGdlZWRtdnp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2ODY3NTAsImV4cCI6MjA2NjI2Mjc1MH0.POc4TH7fATyb1lsWmMPmUZUww4vaH_5qgGCsD3MsW-E"
);

const saveBtn = document.getElementById("save-btn");
const clearBtn = document.getElementById("clear-btn");
const entryTitle = document.getElementById("entry-title");
const entryContent = document.getElementById("entry-content");
const entriesList = document.getElementById("entries-list");

let editId = null;

document.addEventListener("DOMContentLoaded", () => {
  fetchEntries();
  saveBtn.addEventListener("click", handleSave);
  clearBtn.addEventListener("click", clearForm);
});

async function handleSave() {
  const title = entryTitle.value.trim();
  const content = entryContent.value.trim();
  if (!title || !content) {
    alert("Judul dan isi jurnal wajib diisi!");
    return;
  }

  if (editId) {
    await supabase.from("pirate_log").update({ title, content }).eq("id", editId);
    editId = null;
    saveBtn.textContent = "Simpan ke Log";
  } else {
    await supabase.from("pirate_log").insert([{ title, content }]);
  }

  clearForm();
  fetchEntries();
}

async function fetchEntries() {
  const { data, error } = await supabase
    .from("pirate_log")
    .select("*")
    .order("created_at", { ascending: false });

  entriesList.innerHTML = "";

  if (error || !data || data.length === 0) {
    entriesList.innerHTML = `<div class="empty-message">Belum ada catatan, Kapten! Petualanganmu menanti...</div>`;
    return;
  }

  data.forEach((entry) => {
    const entryElement = document.createElement("div");
    entryElement.className = "entry";
    entryElement.innerHTML = `
      <h3 class="entry-title">${entry.title}</h3>
      <div class="entry-date">${formatDate(entry.created_at)}</div>
      <p class="entry-content">${entry.content}</p>
      <div class="entry-actions">
        <button class="action-btn edit-btn" data-id="${entry.id}">Ubah</button>
        <button class="action-btn delete-btn" data-id="${entry.id}">Hapus</button>
      </div>
    `;
    entriesList.appendChild(entryElement);
  });

  setupActionButtons();
}

function setupActionButtons() {
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.getAttribute("data-id");
      const { data } = await supabase.from("pirate_log").select("*").eq("id", id).single();
      if (data) {
        entryTitle.value = data.title;
        entryContent.value = data.content;
        editId = data.id;
        saveBtn.textContent = "Perbarui Catatan";
        entryTitle.focus();
      }
    });
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.getAttribute("data-id");
      const confirmDelete = confirm("Yakin ingin menghapus catatan ini?");
      if (confirmDelete) {
        await supabase.from("pirate_log").delete().eq("id", id);
        fetchEntries();
      }
    });
  });
}

function clearForm() {
  entryTitle.value = "";
  entryContent.value = "";
  editId = null;
  saveBtn.textContent = "Simpan ke Log";
}

function formatDate(dateStr) {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateStr).toLocaleDateString("id-ID", options);
}