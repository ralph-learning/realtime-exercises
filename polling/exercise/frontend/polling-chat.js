const chat = document.getElementById("chat");
const msgs = document.getElementById("msgs");

// let's store all current messages here
let allChat = [];

// the interval to poll at in milliseconds
const INTERVAL = 3000;

// a submit listener on the form in the HTML
chat.addEventListener("submit", function (e) {
  e.preventDefault();
  postNewMsg(chat.elements.user.value, chat.elements.text.value);
  chat.elements.text.value = "";
});

async function postNewMsg(user, text) {
  const data = {
    user,
    text,
  };
  const options = {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  };

  return fetch("/poll", options);
}

let timesFailed = 0;
async function getNewMsgs() {
  let resJson;
  try {
    const response = await fetch("/poll");
    resJson = await response.json();

    if (response.status > 400) {
      throw new Error("Something went wrong: ", response.status);
    }

    timesFailed = 0;
    allChat = resJson.messages;
    render();
  } catch (error) {
    console.log(error);
    timesFailed++;
  }
}

function render() {
  // as long as allChat is holding all current messages, this will render them
  // into the ui. yes, it's inefficent. yes, it's fine for this example
  const html = allChat.map(({ user, text, time, id }) =>
    template(user, text, time, id)
  );
  msgs.innerHTML = html.join("\n");
}

// given a user and a msg, it returns an HTML string to render to the UI
const template = (user, msg) =>
  `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;

const BACKOFF = 5000;
let initialTime = 0;
async function rafGetMessages(time) {
  if (time > initialTime) {
    await getNewMsgs();
    initialTime = time + INTERVAL + timesFailed * BACKOFF;
  }

  requestAnimationFrame(rafGetMessages);
}

// make the first request
requestAnimationFrame(rafGetMessages);
