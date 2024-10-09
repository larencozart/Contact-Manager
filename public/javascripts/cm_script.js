// imports

class ContactManager {
   constructor() {
    this.contactsDisplay = document.getElementById('contacts-display');
    this.utilitiesBar = document.getElementById('utilities-bar');
    this.searchBar = document.getElementById('search-bar');
    this.addContactButton = document.getElementById('add-contact-btn');
    this.editContactForm = document.getElementById('edit-contact');
    this.newContactForm = document.getElementById('new-contact');
    this.tagDropdown = document.getElementById('tag-dropdown');
    this.tagList = null;
    this.contacts = [];
    this.currentContact = null;
    this.tags = ["LaunchSchool", "Friend", "Book Club", "work"];

    this.createTagList();
    this.displayContacts();
    this.attachListeners();
  }

  attachListeners() {
    this.searchBar.addEventListener("input", this.displayContacts.bind(this));
    this.contactsDisplay.addEventListener("click", this.handleDeleteButton.bind(this));

    this.contactsDisplay.addEventListener("click", this.displayEditForm.bind(this));
    this.editContactForm.addEventListener("click", this.submitUpdatedContact.bind(this));
    this.editContactForm.addEventListener("click", this.handleCancelButton.bind(this));

    this.addContactButton.addEventListener("click", this.displayNewContactForm.bind(this));
    this.newContactForm.addEventListener("click", this.submitNewContact.bind(this));
    this.newContactForm.addEventListener("click", this.handleCancelButton.bind(this));

    this.tagDropdown.addEventListener("mouseover", this.displayTagList.bind(this));
    this.tagDropdown.addEventListener("mouseleave", this.hideTagList.bind(this));

    this.tagList.addEventListener("click", this.addNewTag.bind(this));
    this.tagList.addEventListener("click", this.searchOnTag.bind(this));
  }

  createTagList() {
    let tagListHandlebar = document.getElementById('tag-list-template');
    let tagListTemplate = Handlebars.compile(tagListHandlebar.innerHTML);

    this.tagDropdown.insertAdjacentHTML("beforeend", tagListTemplate({tags: this.tags}))
    this.tagList = this.tagDropdown.lastElementChild;
  }

  updateTagsProperty(contacts) {
    contacts.forEach(contact => {
      contact.tags = contact.tags ? contact.tags.split(",") : [];
      contact.tagsPresent = contact.tags.length > 0;
    });
  }

  filteredContactsByName(contacts, searchQuery) {
    return contacts.filter(contact => {
      let name = contact.full_name.toLowerCase();
      searchQuery = searchQuery.toLowerCase().trim();
      return name.includes(searchQuery);
    });
  }

  filterContactsByTag(contacts, searchQuery) {
    searchQuery = searchQuery.toLowerCase().trim().slice(1);

    let filteredContacts = contacts.filter(contact => {
      let tags = contact.tags.map(tag => tag.toLowerCase().trim());
      return tags.includes(searchQuery);
    });
    
    return filteredContacts;
  }

  async fetchContacts(searchQuery) {
    let response = await fetch("http://localhost:3000/api/contacts");
    let contacts = await response.json();

    this.updateTagsProperty(contacts);

    if (!searchQuery) {
      return contacts;
    } else if (!searchQuery.startsWith(':')) {
      return this.filteredContactsByName(contacts, searchQuery);
    } else if (searchQuery.startsWith(':')) {
      return this.filterContactsByTag(contacts, searchQuery);
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

  findContact(contactItem) {
    let name = contactItem.firstElementChild.innerText.trim();
    let phoneNumber = contactItem.getElementsByTagName('dd')[0].innerText;
    let email = contactItem.getElementsByTagName('dd')[1].innerText;

    let contact = this.contacts.find(contact => {
      return (contact.full_name === name) &&
             (contact.phone_number === phoneNumber) &&
             (contact.email === email);
    });

    return contact ? contact : null;
  }

  async handleDeleteButton(e) {
    e.preventDefault();
    if (!e.target.classList.contains("delete-btn")) return;

    if (confirm('Are you sure you want to delete this contact?')) {
      let contactListItem = e.target.parentNode;
      this.currentContact = this.findContact(contactListItem);
      let deleted = await this.deleteContact(this.currentContact.id);
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
    return deleted.ok;
  }

  displayEditForm(e) {
    e.preventDefault();
    if (!e.target.classList.contains("edit-btn")) return; 

    let contactListItem = e.target.parentNode;
    this.currentContact = this.findContact(contactListItem);

    let editHandlebar = document.getElementById('edit-template');
    let editTemplate = Handlebars.compile(editHandlebar.innerHTML);

    this.utilitiesBar.classList.toggle("hidden");
    this.contactsDisplay.classList.toggle("hidden");
    this.editContactForm.classList.toggle("hidden");
    this.editContactForm.innerHTML = editTemplate({...this.currentContact});
  }

  async editContact(values) {
    let edited = await fetch(`http://localhost:3000/api/contacts/${this.currentContact.id}`, {
      method: "PUT",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: this.currentContact.id,
        full_name: values[0],
        email: values[1],
        phone_number: values[2],
        tags: values[3]
      })
    });

    return edited.ok;
  }

  async submitUpdatedContact(e) {
    try {
      e.preventDefault();
      if (!e.target.classList.contains("submit-btn")) return;
  
      let form = e.target.parentNode;
      let formValues = Array.from(form.getElementsByTagName("input"))
                             .map(input => input.value);
  
      let edited = await this.editContact(formValues);
  
      if (edited) {
        await this.displayContacts();
        this.editContactForm.classList.toggle("hidden");
        this.utilitiesBar.classList.toggle("hidden");
        this.contactsDisplay.classList.toggle("hidden");
      } else {
        throw new Error("Failed to make PUT request");
      }
    } catch (error) {
      console.error(error);
    }
  }

  displayNewContactForm(e) {
    e.preventDefault();
    this.utilitiesBar.classList.toggle("hidden");
    this.contactsDisplay.classList.toggle("hidden");
    this.newContactForm.classList.toggle("hidden");
  }

  handleCancelButton(e) {
    e.preventDefault();
    if (!e.target.classList.contains("cancel-btn")) return;

    e.currentTarget.classList.toggle("hidden");
    this.utilitiesBar.classList.toggle("hidden");
    this.contactsDisplay.classList.toggle("hidden");
  }

  async addContact(values) {
    let edited = await fetch(`http://localhost:3000/api/contacts/`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: values[0],
        email: values[1],
        phone_number: values[2],
        tags: values[3]
      })
    });

    return edited.ok;
  }

  async submitNewContact(e) {
    e.preventDefault();
    if (!e.target.classList.contains("submit-btn")) return;

    let form = e.target.parentNode;
    let formValues = Array.from(form.getElementsByTagName("input"))
                             .map(input => input.value);

    let added = await this.addContact(formValues);  
    
    if (added) {
      await this.displayContacts();
      this.newContactForm.classList.toggle("hidden");
      this.utilitiesBar.classList.toggle("hidden");
      this.contactsDisplay.classList.toggle("hidden");
    } else {
      throw new Error("Failed to make PUT request");
    }
  }

  displayTagList() {
    this.tagList.classList.remove("hidden");
  }

  hideTagList() {
    this.tagList.classList.add("hidden");
  }

  addNewTag(e) {
    e.preventDefault();
    if (!e.target.classList.contains("add-tag")) return;

    console.log("clicked on tag");
    // add a pop up input here to enter a new tag
    // update taglist & display
  }

  async searchOnTag(e) {
    let tag = e.target.innerText;
    this.searchBar.value = `:${tag}`;

    await this.displayContacts();
  }

}

document.addEventListener("DOMContentLoaded", () => {
  let contactManager = new ContactManager();
});