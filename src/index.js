//Delete an item
function deleteItem(e) {
    const isDelete = window.confirm("Bạn có muốn xóa mục này ?");
    if (!isDelete)
        return;

    const id = e.target.id;
	collection.doc(id).delete()
	.then(() => {
		alert("Xóa thành công.");
		setTimeout(() => {
			window.location.reload();
		}, 100);
	})
	.catch(() => {
		alert("Lỗi xảy ra, vui lòng thử lại.");
		console.log(err)
	})
}

//Mark an item
function markSuccessItem(e) {
    const isDone = window.confirm("Đánh dấu đã hoàn thành ?");
    if (!isDone)
        return;

    const id = e.target.id;
	
	collection.doc(id).set({
		isDone: true,
		doneDate: new Date().toString()
	}, { merge: true })
	.then(() => {
		alert("Đánh dấu thành công.");
		setTimeout(() => {
			window.location.reload();
		}, 100);
	})
	.catch(() => {
		alert("Lỗi xảy ra, vui lòng thử lại.");
		console.log(err)
	})
}

function undoMarkSuccessItem(e) {
    const isUndo = window.confirm("Đánh dấu là chưa hoàn thành ?");
    if (!isUndo)
        return;
    
    const id = e.target.id;
	
	collection.doc(id).set({
		isDone: false,
		doneDate: null
	}, { merge: true })
	.then(() => {
		alert("Đánh dấu thành công.");
		setTimeout(() => {
			window.location.reload();
		}, 100);
	})
	.catch(() => {
		alert("Lỗi xảy ra, vui lòng thử lại.");
		console.log(err)
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
    collection.doc(id).set({
		content: newValue,
		editedDate: new Date().toString()
	}, { merge: true })
	.then(() => {
		alert("Sửa thành công.")
		setTimeout(() => {
			window.location.reload();
		}, 100);
	})
	.catch(err => console.log(err))
}

//Add an item to db
function addNewItem() {
    const newTodo = window.prompt("Nhập việc cần làm: ");
    if (newTodo === null || newTodo === "")
        return;
    else {
        collection.add({
			content: newTodo,
			isDone: false,
			doneDate: null,
			editedDate: null
		})
		.then(() => {
			alert("Thêm mới thành công")
			setTimeout(() => {
				window.location.reload();
			}, 100);
		})
		.catch(err => {
			alert("Lỗi đã xảy ra, vui lòng thử lại")
			console.log(err);
		})
	}
}

//Delete all items 
function clearItems() {
    const isClear = window.confirm("Bạn có muốn xóa tất cả bản ghi không ?");
    if (!isClear)
        return;
	
	collection.get().then(res => {
		res.docs.forEach(doc => doc.ref.delete())
	})
}

//View success
function viewSuccess() {
    let now = localStorage.getItem("viewSuccess");
    let t;
    if (now === "true")
        t = false
    else
        t = true;
    localStorage.setItem("viewSuccess", t)

	todoLists.then(res => {
		const items = []
		res.forEach(todo => {
			items.push(todo)
		})
	
		setTimeout(() => {
			renderItems(items, t)
		}, 100);
	})
}

//Render
function renderItems (lists, isDone) {
	if (lists.length === 0) {
        return
    }
    if (lists.length > 5) {
        $("body").removeProperty("position");
    }
    
    const todoItems = lists.map(item => {
		const data = item.data();
		if (data.isDone !== isDone)
			return;
        const successClass = (isDone) ? "success" : "";
        const dynamicBtn = (data.isDone) ? `<button type="button" class="btn btn-warning btns" id="${item.id}"></button>` : `<button type="button" class="btn btn-success btns" id="${item.id}"></button>`;

        return (`<div class="todo__item">
                    <div class="todo__input ${successClass}">
                        <input type="text" placeholder="Nhập việc cần làm" value="${data.content}" disabled id="${item.id}">
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
	
	handleAddingEvent();
}


const db = firebase.firestore();
const collection = db.collection("todoList");
const todoLists = collection.get().then(res => {
	const items = []
	res.docs.forEach(doc => {
		if (doc.exists) {
			items.push(doc)
		}
	})
	return items;
})

todoLists.then(res => {
	const items = []
	res.forEach(todo => {
		items.push(todo)
	})

	localStorage.setItem("viewSuccess", false)
	renderItems(items, false)

})
.catch(err => {
	console.log(err)
	alert("Lỗi kết nối, xin vui lòng load lại trang.")
})

function handleAddingEvent() {
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
        })
    })
}