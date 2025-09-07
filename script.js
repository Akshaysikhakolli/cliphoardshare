// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCB1kELfuQmIkMoC09gNxqigPXk6MNk1M8",
  authDomain: "sharingclip-7ead7.firebaseapp.com",
  projectId: "sharingclip-7ead7",
  storageBucket: "sharingclip-7ead7.appspot.com",
  messagingSenderId: "380106710434",
  appId: "1:380106710434:web:ba290122ebd7842d9326fb",
  measurementId: "G-6T9396S1K8"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get Firestore
const db = firebase.firestore();

// 🔑 Fix: Prefer WebSockets (avoid 400 Bad Request logs from long-polling terminate)
db.settings({
  experimentalForceLongPolling: false,
  experimentalAutoDetectLongPolling: false
});

// DOM Elements
const blocksContainer = document.getElementById("blocksContainer");
const addBlockBtn = document.getElementById("addBlockBtn");
const clearAllBtn = document.getElementById("clearAllBtn");
const newBlock = document.getElementById("newBlock");

// Realtime listener
db.collection("blocks")
  .orderBy("timestamp")
  .onSnapshot(snapshot => {
    blocksContainer.innerHTML = "";
    snapshot.forEach(doc => {
      createBlock(doc.id, doc.data().text);
    });
  });

// Create block UI
function createBlock(id, text) {
  const block = document.createElement("div");
  block.className = "block";

  const title = document.createElement("div");
  title.className = "block-title";
  title.innerText = "Block";

  const textarea = document.createElement("textarea");
  textarea.className = "block-text";
  textarea.value = text;
  textarea.disabled = true;

  const controls = document.createElement("div");
  controls.className = "controls";

  const copyBtn = document.createElement("button");
  copyBtn.className = "copy-btn";
  copyBtn.textContent = "📋 Copy";
  copyBtn.onclick = () => navigator.clipboard.writeText(textarea.value);

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "🗑️ Delete";
  deleteBtn.onclick = () => db.collection("blocks").doc(id).delete();

  controls.append(copyBtn, deleteBtn);
  block.append(title, textarea, controls);
  blocksContainer.appendChild(block);
}

// Add block to Firestore
addBlockBtn.onclick = () => {
  const text = newBlock.value.trim();
  if (text) {
    db.collection("blocks").add({
      text,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    newBlock.value = "";
  }
};

// Clear all blocks from Firestore
clearAllBtn.onclick = async () => {
  const snapshot = await db.collection("blocks").get();
  snapshot.forEach(doc => doc.ref.delete());
};
