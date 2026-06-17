const cl = console.log;

const postForm = document.getElementById("postForm");
const title = document.getElementById("title");
const bodycontrol = document.getElementById("body");
const userId = document.getElementById("userId");
// const body = document.getElementById("body");
const editBtn = document.getElementById("editBtn");

const updateBtn = document.getElementById("updateBtn");
const cardContainer = document.getElementById("cardContainer");

const spinner = document.getElementById("spinner");

let postArr = [];

let baseURl = "https://jsonplaceholder.typicode.com";

function snackbar(msg, icon) {
  swal.fire({
    title: msg,
    icon: icon,
    timer: 2000,
  });
}

function makeApicall(method, url, body = null, successCb, errorCb) {
  spinner.classList.remove("d-none");
  let payload = body;
  body = body ? JSON.stringify(body) : null;
  let xhr = new XMLHttpRequest();
  xhr.open(method, url);
  xhr.send(body);
  xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status <= 299) {
      let res = JSON.parse(xhr.response);
      if (method === "GET" && Array.isArray(res)) {
        successCb(res.reverse());
        $("#myTooltip").on("hidden.bs.tooltip", function () {
          // do something...
        });
      } else if (method === "POST") {
        successCb(payload, res);
        $("#myTooltip").on("hidden.bs.tooltip", function () {
          // do something...
        });
      } else if (method === "PATCH") {
        successCb(payload, res);
      } else if (method === "GET") {
        successCb(res);
      } else {
        successCb();
      }
    } else {
      snackbar("something went wrong", "error");
    }
    spinner.classList.add("d-none");
  };
}

makeApicall("GET", `${baseURl}/posts`, null, creatPost, snackbar);

function creatPost(arr) {
  let result = "";
  arr.forEach((ele) => {
    result += `
           <div class="col-md-4 mt-4" id="${ele.id}">
              <div class="card h-100 shadow">
                <div class="card-header  data-toggle="tooltip" data-placement="top" title="${ele.title}">${ele.title}</div>


                <div class="card-body">
                  <div>${ele.body}</div>
                  <div>${ele.userId}</div>
                </div>
                <div class="card-footer d-flex justify-content-between" >
                  <button class="btn  border-info" onclick="onEdit(this)"><i class="fa-solid fa-pen-to-square text-info"></i></button>
                  <button class="btn  border-danger" onclick="onDelete(this)"><i class="fa-solid text-danger fa-trash-can"></i></button>
              </div>
              </div>
            </div>  `;
  });

  cardContainer.innerHTML = result;
}

function onsubmitHandalar(ele) {
  ele.preventDefault();

  let newObj = {
    title: title.value,
    body: bodycontrol.value,
    userId: userId.value,
  };

  let postUrl = `${baseURl}/posts`;

  makeApicall("POST", postUrl, newObj, creatCard, snackbar);
}
function creatCard(body, res) {
  let div = document.createElement("div");
  div.className = "col-md-4 mt-4";
  div.id = res.id;
  div.innerHTML = `
  <div class="card shadow h-100">
             <div class="card-header  data-toggle="tooltip" data-placement="top" title="${body.title}">${body.title}</div>
                <div class="card-body">
                  <div>${body.body}</div>
                  <div>${body.userId}</div>
                </div>
                <div class="card-footer d-flex justify-content-between" >
                  <button class="btn  border-info"  onclick="onEdit(this)"><i class="fa-solid fa-pen-to-square text-info"></i></button>
                  <button class="btn  border-danger" onclick="onDelete(this)"><i class="fa-solid text-danger fa-trash-can"></i></button>
              </div>
              </div>`;

  snackbar(`New post add with id ${res.id} successfully`, "success");

  cardContainer.prepend(div);
  postForm.reset();
}

function onEdit(ele) {
  let editId = ele.closest(".col-md-4").id;
  localStorage.setItem("editId", editId);

  let editUrl = `${baseURl}/posts/${editId}`;

  makeApicall("GET", editUrl, null, patchData, snackbar);
}

function patchData(res) {
  let editObj = res;

  title.value = editObj.title;
  bodycontrol.value = editObj.body;
  userId.value = editObj.userId;

  editBtn.classList.add("d-none");
  updateBtn.classList.remove("d-none");

  postForm.classList.remove("d-none");

  postForm.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function onUpdatehandalar() {
  let updateId = localStorage.getItem("editId");

  let updateObj = {
    title: title.value,
    body: bodycontrol.value,
    userId: userId.value,
  };

  let updateUrl = `${baseURl}/posts/${updateId}`;
  makeApicall("PATCH", updateUrl, updateObj, updateCardonUI, snackbar);
}

function updateCardonUI(body) {
  let updateId = localStorage.getItem("editId");

  let div = document.getElementById(updateId);
  div.className = "col-md-4 mt-4";
  div.innerHTML = `
   <div class="card shadow h-100">
   <div class="card-header">${body.title}</div>
      <div class="card-body">
        <div>${body.body}</div>
        <div>${body.userId}</div>
      </div>
      <div class="card-footer d-flex justify-content-between"  onclick="onEdit(this)">
        <button class="btn  border-info"><i class="fa-solid fa-pen-to-square text-info"></i></button>
        <button class="btn  border-danger" onclick="onDelete(this)"><i class="fa-solid text-danger fa-trash-can"></i></button>
    </div>
    </div>
   `;

  editBtn.classList.remove("d-none");
  updateBtn.classList.add("d-none");

  snackbar(`Post update successfully`, "success");

  div.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });

  div.classList.add("highlight");

  setTimeout((highlight) => {
    div.classList.remove("highlight");
  }, 2000);

  postForm.reset();
}

function onDelete(ele) {
  Swal.fire({
    title: "Are you sure?",
    text: "You want to delete it!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      let deleteId = ele.closest(".col-md-4").id;
      localStorage.setItem("deleteId", deleteId);
      let deleteUrl = `${baseURl}/posts/${deleteId}`;

      makeApicall("DELETE", deleteUrl, null, removeCard, snackbar);
    }
  });
}

function removeCard(ele) {
  let deleteId = localStorage.getItem("deleteId");
  document.getElementById(deleteId).remove();
}

postForm.addEventListener("submit", onsubmitHandalar);
updateBtn.addEventListener("click", onUpdatehandalar);
