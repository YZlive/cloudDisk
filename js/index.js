{
  let topId = 0; //顶层id
  let nowId = 0; //当前选中项的id
  let topPid = -1; //最顶层id
  // 获取自己

  function getSelf(id) {
    return data.filter((item) => id == item.id)[0];
  }
  // 获取子级
  function getChild(pid) {
    return data.filter((item) => pid == item.pid);
  }
  // 获取父级
  function getParent(id) {
    let s = getSelf(id);
    return getSelf(s.pid);
  }
  // 获取所有父级
  function getAllParent(id) {
    let parent = getParent(id);
    let allParent = [];
    while (parent) {
      allParent.unshift(parent);
      parent = getParent(parent.id);
    }
    return allParent;
  }
  // 获取数据的所有子级（包括儿孙）
  function getAllChild(id) {
    let child = getChild(id);
    let allChild = [];
    if (child.length > 0) {
      allChild = allChild.concat(child);
      child.forEach((item) => {
        allChild = allChild.concat(getAllChild(item.id));
      });
    }
    return allChild;
  }
  // 删除当前项
  function removeData(id) {
    let remove = getAllChild(id);
    remove.push(getSelf(id));
    data = data.filter((item) => !remove.includes(item));
  }
  // 移动文件
  function moveData(id, newPid) {
    let selfData = getSelf(id);
    selfData.pid = newPid;
  }
  // 名称冲突检查
  function testName(id, newName) {
    let child = getChild(id);
    return child.some((item) => item.title == newName);
  }
  // 元素选中或未选中状态
  function changeChecked(id, checked) {
    let selfData = getSelf(id);
    selfData.checked = checked;
  }
  // 判断当前视图中数据是否全选
  function isCheckedAll() {
    let child = getChild(nowId);
    return child.every((item) => item.checked) && child.length > 0;
  }
  // 判断当前视图中的数据是否全选了
  function setAllChecked(checked) {
    let child = getChild(nowId);
    child.forEach((item) => {
      item.checked = checked;
    });
  }

  // 获取当前视图中被选中的数据
  function getChecked(checked) {
    let child = getChild(nowId);
    return child.filter((item) => item.checked);
  }
  // 操作是否全选

  let checkedAll = document.querySelector("#checked-all");
  function setCheckedAll() {
    checkedAll.checked = isCheckedAll();
  }

  checkedAll.onchange = function () {
    setAllChecked(this.checked);
    folders.innerHTML = renderFolders();
  };
  // 视图渲染
  let treeMenu = document.querySelector("#tree-menu");
  let breaNav = document.querySelector(".bread-nav");
  let folders = document.querySelector("#folders");
  render();
  function render() {
    treeMenu.innerHTML = renderTreeMenu(-1, 0);
    breaNav.innerHTML = renderBreadNav();
    folders.innerHTML = renderFolders();
  }
  // 视图菜单渲染
  function renderTreeMenu(pid, level, isOpen) {
    let child = getChild(pid);
    let nowAllParent = getAllParent(nowId);
    nowAllParent.push(getSelf(nowId));
    let inner = `
      <ul>
        ${child
          .map((item) => {
            let itemChild = getChild(item.id);
            return `
            <li class="${nowAllParent.includes(item) || isOpen ? "open" : ""}">
              <p
                style="padding-left:${40 + level * 20}px" 
                class="${itemChild.length ? "has-child" : ""} ${
              item.id == nowId ? "active" : ""
            }"  data-id="${item.id}"
            >
                <span>${item.title}</span>
              </p>
              ${
                itemChild.length
                  ? renderTreeMenu(item.id, level + 1, isOpen)
                  : ""
              }
            </li>
          `;
          })
          .join("")}
      </ul>
    `;
    return inner;
  }

  // 路径导航渲染
  function renderBreadNav() {
    let nowSelf = getSelf(nowId);
    let allParent = getAllParent(nowId);
    let inner = "";
    allParent.forEach((item) => {
      inner += `<a data-id="${item.id}">${item.title}</a>`;
    });
    inner += `<span>${nowSelf.title}</span>`;
    setCheckedAll();
    return inner;
  }

  // 文件夹视图的渲染
  // function renderFolders() {
  //   let child = getChild(nowId);
  //   let inner = "";
  //   // child.forEach((item) => {
  //   //   inner += `
  //   //     <li class="folder-item active">
  //   //         <img src="img/folder-b.png" alt="" />
  //   //         <span class="folder-name">js程序设计</span>
  //   //         <input type="text" class="editor" value="js程序设计" />
  //   //         <label for="" class="checked">
  //   //             <input type="checkbox" />
  //   //             <span class="iconfont icon-checkbox-checked"></span>
  //   //         </label>
  //   //     </li>
  //   //   `;
  //   // });
  //   return inner;
  // }
  function renderFolders() {
    let child = getChild(nowId);
    let inner = "";
    child.forEach((item) => {
      inner += `
        <li class="folder-item ${item.checked ? "active" : ""}" data-id="${
        item.id
      }">
            <img src="img/folder-b.png" alt="" />
            <span class="folder-name">${item.title}</span>
            <input type="text" class="editor" value="${item.title}" />
            <label class="checked">
                <input type="checkbox" ${item.checked ? "checked" : ""}>
                <span class="iconfont icon-checkbox-checked"></span>
            </label>
        </li>
      `;
    });
    return inner;
  }

  // 弹窗

  // 成功弹窗

  function alertSuccess(info) {
    let succ = document.querySelector(".alert-success");
    clearTimeout(succ.timer);
    succ.innerHTML = info;
    succ.classList.add("alert-show");
    succ.timer = setTimeout(() => {
      succ.classList.remove("alert-show");
    }, 1000);
  }

  // 操作失败提示
  function alertWarning(info) {
    let warning = document.querySelector(".alert-warning");
    clearTimeout(warning.timer);
    warning.innerHTML = info;
    warning.classList.add("alert-show");
    warning.timer = setTimeout(() => {
      warning.classList.remove("alert-show");
    }, 1000);
  }

  document.addEventListener("selectstart", function (e) {
    e.preventDefault();
  });
  // 三大视图的事件添加
  // 树状菜单操作
  treeMenu.addEventListener("click", function (e) {
    let item = e.target.tagName == "SPAN" ? e.target.parentNode : e.target;
    if (item.tagName == "P") {
      nowId = item.dataset.id;
      data.forEach((item) => {
        delete item.checked;
      });
      render();
    }
  });
  // 路径导航
  breaNav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      nowId = e.target.dataset.id;
      data.forEach((item) => {
        delete item.checked;
      });
      render();
    }
  });
  // 文件夹视图
  folders.addEventListener("click", function (e) {
    let item = null;
    if (e.target.tagName == "LI") {
      item = e.target;
    } else if (e.target.tagName == "IMG") {
      item = e.target.parentNode;
    }
    if (item) {
      nowId = item.dataset.id;
      data.forEach((item) => {
        delete item.checked;
      });
      render();
    }
  });
  // 双击名字重命名
  folders.addEventListener("dblclick", function (e) {
    if (e.target.className == "folder-name") {
      reName(e.target.parentNode);
    }
  });
  // 文件夹选中
  folders.addEventListener("change", (e) => {
    console.log(e.target.type);
    if (e.target.type === "checkbox") {
      let id = e.target.parentNode.parentNode.dataset.id;
      changeChecked(id, e.target.checked);
      folders.innerHTML = renderFolders();
      setCheckedAll();
    }
  });
  // 新建文件夹
  let createBtn = document.querySelector(".create-btn");
  createBtn.addEventListener("click", function () {
    data.push({
      id: Date.now(),
      pid: nowId,
      title: getName(),
    });
    render();
    alertSuccess("添加文件成功");
  });

  // 重命名

  function reName(folder) {
    let folderName = folder.querySelector(".folder-name");
    let editor = folder.querySelector(".editor");
    folderName.style.display = "none";
    editor.style.display = "block";
    editor.select();
    editor.onblur = function () {
      if (editor.value === folderName.innerHTML) {
        folderName.style.display = "block";
        editor.style.display = "none";
        return;
      }
      if (!editor.value.trim()) {
        alertWarning("请输入新名字");
        editor.focus();
        return;
      }
      if (testName(nowId, editor.value)) {
        alertWarning("换个名字吧！名字重复了");
        editor.focus();
        return;
      }
      folderName.style.display = "block";
      editor.style.display = "none";
      getSelf(folder.dataset.id).title = editor.value;
      render();
      alertSuccess("重命名成功");
    };
  }
  // 获取新建文件夹的名字
  function getName() {
    let child = getChild(nowId);
    let names = child.map((item) => item.title);
    names = names.filter((item) => {
      if (item === "新建文件夹") {
        return true;
      }
      if (
        item.substring(0, 6) === "新建文件夹(" &&
        Number(item.substring(6, item.length - 1)) >= 2 &&
        item[item.length - 1] == ")"
      ) {
        return true;
      }
      return false;
    });
    names.sort((n1, n2) => {
      n1 = n1.substring(6, n1.length - 1);
      n2 = n2.substring(6, n2.length - 1);
      n1 = isNaN(n1) ? 0 : n1;
      n2 = isNaN(n2) ? 0 : n2;
      return n1 - n2;
    });
    if (names[0] !== "新建文件夹") {
      return "新建文件夹";
    }
    for (let i = 1; i < names.length; i++) {
      if (Number(names[i].substring(6, names[i].length - 1)) !== i + 1) {
        return `新建文件夹(${i + 1})`;
      }
    }
    return `新建文件夹(${names.length + 1})`;
  }
  // 右键菜单
  let contextmenu = document.querySelector("#contextmenu");
  window.addEventListener("mousedown", function (e) {
    contextmenu.style.display = "none";
  });
  window.addEventListener("resize", function (e) {
    contextmenu.style.display = "none";
  });
  window.addEventListener("scroll", function (e) {
    contextmenu.style.display = "none";
  });
  document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
  });

  folders.addEventListener("contextmenu", function (e) {
    let folder = null;
    if (e.target.tagName == "LI") {
      folder = e.target;
    } else if (e.target.parentNode.tagName == "LI") {
      folder = e.target.parentNode;
    }
    if (folder) {
      contextmenu.style.display = "block";
      e.stopPropagation();
      e.preventDefault();
      let l = e.clientX;
      let t = e.clientY;
      let maxL = document.documentElement.clientWidth - contextmenu.offsetWidth;
      let maxT =
        document.documentElement.clientHeight - contextmenu.offsetHeight;
      l = Math.min(l, maxL);
      t = Math.min(t, maxT);
      contextmenu.style.left = l + "px";
      contextmenu.style.top = t + "px";
      contextmenu.folder = folder;
    }
  });
  // 右键菜单事件处理
  contextmenu.addEventListener("mousedown", function (e) {
    e.stopPropagation();
  });
  contextmenu.addEventListener("click", function (e) {
    if (e.target.classList.contains("icon-lajitong")) {
      // console.log("删除", this.folder);
      confirm("确认删除文件夹吗？", () => {
        removeData(Number(this.folder.dataset.id));
        render();
        alertSuccess("删除文件夹成功");
      });
    } else if (e.target.classList.contains("icon-yidong")) {
      // console.log("移动");
      let id = Number(this.folder.dataset.id);
      console.log(id);
      let nowPid = getSelf(id).pid;
      console.log(nowPid);
      // moveData(id, 0);
      // render();
      moveAlert(() => {
        if (newPid === null || nowPid == newPid) {
          console.log(newPid, nowPid);
          alertWarning("您并没有做任何移动");
          return false;
        }
        let allChild = getAllChild(id);
        let newParent = getSelf(newPid);
        allChild.push(getSelf(id));
        if (allChild.includes(newParent)) {
          alertWarning("不能把元素移动到自己里边");
          return false;
        }
        if (testName(newPid, getSelf(id).title)) {
          alertWarning("文件夹命名有冲突");
          return false;
        }
        moveData(id, newPid);
        nowId = newPid;
        render();
        alertSuccess("移动成功");
        return true;
      });
    } else if (e.target.classList.contains("icon-zhongmingming")) {
      // console.log("重命名");
      reName(this.folder);
    }
    contextmenu.style.display = "none";
  });

  // 弹窗控件
  let confirmEl = document.querySelector(".confirm");
  let confirmText = document.querySelector(".confirm-text");
  let closConfirm = confirmEl.querySelector(".clos");
  let mask = document.querySelector("#mask");
  let confirmBtns = confirmEl.querySelectorAll(".confirm-btns a");
  // confirm(
  //   "删除文件",
  //   () => {
  //     console.log("确定");
  //   },
  //   () => {
  //     console.log("取消");
  //   }
  // );
  function confirm(info, resolve, reject) {
    confirmText.innerHTML = info;
    confirmEl.classList.add("confirm-show");
    mask.style.display = "block";
    confirmBtns[0].onclick = function () {
      confirmEl.classList.remove("confirm-show");
      mask.style.display = "none";
      resolve && resolve();
    };
    confirmBtns[1].onclick = function () {
      confirmEl.classList.remove("confirm-show");
      mask.style.display = "none";
      reject && reject();
    };
  }
  closConfirm.addEventListener("click", () => {
    confirmEl.classList.remove("confirm-show");
    mask.style.display = "none";
  });
  // 移动弹窗
  let moveAlertEl = document.querySelector(".move-alert");
  let closMoveAlert = moveAlertEl.querySelector(".clos");
  let moveAlertBtns = moveAlertEl.querySelectorAll(".confirm-btns a");
  let moveAlertTreeMenu = moveAlertEl.querySelector(".move-alert-menu");
  let newPid = null;
  moveAlertTreeMenu.addEventListener("click", (e) => {
    let item = e.target.tagName == "SPAN" ? e.target.parentNode : e.target;
    console.log(item);
    if (item.tagName == "P") {
      let p = moveAlertTreeMenu.querySelectorAll("p");
      p.forEach((item) => {
        item.classList.remove("active");
      });
      item.classList.add("active");
      newPid = item.dataset.id;
      console.log(newPid);
    }
  });
  closMoveAlert.onclick = function () {
    moveAlertEl.classList.remove("move-alert-show");
    mask.style.display = "none";
  };
  // moveAlert();
  function moveAlert(resolve, reject) {
    moveAlertTreeMenu.innerHTML = renderTreeMenu(topId, 0, true);
    moveAlertEl.classList.add("move-alert-show");
    mask.style.display = "block";
    newPid = null;
    moveAlertBtns[0].onclick = function () {
      // console.log("object");
      resolve && resolve();
      moveAlertEl.classList.remove("move-alert-show");
      mask.style.display = "none";
    };
    moveAlertBtns[1].onclick = function () {
      reject && reject();
      moveAlertEl.classList.remove("move-alert-show");
      mask.style.display = "none";
    };
  }
  // 框选
  let selectBox = null;
  folders.addEventListener("mousedown", function (e) {
    let items = document.querySelectorAll(".folder-item");
    let startMouse = {
      x: e.clientX,
      y: e.clientY,
    };
    let move = (e) => {
      if (!selectBox) {
        selectBox = document.createElement("div");
        selectBox.id = "select-box";
        document.body.appendChild(selectBox);
      }
      let nowMouse = {
        x: e.clientX,
        y: e.clientY,
      };
      let rect = folders.getBoundingClientRect();
      /* let dis = {
        x: nowMouse.x - startMouse.x,
        y: nowMouse.y - startMouse.y
      }; */
      let minX = Math.min(nowMouse.x, startMouse.x);
      let minY = Math.min(nowMouse.y, startMouse.y);
      let maxX = Math.max(nowMouse.x, startMouse.x);
      let maxY = Math.max(nowMouse.y, startMouse.y);
      let l = Math.max(minX, rect.left);
      let t = Math.max(minY, rect.top);
      let r = Math.min(maxX, rect.right);
      let b = Math.min(maxY, rect.bottom);
      // let l = Math.min(nowMouse.x, startMouse.x);
      // let t = Math.min(nowMouse.y, startMouse.y);
      // let w = Math.abs(nowMouse.x - startMouse.x);
      // let h = Math.abs(nowMouse.y - startMouse.y);
      selectBox.style.left = l + "px";
      selectBox.style.top = t + "px";
      selectBox.style.width = r - l + "px";
      selectBox.style.height = b - t + "px";
      items.forEach((item) => {
        let checkbox = item.querySelector('[type="checkbox"]');
        if (isCollision(item, selectBox)) {
          item.classList.add("active");
          checkbox.checked = true;
          changeChecked(item.dataset.id, true);
        } else {
          checkbox.checked = false;
          item.classList.remove("active");
          changeChecked(item.dataset.id, false);
        }
        setCheckedAll();
      });
    };
    document.addEventListener("mousemove", move);
    document.addEventListener(
      "mouseup",
      () => {
        document.removeEventListener("mousemove", move);
        if (selectBox) {
          document.body.removeChild(selectBox);
          selectBox = null;
        }
      },
      { once: true }
    );
  });

  // 碰撞检测
  function isCollision(el, el2) {
    let elRect = el.getBoundingClientRect();
    let el2Rect = el2.getBoundingClientRect();
    if (
      elRect.top > el2Rect.bottom ||
      el2Rect.top > elRect.bottom ||
      elRect.left > el2Rect.right ||
      el2Rect.left > elRect.right
    ) {
      return false;
    }
    return true;
  }
  // 批量删除
  let delBtn = document.querySelector(".del-btn");
  delBtn.addEventListener("click", () => {
    let checkedData = getChecked();
    if (checkedData.length === 0) {
      alertWarning("请先选择要操作的文件");
      return;
    }
    confirm("确认删除这些文件吗？", () => {
      checkedData.forEach((item) => {
        removeData(item.id);
      });
      render();
      alertSuccess("删除文件夹成功");
    });
  });

  // 批量移动到
  let moveBtn = document.querySelector(".move-btn");
  moveBtn.addEventListener("click", () => {
    let checkedData = getChecked();
    console.log("dasf" + checkedData);
    if (checkedData.length === 0) {
      alertWarning("请先选择要操作的文件");
      return;
    }
    let nowPid = nowId;
    moveAlert(() => {
      if (newPid === null || nowPid == newPid) {
        alertWarning("您没有进行任何移动");
        return false;
      }
      for (let i = 0; i < checkedData.length; i++) {
        let id = checkedData[i].id;
        let allChild = getAllChild(id);
        let newParent = getSelf(newPid);
        allChild.push(checkedData[i]);
        if (allChild.includes(newParent)) {
          alertWarning("不能把元素移动到自己内部");
          return false;
        }
        if (testName(newPid, checkedData[i].title)) {
          alertWarning("文件夹命名有冲突");
          return false;
        }
        moveData(id, newPid);
      }
      nowId = newPid;
      render();
      alertSuccess("移动成功");
      return true;
    });
  });
}

// 第三讲片段二
