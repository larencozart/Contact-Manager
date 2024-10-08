// imports

class ContactManager {
   constructor() {
    this.contactsDisplay = document.getElementById('contacts-display');
    this.searchBar = document.getElementById('search-bar');
    this.utilitiesBar = document.getElementById('utilities-bar');
    this.editContactForm = document.getElementById('edit-contact');
    this.contacts = [];

    this.displayContacts();
    this.attachListeners();
  }

  attachListeners() {
    this.searchBar.addEventListener("input", this.displayContacts.bind(this));
    this.contactsDisplay.addEventListener("click", this.handleDeleteButton.bind(this));
    this.contactsDisplay.addEventListener("click", this.handleEditButton.bind(this));
    this.editContactForm.addEventListener("click", this.handleSubmission.bind(this));
    this.editContactForm.addEventListener("click", this.handleCancelButton.bind(this));
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

  async handleDeleteButton(e) {
    e.preventDefault();
    if (!e.target.classList.contains("delete-btn")) return;

    if (confirm('Are you sure you want to delete this contact?')) {
      let contact = e.target.parentNode;
      let id = this.findContactId(contact);
      let deleted = await this.deleteContact(id);
      if (deleted) {
        this.displayContacts();
      } else {
        console.log("delete action failed");
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

  displayEditForm(contactInfo) {
    let editHandlebar = document.getElementById('edit-template');
    let editTemplate = Handlebars.compile(editHandlebar.innerHTML);

    console.log('trying to display edit form');
    this.utilitiesBar.classList.add("hidden");
    this.contactsDisplay.classList.add("hidden");
    this.editContactForm.classList.remove("hidden");
    this.editContactForm.innerHTML = editTemplate({...contactInfo});
  }

  async handleEditButton(e) {
    e.preventDefault();
    if (!e.target.classList.contains("edit-btn")) return; 

    let contact = e.target.parentNode;
    let name = contact.firstElementChild.innerText.trim();
    let phoneNumber = contact.getElementsByTagName('dd')[0].innerText;
    let email = contact.getElementsByTagName('dd')[1].innerText;

    this.displayEditForm({name, phoneNumber, email});
  }

  async editContact() {
    
  }

  handleSubmission(e) {
    e.preventDefault();
    if (!e.target.classList.contains("submit-btn")) return;

    // make post request to update contact data
    // hide our form
    // show our contacts display (with updated contact info)
  }

  handleCancelButton(e) {
    e.preventDefault();
    if (!e.target.classList.contains("cancel-btn")) return;

    e.currentTarget.classList.add("hidden");
    this.contactsDisplay.classList.remove("hidden");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  let contactManager = new ContactManager();
});