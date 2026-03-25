let understanding = "yes";

// 🎤 MIC
function startListening() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Mic not supported");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";

  recognition.start();

  recognition.onresult = function (event) {
    document.getElementById("question").value =
      event.results[0][0].transcript;

    askQuestion();
  };
}

// 🧠 UNDERSTANDING
function setUnderstanding(val) {
  understanding = val;
}

// 🤖 ASK
async function askQuestion() {
  const question = document.getElementById("question").value;
  const level = document.getElementById("level").value;

  if (!question) {
    alert("Enter question");
    return;
  }

  stopAll();

  try {
    const res = await fetch("http://localhost:3000/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ question, level, understanding })
    });

    if (!res.ok) {
      throw new Error("Server not reachable");
    }

    const data = await res.json();

    document.getElementById("answer").innerText = data.answer;

    // 🔊 VOICE
    let speech = new SpeechSynthesisUtterance(data.answer);
    speech.rate = 0.9;

    speechSynthesis.speak(speech);

  } catch (error) {
    console.log("FRONTEND ERROR:", error);
    document.getElementById("answer").innerText =
      "❌ Cannot connect to server";
  }
}

// ⛔ STOP
function stopAll() {
  speechSynthesis.cancel();
}

// 🔄 RESET
async function resetChat() {
  await fetch("http://localhost:3000/reset");
  alert("Memory cleared 🧠");
}