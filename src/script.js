import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
const db = getFirestore();
const dbRef = collection(db, "contacts");

// ------------------------------------------------------------
// Mobile View
// ------------------------------------------------------------
const leftCol = document.getElementById("left-col");
const backBtn = document.getElementById("back-btn");

backBtn.addEventListener("click", (e) => {
  leftCol.style.display = "block";
  rightCol.style.display = "none";
});

const toggleLeftAndRightViewsOnMobile = () => {
  if (document.body.clientWidth <= 600) {
    leftCol.style.display = "none";
    rightCol.style.display = "block";
  }
};

// ------------------------------------------------------------
// GET DATA
// ------------------------------------------------------------
let contacts = [];

const getContacts = async () => {
  try {
    await onSnapshot(dbRef, (docsSnap) => {
      contacts = [];

      docsSnap.forEach((doc) => {
        const contact = doc.data();
        contact.id = doc.id;
        contacts.push(contact);
      });
      showContacts(contacts);
    });
  } catch (err) {
    console.log("getContacts: " + err);
  }
};

getContacts();

// ------------------------------------------------------------
// SHOW CONTACT AS LIST ITEM ON THE LEFT
// ------------------------------------------------------------
const contactList = document.getElementById("contact-list");

const showContacts = (contacts) => {
  contactList.innerHTML = "";

  contacts.forEach((contact) => {
    const li = `
                <li class="contact-list-item" id="${contact.id}">
                    <div class="media">
                        <div class="two-letters">${contact.firstname.charAt(
                          0
                        )}${contact.lastname.charAt(0)}</div>
                    </div>
                    <div class="content">
                        <div class="title">
                        ${contact.firstname} ${contact.lastname}
                        </div>
                        <div class="sub-title">
                        ${contact.email}
                        </div>
                    </div>
                    <div class="action">
                        <button class="edit-user">edit</button>
                        <button class="delete-user">delete</button>
                    </div>
                </li>`;

    contactList.innerHTML += li;
  });
};

// ------------------------------------------------------------
// CLICK CONTACT LIST ITEM
// ------------------------------------------------------------
const contactListPressed = (event) => {
  const id = event.target.closest("li").getAttribute("id");

  if (event.target.className === "edit-user") {
    editButtonPressed(id);
  } else if (event.target.className === "delete-user") {
    deleteButtonPressed(id);
  } else {
    displayContactOnDetailsView(id);
    toggleLeftAndRightViewsOnMobile();
  }
};

contactList.addEventListener("click", contactListPressed);
// ------------------------------------------------------------
// DELETE DATA
// ------------------------------------------------------------
const deleteButtonPressed = async (id) => {
  const isConfirmed = confirm("Are you sure you want to delete it?");

  if (isConfirmed) {
    try {
      const docRef = doc(db, "contacts", id);
      await deleteDoc(docRef);
    } catch (e) {
      setErrorMessage(
        "error",
        "Unable to delete the contact data. Please try again later"
      );
      showErrorMessages();
    }
  }
};

// ------------------------------------------------------------
// EDIT DATA
// ------------------------------------------------------------
const editButtonPressed = (id) => {
  modalOverlay.style.display = "flex";
  const contact = getContact(id);

  firstname.value = contact.firstname;
  lastname.value = contact.lastname;
  age.value = contact.age;
  phone.value = contact.phone;
  email.value = contact.email;

  modalOverlay.setAttribute("contact-id", contact.id);
};

// ------------------------------------------------------------
// DISPLAY DETAILS VIEW ON LIST ITEM CLICK
// -----------------------------------------------------------
const rightCol = document.getElementById("right-col");

const getContact = (id) => {
  return contacts.find((contact) => {
    return contact.id === id;
  });
};

const displayContactOnDetailsView = (id) => {
  const contact = getContact(id);

  // Display Right Col Title
  const rightColTitle = rightCol.querySelector(".title");
  rightColTitle.innerHTML = contact.firstname;

  const rightColDetail = document.getElementById("right-col-detail");
  rightColDetail.innerHTML = `

            <div class="label">Name:</div>
            <div class="data">${contact.firstname} ${contact.lastname}</div>

            <div class="label">Age:</div>
            <div class="data">${contact.age}</div>

            <div class="label">Phone:</div>
            <div class="data">${contact.phone}</div>

            <div class="label">Email:</div>
            <div class="data">${contact.email}</div>

    `;
};

// ------------------------------------------------------------
// MODAL
// ------------------------------------------------------------

const addBtn = document.querySelector(".add-btn");
const modalOverlay = document.getElementById("modal-overlay");
const closeBtn = document.querySelector(".close-btn");

const addButtonPressed = () => {
  modalOverlay.style.display = "flex";
  modalOverlay.removeAttribute("contact-id");
  firstname.value = "";
  lastname.value = "";
  age.value = "";
  phone.value = "";
  email.value = "";
};

const closeButtonPressed = () => {
  modalOverlay.style.display = "none";
};

const hideModal = (e) => {
  if (e instanceof Event) {
    if (e.target === e.currentTarget) {
      modalOverlay.style.display = "none";
    }
  } else {
    modalOverlay.style.display = "none";
  }
};

addBtn.addEventListener("click", addButtonPressed);
closeBtn.addEventListener("click", closeButtonPressed);
modalOverlay.addEventListener("click", hideModal);

// ------------------------------------------------------------
// FORM VALIDATION & ADD DATA
// ------------------------------------------------------------

const saveBtn = document.querySelector(".save-btn");
const error = {};

const firstname = document.getElementById("firstname"),
  lastname = document.getElementById("lastname"),
  age = document.getElementById("age"),
  phone = document.getElementById("phone"),
  email = document.getElementById("email");

const saveButtonPressed = async () => {
  checkRequired([firstname, lastname, email, age, phone]);
  checkEmail(email);
  checkInputLength(age, 2);
  checkInputLength(phone, 10);
  showErrorMessages(error);

  if (Object.keys(error).length === 0) {
    if (modalOverlay.getAttribute("contact-id")) {
      // update data
      const docRef = doc(
        db,
        "contacts",
        modalOverlay.getAttribute("contact-id")
      );

      try {
        await updateDoc(docRef, {
          firstname: firstname.value,
          lastname: lastname.value,
          age: age.value,
          phone: phone.value,
          email: email.value,
        });

        hideModal();
      } catch (e) {
        setErrorMessage(
          "error",
          "Unable to update user data to the database. Please try again later"
        );
        showErrorMessages();
      }
    } else {
      // add data
      try {
        await addDoc(dbRef, {
          firstname: firstname.value,
          lastname: lastname.value,
          age: age.value,
          phone: phone.value,
          email: email.value,
        });

        hideModal();
      } catch (err) {
        setErrorMessage(
          "error",
          "Unable to add user data to the database. Please try again later"
        );
        showErrorMessages();
      }
    }
  }
};

const checkRequired = (inputArray) => {
  inputArray.forEach((input) => {
    if (input.value.trim() === "") {
      setErrorMessage(input, input.id + " is empty");
    } else {
      deleteErrorMessage(input);
    }
  });
};

const checkEmail = (input) => {
  if (input.value.trim() !== "") {
    const re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (re.test(input.value.trim())) {
      deleteErrorMessage(input);
    } else {
      setErrorMessage(input, input.id + " is invalid");
    }
  }
};

const checkInputLength = (input, num) => {
  if (input.value.trim() !== "") {
    if (input.value.trim().length === num) {
      deleteErrorMessage(input);
    } else {
      setErrorMessage(input, input.id + ` must be ${num} digits`);
    }
  }
};

const deleteErrorMessage = (input) => {
  delete error[input.id];
  input.style.border = "1px solid green";
};

const setErrorMessage = (input, message) => {
  if (input.nodeName === "INPUT") {
    error[input.id] = message;
    input.style.border = "1px solid red";
  } else {
    error[input] = message;
  }
};

const showErrorMessages = () => {
  let errorLabel = document.getElementById("error-label");
  errorLabel.innerHTML = "";
  for (const key in error) {
    const li = document.createElement("li");
    li.innerText = error[key];
    li.style.color = "red";
    errorLabel.appendChild(li);
  }
};

saveBtn.addEventListener("click", saveButtonPressed);
