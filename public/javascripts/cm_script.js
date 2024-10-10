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
    this.newTagForm = document.getElementById('new-tag');

    this.contacts = [];
    this.allTags = [];
    this.tagList = null;
    this.currentContact = null;

    this.displayUI();
    this.attachListeners();
  }

  // api iteractions
  async fetchContacts() {
    let response = await fetch("http://localhost:3000/api/contacts");
    this.contacts = await response.json();
  }

  async editContact(data) {
    let edited = await fetch(`http://localhost:3000/api/contacts/${this.currentContact.id}`, {
      method: "PUT",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        id: this.currentContact.id,
        ...data
      })
    });

    return edited.ok;
  }

  async deleteContact(id) {
    let deleted = await fetch(`http://localhost:3000/api/contacts/${id}`, { method: 'DELETE' });
    return deleted.ok;
  }

  async addContact(data) {
    let edited = await fetch(`http://localhost:3000/api/contacts/`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    return edited.ok;
  }

  // ui display
  createTagList() {
    let tagListHandlebar = document.getElementById('tag-list-template');
    let tagListTemplate = Handlebars.compile(tagListHandlebar.innerHTML);

    this.tagDropdown.insertAdjacentHTML("beforeend", tagListTemplate({tags: this.allTags}))
    this.tagList = this.tagDropdown.lastElementChild;
  }

  updateTagsProperty() {
    this.contacts.forEach(contact => {
      let tagsProperty = contact.tags;

      if (Array.isArray(tagsProperty)) {
        contact.tags = tagsProperty.filter(tag => tag.trim() !== "");
      } else {
        contact.tags = contact.tags ? contact.tags.replace(" ", "").split(",") : [];
      }

      contact.tagsPresent = contact.tags.length > 0;
    });
  }

  getAllTags() {
    let tags = this.contacts.map(contact => contact.tags).flat()
    this.allTags = Array.from(new Set(tags));
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

  filterContacts(searchQuery) {
    if (!searchQuery) {
      return this.contacts.slice();
    } else if (!searchQuery.startsWith(':')) {
      return this.filteredContactsByName(this.contacts.slice(), searchQuery);
    } else if (searchQuery.startsWith(':')) {
      return this.filterContactsByTag(this.contacts.slice(), searchQuery);
    } 
  }

  displayContacts() {
    let searchQuery = this.searchBar.value;
    let filteredContacts = this.filterContacts(searchQuery);

    let contactHandlebar = document.getElementById("contact-template");
    let contactTemplate = Handlebars.compile((contactHandlebar).innerHTML);

    this.contactsDisplay.innerHTML = contactTemplate({
      contacts: filteredContacts,
      contactsPresent: (filteredContacts.length > 0)
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

  displayTagList() {
    this.tagList.classList.remove("hidden");
  }

  hideTagList() {
    this.tagList.classList.add("hidden");
  }

  searchOnTag(e) {
    let tag = e.target.innerText;
    this.searchBar.value = `:${tag}`;

    this.displayUI();
  }

  // event handlers

  attachListeners() {
    this.searchBar.addEventListener("input", this.displayUI.bind(this));
    this.contactsDisplay.addEventListener("click", this.handleDeleteButton.bind(this));

    this.contactsDisplay.addEventListener("click", this.displayEditForm.bind(this));
    this.editContactForm.addEventListener("click", this.handleUpdatedContact.bind(this));
    this.editContactForm.addEventListener("click", this.handleCancelButton.bind(this));

    this.addContactButton.addEventListener("click", this.displayNewContactForm.bind(this));
    this.newContactForm.addEventListener("click", this.handleNewContact.bind(this));
    this.newContactForm.addEventListener("click", this.handleCancelButton.bind(this));

    this.tagDropdown.addEventListener("mouseover", this.displayTagList.bind(this));
    this.tagDropdown.addEventListener("mouseleave", this.hideTagList.bind(this));

    this.tagList.addEventListener("click", this.searchOnTag.bind(this));
  }

  async displayUI() {
    await this.fetchContacts();
    this.updateTagsProperty();
    this.getAllTags();
    this.createTagList();
    this.displayContacts();
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

    let unselectedTags = this.allTags.filter(tag => !this.currentContact.tags.includes(tag));

    this.editContactForm.innerHTML = editTemplate({
      ...this.currentContact, 
      unselectedTags,
    });
  }

  displayNewContactForm(e) {
    e.preventDefault();

    let newContactHandlebar = document.getElementById("new-contact-template");
    let newContactTemplate = Handlebars.compile(newContactHandlebar.innerHTML);

    this.newContactForm.innerHTML = newContactTemplate({allTags: this.allTags});

    this.utilitiesBar.classList.toggle("hidden");
    this.contactsDisplay.classList.toggle("hidden");
    this.newContactForm.classList.toggle("hidden");
  }

  handleCancelButton(e) {
    if (!e.target.classList.contains("cancel-btn")) return;

    e.currentTarget.classList.add("hidden");
    this.utilitiesBar.classList.remove("hidden");
    this.contactsDisplay.classList.remove("hidden");
    this.searchBar.value = "";
  }

  processedFormValues(form) {   
    let inputs = Array.from(form.getElementsByTagName('input'));                   
    let textValues = inputs.filter(input => input.getAttribute("type") === "text")
                           .map(input => input.value); 
    let checkedTags = inputs.filter(input => input.getAttribute("type") === "checkbox" && input.checked)
                            .map(input => input.value);
    
    let newTag = textValues[3];                          
    let tags = checkedTags.concat(newTag);

    return {
      // id: this.currentContact.id,
      full_name: textValues[0],
      email: textValues[1],
      phone_number: textValues[2],
      tags: tags
    }              
  }

  async handleUpdatedContact(e) {
    try {
      if (!e.target.classList.contains("submit-btn")) return;
  
      let form = e.target.parentNode;
      let data = this.processedFormValues(form);
      let edited = await this.editContact(data);
  
      if (edited) {
        this.displayUI();
        this.editContactForm.classList.toggle("hidden");
        this.utilitiesBar.classList.toggle("hidden");
        this.contactsDisplay.classList.toggle("hidden");
        this.searchBar.value = "";
      } else {
        throw new Error("Failed to make PUT request");
      }
    } catch (error) {
      console.error(error);
    }
  }

  async handleNewContact(e) {
    if (!e.target.classList.contains("submit-btn")) return;

    let form = e.target.parentNode;
    let data = this.processedFormValues(form);
    let added = await this.addContact(data);  
    
    if (added) {
      this.displayUI();
      this.newContactForm.classList.toggle("hidden");
      this.utilitiesBar.classList.toggle("hidden");
      this.contactsDisplay.classList.toggle("hidden");
      this.searchBar.value = "";
    } else {
      throw new Error("Failed to make POST request");
    }
  }

  async handleDeleteButton(e) {
    e.preventDefault();
    if (!e.target.classList.contains("delete-btn")) return;

    if (confirm('Are you sure you want to delete this contact?')) {
      let contactListItem = e.target.parentNode;
      this.currentContact = this.findContact(contactListItem);
      let deleted = await this.deleteContact(this.currentContact.id);
      if (deleted) {
        this.displayUI();
      } else {
        console.log("delete action failed");
        return;
      }
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  let contactManager = new ContactManager();
});