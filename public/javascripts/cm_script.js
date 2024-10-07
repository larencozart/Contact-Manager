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
    this.searchBar.addEventListener("input", this.displayContacts.bind(this));
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

  async displayContacts() {
    let searchQuery = this.searchBar.value;
    this.contacts = await this.fetchContacts(searchQuery);

    let contactHandlebar = document.getElementById("contact-template");
    let contactTemplate = Handlebars.compile((contactHandlebar).innerHTML);

    this.contactsDisplay.innerHTML = contactTemplate({
      contacts: this.contacts,
      contactsPresent: (this.contacts.length > 0)
    });
  
  }

  findContactId(contactItem) {
    let name = contactItem.firstElementChild.innerText.trim();
    let phoneNumber = contactItem.getElementsByTagName('dd')[0].innerText;
    let email = contactItem.getElementsByTagName('dd')[1].innerText;

    let contact = this.contacts.find(contact => {
      return (contact.full_name === name) &&
             (contact.phone_number === phoneNumber) &&
             (contact.email === email);
    });

    return contact ? contact.id : null;
  }

  async handleDelete(e) {
    e.preventDefault();
    if (!e.target.classList.contains("delete-btn")) return;

    if (confirm('Are you sure you want to delete this contact?')) {
      console.log("trying to delete now");
      let id = this.findContactId(e.target.parentNode);
      let deleted = await this.deleteContact(id);
      if (deleted) {
        this.displayContacts();
      } else {
        console.log("delete action canceled");
        return;
      }
    }
  }

  async deleteContact(id) {
    let deleted = await fetch(`http://localhost:3000/api/contacts/${id}`, { method: 'DELETE' });

    if (deleted.ok) {
      console.log("call to delete contact succeeded");
      return true;
    } else {
      console.log("call to delete contact failed");
      return false;
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  let contactManager = new ContactManager();
});