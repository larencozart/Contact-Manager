// imports

class ContactManager {
   constructor() {
    // set properties and call necessary methods
    this.contactsDisplay = document.getElementById('contacts-display');
    this.searchBar = document.getElementById('search-bar');
    this.contacts = [];

    this.displayContacts();
    this.attachListeners();
  }

  attachListeners() {
    this.searchBar.addEventListener("input", this.displaySearchedContacts.bind(this));
    this.contactsDisplay.addEventListener("click", this.handleDelete.bind(this));
  }

  async fetchContacts(searchQuery) {
    let response = await fetch("http://localhost:3000/api/contacts");
    let contacts = await response.json();

    if (searchQuery) {
      let filteredContacts = contacts.filter(contact => {
        let name = contact.full_name.toLowerCase();
        searchQuery = searchQuery.toLowerCase().trim();
        return name.includes(searchQuery);
      });
      return filteredContacts;
    } else {
      return contacts;
    }
  }

  displayNoContacts() {
    let noContacts = document.createElement('p');
    noContacts.classList.add("no-contacts");
    this.contactsDisplay.appendChild(noContacts);
    noContacts.textContent = "No contacts yet. Go ahead and add one!";
  }

  async displayContacts(searchQuery) {
    this.contacts = await this.fetchContacts(searchQuery);

    if (this.contacts.length < 1) {
      this.displayNoContacts();
    } else {
      let contactHandlebar = document.getElementById("contact-template");
      let contactTemplate = Handlebars.compile((contactHandlebar).innerHTML);
      this.contactsDisplay.innerHTML = contactTemplate({contacts: this.contacts});
    }
  }

  displaySearchedContacts() {
    let searchQuery = this.searchBar.value;
    console.log(searchQuery);
    this.displayContacts(searchQuery);
  }

  findIdByName(name) {
    let contact = this.contacts.find(contact => {
      
    });
  }

  handleDelete(e) {
    if (!e.target.classList.contains("delete-btn")) return;

    if (confirm('Are you sure you want to delete this contact?')) {
      console.log("trying to delete now");
      let contactItem = e.target.parentNode;
      let name = contactItem.firstElementChild.textContent.trim();
      let email = contactItem.
      console.log(email);
      this.deleteContact(name);
    } else {
      console.log("delete action canceled");
      return;
    }
  }

  async deleteContact(id) {
    console.log(name);

    // make the AJAX call to delete this contact from the API
        // need the id
        // use this.contacts to find contact with the correct name
        // get the id from this contact obj
  }
}

document.addEventListener("DOMContentLoaded", () => {
  let contactManager = new ContactManager();
});