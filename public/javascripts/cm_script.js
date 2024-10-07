// imports

class ContactManager {
   constructor() {
    // set properties and call necessary methods
    this.contactsDisplay = document.getElementById('contacts-display');
    this.tags = [];
    this.contacts = [];

    console.log("CM class is working");
    this.displayContacts();
    
  }

  static initialize() {
    
    // this.createUI();
  }

  async fetchAllContacts() {
    let response = await fetch("http://localhost:3000/api/contacts");
    let contacts = await response.json();

    return contacts;
  }

  displayNoContacts() {
    let noContacts = document.createElement('p');
    noContacts.classList.add("no-contacts");
    this.contactsDisplay.appendChild(noContacts);
    noContacts.textContent = "No contacts yet. Go ahead and add one!";
  }

  async displayContacts() {
    let contacts = await this.fetchAllContacts();

    if (contacts.length < 1) {
      this.displayNoContacts();
    } else {
      // handlebars baby
      let contactHandlebar = document.getElementById("contact-template");
      let contactTemplate = Handlebars.compile((contactHandlebar).innerHTML);
      this.contactsDisplay.innerHTML = contactTemplate({contacts: contacts});
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // invoke class;
  let contactManager = new ContactManager();
});