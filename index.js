const serverURL = "http://localhost:3000/lists/"

//Delete an item
function deleteItem(e) {
    const isDelete = window.confirm("Bạn có muốn xóa mục này ?");
    if (!isDelete)
        return;

    const id = e.target.id;
    axios({
        method: 'DELETE',
        url: `${serverURL + id}`
    });
}

//Mark an item
function markSuccessItem(e) {
    const isDone = window.confirm("Đánh dấu đã hoàn thành ?");
    if (!isDone)
        return;

    const id = e.target.id;
    axios({
        method: "PATCH",
        url: `${serverURL + id}`,
        data: {
            isDone: true,
            doneDate: new Date().toString()
        }
    })
}

function undoMarkSuccessItem(e) {
    const isUndo = window.confirm("Đánh dấu là chưa hoàn thành ?");
    if (!isUndo)
        return;
    
    const id = e.target.id;
    axios({
        method: "PATCH",
        url: `${serverURL + id}`,
        data: {
            isDone: false,
            doneDate: null
        }
    })
}

function editItem(e) {
    const inp = document.querySelector(`input[id="${e.target.id}"]`);
    inp.disabled = false
    inp.selectionStart = inp.selectionEnd = inp.value.length;
    inp.focus();
}

function changeItem(e) {
    const newValue = e.target.value;
    if (newValue === "" || newValue === null || newValue === this.oldValue) {
        e.target.disabled = true;
        return;
    }

    const id = e.target.id;
    axios({
        method: "PATCH",
        url: `${serverURL + id}`,
        data: {
            content: newValue
        }
    })
}

//Add an item to db
function addNewItem() {
    const newTodo = window.prompt("Nhập việc cần làm: ");
    if (newTodo === null || newTodo === "")
        return;
    else {
        axios({
            method: "POST",
            url: serverURL,
            data: {
                content: newTodo,
                isDone: false,
                dateCreated: new Date().toString(),
                dateEdited: new Date().toString()
            }
        })
    }
}

//Delete all items 
function clearItems() {
    const isClear = window.confirm("Bạn có muốn xóa tất cả bản ghi không ?");
    if (!isClear)
        return;
    
    todoItems.then(res => 
        res.forEach(item => {
        axios({
            method: 'DELETE',
            url: `${serverURL + item.id}`
        });
    }))
}

//View success
function viewSuccess(e) {
    let now = localStorage.getItem("viewSuccess");
    let t;
    if (now === "1")
        t = 0
    else
        t = 1;
    localStorage.setItem("viewSuccess", t)

    setTimeout(() => window.location.reload(), 500)
}

//Render
function renderItems (lists) {
    if (lists.length <= 5) {
        $("body").css("position", "fixed")
    }
    if (lists.length === 0) {
        return
    }
    const todoItems = lists.map(item => {
        const successClass = (item.isDone) ? "success" : null;
        const dynamicBtn = (item.isDone) ? `<button type="button" class="btn btn-warning btns" id="${item.id}"></button>` : `<button type="button" class="btn btn-success btns" id="${item.id}"></button>`;

        return (`<div class="todo__item">
                    <div class="todo__input ${successClass}">
                        <input type="text" placeholder="Nhập việc cần làm" value="${item.content}" disabled id="${item.id}">
                    </div>
                    <div class="todo__buttons">
                        <button type="button" class="btn btn-danger btns" id="${item.id}"></button>
                        ${dynamicBtn}
                        <button type="button" class="btn btn-primary btns" id="${item.id}"></button>
                    </div>
                </div>`)
    })
    const todoDiv = document.querySelector(".todo__items")
    todoDiv.innerHTML = todoItems.join("")
}

//Load data from json-server
async function loadItems() {
    try {
        const viewSuccessId = localStorage.getItem("viewSuccess");
        let res = await axios.get(serverURL);
        return res.data.filter(dataItem => dataItem.isDone === (viewSuccessId === "1") ? true : false)
    }
    catch(err) {
        console.log(err);
    }
}




//Then run and handle events
const todoItems = loadItems();
todoItems.then(res => {
    renderItems(res)

    const clearBtn = document.querySelector(".delete__option");
    clearBtn.addEventListener("click", clearItems);

    const viewSuccessBtn = document.querySelector(".view__option");
    viewSuccessBtn.addEventListener("click", viewSuccess);

    const addBtn = document.querySelector(".add__option");
    addBtn.addEventListener("click", addNewItem);

    const deleteBtns = document.querySelectorAll(".btn-danger");
    deleteBtns.forEach(btn => btn.addEventListener("click", deleteItem));

    const successBtns = document.querySelectorAll(".btn-success");
    successBtns.forEach(btn => btn.addEventListener("click", markSuccessItem));

    const warningBtns = document.querySelectorAll(".btn-warning");
    warningBtns.forEach(btn => btn.addEventListener("click", undoMarkSuccessItem));

    const editBtns = document.querySelectorAll(".btn-primary");
    editBtns.forEach(btn => btn.addEventListener("click", editItem));

    const inps = document.querySelectorAll("input");
    inps.forEach(btn => {
        btn.addEventListener("focus", () => {
            const oldValue = btn.value;
            btn.addEventListener("change", changeItem)
            // window.addEventListener("keydown", (e) => {
            //     console.log(e);
            // })
        })
    })
})