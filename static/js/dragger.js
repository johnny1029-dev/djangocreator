function setExactHeight() {
  const height = window.innerHeight; // Exact height of the viewport
  document.documentElement.style.setProperty("--exact-height", `${height}px`);
}

window.onload = load;

const parent = document.querySelector("html");
const fontSize = parseInt(window.getComputedStyle(parent).fontSize);

let HTMLMasterContainer;

function load() {
  setExactHeight();
  window.addEventListener("resize", setExactHeight);

  document.querySelectorAll(".item").forEach((item) => {
    item.style.height = item.getAttribute("sizey") + "em";
    item.style.width = item.getAttribute("sizex") + "em";
  });

  $.ajax({
    url: "login/",
    type: "POST",
    contentType: "application/json", // Set content type to JSON
    data: JSON.stringify({ username: "test", password: "test" }), // Serialize data
    success: function (response) {
      console.log(response); // Handle success
    },
    error: function (response) {
      console.error("Error:", response.responseJSON.message); // Handle error
    },
  });

  HTMLMasterContainer = document.querySelector("#HTMLMasterContainer");
}

interact(".item").draggable({
  inertia: false,
  modifiers: [
    interact.modifiers.restrictRect({
      restriction: "parent",
      endOnly: true,
    }),
  ],
  // enable autoScroll
  autoScroll: true,
  ignoreFrom: "textarea",

  listeners: {
    // call this function on every dragmove event
    move: dragMoveListener,

    // call this function on every dragend event
    end(event) {},
  },
});

function dragMoveListener(event) {
  var target = event.target;
  // keep the dragged position in the data-x/data-y attributes
  var x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
  var y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

  // translate the element
  target.style.transform = "translate(" + x + "px, " + y + "px)";

  // update the posiion attributes
  target.setAttribute("data-x", x);
  target.setAttribute("data-y", y);
}

interact("#HTMLMasterItem").dropzone({
  // only accept elements matching this CSS selector
  accept: ".HTMLItem",
  overlap: 0.1,

  // listen for drop related events:

  ondropactivate: function (event) {
    // add active dropzone feedback
    event.target.classList.add("drop-active");
    let items = event.target.getAttribute("items");
    if (items) {
      let itemsArr = items.split(",");
      if (itemsArr.includes(event.relatedTarget.id)) {
        itemsArr = itemsArr.filter((el) => el !== event.relatedTarget.id);

        let masterSize = parseInt(HTMLMasterContainer.getAttribute("sizey"));
        let elSize = parseInt(event.relatedTarget.getAttribute("sizey"));
        masterSize -= elSize;
        HTMLMasterContainer.setAttribute("sizey", masterSize);
        HTMLMasterContainer.style.height = masterSize + "em";
        dragMoveListener({
          target: event.relatedTarget,
          dx: 0,
          dy: elSize * fontSize,
        });

        //itemsArr.forEach(item => dragMoveListener({target: document.querySelector("#" + item), dx:0, dy: elSize * fontSize}));

        items = itemsArr.join(",");
        event.target.setAttribute("items", items);

        throw "";
      }
    }
  },
  ondragenter: function (event) {
    var dropzoneElement = event.target;

    // feedback the possibility of a drop
    dropzoneElement.classList.add("dropping");
  },
  ondragleave: function (event) {
    // remove the drop feedback style
    event.target.classList.remove("dropping");
  },
  ondrop: function (event) {
    let masterSize = parseInt(HTMLMasterContainer.getAttribute("sizey"));
    let elSize = parseInt(event.relatedTarget.getAttribute("sizey"));
    masterSize += elSize;
    HTMLMasterContainer.setAttribute("sizey", masterSize);
    HTMLMasterContainer.style.height = masterSize + "em";
    dragMoveListener({
      target: event.relatedTarget,
      dx: 0,
      dy: elSize * -fontSize,
    });
    let items = event.target.getAttribute("items");
    if (!items) {
      items = "";
    } else {
      items += ",";
    }
    items += event.relatedTarget.id;
    event.target.setAttribute("items", items);
  },
  ondropdeactivate: function (event) {
    // remove active dropzone feedback
    event.target.classList.remove("drop-active");
    event.target.classList.remove("dropping");
  },
});
