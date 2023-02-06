
const newQuestionButton = document.getElementById("new-question");
const resolveQuestionButton = document.getElementById("resolve-question");
const searchInput = document.getElementById("search-questions");
const questionForm = document.getElementById("new-question-form");
const responseView = document.querySelector(".response-view");
const responseForm = document.getElementById("new-response-form");
const questionListDisplay = document.querySelector(".question-list");
const responseListDisplay = document.querySelector(".response-list");
const modalBackground = document.querySelector(".modal");

let questionList = [];
if (localStorage.questionList) {
  questionList = JSON.parse(localStorage.questionList);
  renderQuestionList(questionList);
}

let userData = {
  userQuestions: [],
  userResponses: [],
  voteData: {},
};
if (localStorage.userData) {
  userData = JSON.parse(localStorage.userData);
}

newQuestionButton.addEventListener("click", () => {
  responseView.classList.add("hide-panel");
  questionForm.classList.remove("hide-panel");
});

questionForm.onsubmit = (e) => {
  e.preventDefault();
  const subject = questionForm.subject.value?.trim();
  const description = questionForm.description.value?.trim();
  if (!subject) {
    questionForm.subject.classList.add("invalid-input");
    questionForm.subject.value = subject;
    return;
  } else if (!description) {
    questionForm.description.classList.add("invalid-input");
    questionForm.description.value = description;
    document.getElementById("invalidError").style.display = "block";
    return;
  }
  questionForm.subject.classList.remove("invalid-input");
  questionForm.description.classList.remove("invalid-input");
  document.getElementById("invalidError").style.display = "none";
  questionForm.subject.value = "";
  questionForm.description.value = "";
  appendQuestionList(subject, description);
};

function generateID() {
  return "_" + Math.random().toString(16).slice(2, 12);
}

function appendQuestionList(subject, description) {
  const id = generateID();
  questionList.push({
    id,
    subject,
    description,
    responses: [],
    upvotes: 0,
  });
  userData.userQuestions.push(id);
  renderResponseView(questionList.at(-1));
  renderQuestionList(questionList);
  updateLocalStorage();
  updateUserData();
}

function appendResponseList(question, from, responseDetails) {
  const id = generateID();
  question.responses.push({
    id,
    from,
    responseDetails,
    upvotes: 0,
  });
  userData.userResponses.push(id);
  renderResponseList(question);
  updateLocalStorage();
  updateUserData();
}

function sortListByUpvotes(list) {
  list.sort((a, b) => {
    if (a.upvotes > b.upvotes) return -1;
    if (a.upvotes < b.upvotes) return 1;
    return 0;
  });
}

function renderQuestionList(questionList) {
  sortListByUpvotes(questionList);
  questionListDisplay.innerHTML = "";
  questionList.forEach((item) => {
    const listItem = document.createElement("div");
    const itemHeader = document.createElement("div");
    itemHeader.classList.add("question-list-item-header");
    listItem.classList.add("question-list-item");
    const title = document.createElement("p");
    title.classList.add("question-title");
    title.innerText = item.subject;
    const subtitle = document.createElement("p");
    subtitle.classList.add("question-subtitle");
    subtitle.innerText = item.description.split("\n")?.at(0);
    const upvotes = document.createElement("p");
    upvotes.classList.add("question-upvote-count");
    upvotes.innerText = `Upvotes: ${item.upvotes}`;
    itemHeader.appendChild(title);
    itemHeader.append(upvotes);
    listItem.appendChild(itemHeader);
    listItem.appendChild(subtitle);
    listItem.onclick = () => {
      renderResponseView(item);
    };
    questionListDisplay.appendChild(listItem);
  });
}

function renderResponseList(question) {
  sortListByUpvotes(question.responses);
  responseListDisplay.innerHTML = "";
  question.responses?.forEach((item) => {
    const listItem = document.createElement("div");
    const itemText = document.createElement("div");
    const upvotes = document.createElement("div");
    listItem.classList.add("response-list-item");
    itemText.classList.add("response-details");
    const from = document.createElement("p");
    from.classList.add("response-from");
    from.innerText = item.from;
    const description = document.createElement("p");
    description.classList.add("response-description");
    description.innerText = item.responseDetails;
    upvotes.classList.add("response-upvotes");
    const downvoteButton = document.createElement("button");
    downvoteButton.classList.add("downvote-response");
    downvoteButton.innerText = "▼";
    const upvoteCount = document.createElement("p");
    upvoteCount.innerText = item.upvotes;
    const upvoteButton = document.createElement("button");
    upvoteButton.classList.add("upvote-response");
    upvoteButton.innerText = "▲";

    let voteData = userData.voteData[item.id];
    let upvoted = voteData == 1;
    let downvoted = voteData == -1;
    if (upvoted) {
      upvoteButton.classList.add("selected-vote");
    } else if (downvoted) {
      downvoteButton.classList.add("selected-vote");
    }
    downvoteButton.onclick = () => {
      if (!upvoted && !downvoted) {
        item.upvotes--;
        downvoted = true;
        downvoteButton.classList.add("selected-vote");
        userData.voteData[item.id] = -1;
      } else if (upvoted) {
        item.upvotes -= 2;
        downvoted = true;
        upvoted = false;
        upvoteButton.classList.remove("selected-vote");
        downvoteButton.classList.add("selected-vote");
        userData.voteData[item.id] = -1;
      } else if (downvoted) {
        item.upvotes++;
        downvoted = false;
        downvoteButton.classList.remove("selected-vote");
        userData.voteData[item.id] = 0;
      }
      upvoteCount.innerText = item.upvotes;
      renderQuestionList(questionList);
      updateLocalStorage();
      updateUserData();
    };
    upvoteButton.onclick = () => {
      if (!upvoted && !downvoted) {
        item.upvotes++;
        upvoted = true;
        upvoteButton.classList.add("selected-vote");
        userData.voteData[item.id] = 1;
      } else if (downvoted) {
        item.upvotes += 2;
        downvoted = false;
        upvoted = true;
        downvoteButton.classList.remove("selected-vote");
        upvoteButton.classList.add("selected-vote");
        userData.voteData[item.id] = 1;
      } else if (upvoted) {
        item.upvotes--;
        upvoted = false;
        upvoteButton.classList.remove("selected-vote");
        userData.voteData[item.id] = 0;
      }
      upvoteCount.innerText = item.upvotes;
      renderQuestionList(questionList);
      updateLocalStorage();
      updateUserData();
    };
    const deleteButton = document.createElement("p");
    deleteButton.classList.add("delete-comment");
    deleteButton.innerText = "×";
    deleteButton.onclick = () => {
      modalPrompt("deleteResponse", question, item);
    };
    itemText.appendChild(from);
    itemText.appendChild(description);
    upvotes.appendChild(downvoteButton);
    upvotes.appendChild(upvoteCount);
    upvotes.appendChild(upvoteButton);
    upvotes.appendChild(deleteButton);
    listItem.appendChild(itemText);
    listItem.appendChild(upvotes);
    responseListDisplay.appendChild(listItem);
  });
}

function renderResponseView(question) {
  if (!question) {
    console.error("No question provided to display");
    return;
  }
  questionForm.classList.add("hide-panel");
  responseView.classList.remove("hide-panel");
  responseView.classList.add("panel-open-animate");
  setTimeout(() => {
    responseView.classList.remove("panel-open-animate");
  }, 550);
  const questionTitle = document.getElementById("response-question-title");
  const questionSubtitle = document.getElementById(
    "response-question-subtitle"
  );
  const questionUpvotes = document.getElementById("question-upvotes-value");
  const downvoteQuestion = document.querySelector(".downvote-question");
  const upvoteQuestion = document.querySelector(".upvote-question");
  downvoteQuestion.classList.remove("selected-vote");
  upvoteQuestion.classList.remove("selected-vote");
  questionTitle.innerText = question.subject;
  questionSubtitle.innerText = question.description;
  questionUpvotes.innerText = question.upvotes;
  resolveQuestionButton.onclick = () => {
    modalPrompt("resolve", question);
  };
  let voteData = userData.voteData[question.id];
  let upvoted = voteData == 1;
  let downvoted = voteData == -1;
  if (upvoted) {
    upvoteQuestion.classList.add("selected-vote");
  } else if (downvoted) {
    downvoteQuestion.classList.add("selected-vote");
  }
  downvoteQuestion.onclick = () => {
    if (!upvoted && !downvoted) {
      question.upvotes--;
      downvoted = true;
      downvoteQuestion.classList.add("selected-vote");
      userData.voteData[question.id] = -1;
    } else if (upvoted) {
      question.upvotes -= 2;
      downvoted = true;
      upvoted = false;
      upvoteQuestion.classList.remove("selected-vote");
      downvoteQuestion.classList.add("selected-vote");
      userData.voteData[question.id] = -1;
    } else if (downvoted) {
      question.upvotes++;
      downvoted = false;
      downvoteQuestion.classList.remove("selected-vote");
      userData.voteData[question.id] = 0;
    }
    questionUpvotes.innerText = question.upvotes;
    renderQuestionList(questionList);
    updateLocalStorage();
    updateUserData();
  };
  upvoteQuestion.onclick = () => {
    if (!upvoted && !downvoted) {
      question.upvotes++;
      upvoted = true;
      upvoteQuestion.classList.add("selected-vote");
      userData.voteData[question.id] = 1;
    } else if (downvoted) {
      question.upvotes += 2;
      downvoted = false;
      upvoted = true;
      downvoteQuestion.classList.remove("selected-vote");
      upvoteQuestion.classList.add("selected-vote");
      userData.voteData[question.id] = 1;
    } else if (upvoted) {
      question.upvotes--;
      upvoted = false;
      upvoteQuestion.classList.remove("selected-vote");
      userData.voteData[question.id] = 0;
    }
    questionUpvotes.innerText = question.upvotes;
    renderQuestionList(questionList);
    updateLocalStorage();
    updateUserData();
  };
  renderResponseList(question);
  responseForm.from.value = "";
  responseForm.responseDetails.value = "";
  responseForm.onsubmit = (e) => {
    e.preventDefault();
    const from = responseForm.from.value?.trim();
    const responseDetails = responseForm.responseDetails.value?.trim();
    if (!from) {
      responseForm.from.add("invalid-input");
      responseForm.from.value = from;
      return;
    } else if (!responseDetails) {
      responseForm.responseDetails.classList.add("invalid-input");
      responseForm.responseDetails.value = responseDetails;
      document.getElementById("invalidResponseError").style.display = "block";
      return;
    }
    responseForm.from.classList.remove("invalid-input");
    responseForm.responseDetails.classList.remove("invalid-input");
    document.getElementById("invalidResponseError").style.display = "none";
    responseForm.from.value = "";
    responseForm.responseDetails.value = "";
    appendResponseList(question, from, responseDetails);
  };
}

searchInput.addEventListener("keyup", () => {
  if (!searchInput.value) renderQuestionList(questionList);
  else {
    const filterPattern = new RegExp(`${searchInput.value?.trim()}`, "gi");
    const filteredList = questionList.filter((item) =>
      item.subject.match(filterPattern)
    );
    if (!filteredList.length) {
      questionListDisplay.innerHTML = "";
      const listItem = document.createElement("div");
      listItem.classList.add("question-list-item");
      const text = document.createElement("p");
      text.classList.add("question-title");
      text.innerText = "No match found";
      listItem.appendChild(text);
      questionListDisplay.appendChild(listItem);
    } else {
      renderQuestionList(filteredList);
    }
  }
});

function modalPrompt(type, question, item) {
  modalBackground.classList.add("modal-visible");
  const modalContent = document.querySelector(".modal-content");
  const title = document.getElementById("modal-title");
  const confirm = document.getElementById("modal-confirm");
  const cancel = document.getElementById("modal-cancel");
  if (type == "resolve") {
    title.innerText = "Are you sure you want to resolve this question?";
    confirm.onclick = () => {
      resolveQuestion(question);
      modalBackground.classList.remove("modal-visible");
    };
  } else if (type == "deleteResponse") {
    title.innerText = "Are you sure you want to delete this comment?";
    confirm.onclick = () => {
      deleteComment(question, item);
      modalBackground.classList.remove("modal-visible");
    };
  }
  cancel.onclick = () => {
    modalBackground.classList.remove("modal-visible");
  };
  document.onclick = function (event) {
    if (event.target == modalBackground) {
      modalBackground.classList.remove("modal-visible");
    }
  };
}

function resolveQuestion(question) {
  const userDataId = userData.userQuestions.indexOf(question.id);
  if (userDataId != -1) userData.userQuestions.splice(userDataId, 1);
  questionList = questionList.filter((item) => item != question);
  renderQuestionList(questionList);
  responseView.classList.add("hide-panel");
  questionForm.classList.remove("hide-panel");
  updateLocalStorage();
  updateUserData();
}

function deleteComment(question, toDelete) {
  const userDataId = userData.userResponses.indexOf(toDelete.id);
  if (userDataId != -1) userData.userResponses.splice(userDataId, 1);
  question.responses = question.responses.filter((item) => item != toDelete);
  renderResponseList(question);
  updateLocalStorage();
  updateUserData();
}

function updateLocalStorage() {
  localStorage.questionList = JSON.stringify(questionList);
}

function updateUserData() {
  localStorage.userData = JSON.stringify(userData);
}
