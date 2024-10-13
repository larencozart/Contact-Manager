// imports

class ContactManager {
   constructor() {
    this.contactsDisplay = document.getElementById('contacts-display');
    this.utilitiesBar = document.getElementById('utilities-bar');
    this.searchBar = document.getElementById('search-bar');
    this.clearSearchButton = document.getElementById('clear-search');
    this.addContactButton = document.getElementById('add-contact-btn');
    this.editContactSection = document.getElementById('edit-contact-section');
    this.editContactForm = document.getElementById('edit-contact-form');
    this.newContactSection = document.getElementById('new-contact-section');
    this.newContactForm = document.getElementById('new-contact-form');
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
    let added = await fetch(`http://localhost:3000/api/contacts/`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    return added.ok;
  }

  // ui display
  createTagList() {
    let tagListHandlebar = document.getElementById('tag-list-template');
    let tagListTemplate = Handlebars.compile(tagListHandlebar.innerHTML);

    this.tagDropdown.innerHTML = tagListTemplate({tags: this.allTags});
    this.tagList = this.tagDropdown.lastElementChild; 
    this.tagList.addEventListener("click", this.searchOnTag.bind(this));
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
      contactsPresent: (this.contacts.length > 0),
      contactsFound: (filteredContacts.length > 0),
      searchQuery: searchQuery,
    });
  }

  findContact(contactItem) {
    let contact = this.contacts.find(contact => {
      return contactItem.id === contact.id.toString();
    });
    return contact;
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
    this.clearSearchButton.addEventListener("click", this.handleClearSearch.bind(this));
    this.contactsDisplay.addEventListener("click", this.handleDeleteButton.bind(this));

    this.contactsDisplay.addEventListener("click", this.displayEditForm.bind(this));
    this.editContactForm.addEventListener("submit", this.handleUpdatedContact.bind(this));
    this.editContactForm.addEventListener("click", this.handleCancelButton.bind(this));

    this.addContactButton.addEventListener("click", this.displayNewContactForm.bind(this));
    this.newContactForm.addEventListener("submit", this.handleNewContact.bind(this));
    this.newContactForm.addEventListener("click", this.handleCancelButton.bind(this));

    this.tagDropdown.addEventListener("mouseover", this.displayTagList.bind(this));
    this.tagDropdown.addEventListener("mouseleave", this.hideTagList.bind(this));
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

    this.utilitiesBar.classList.add("hidden");
    this.contactsDisplay.classList.add("hidden");
    this.editContactSection.classList.remove("hidden");

    let unselectedTags = this.allTags.filter(tag => !this.currentContact.tags.includes(tag));

    this.editContactForm.innerHTML = editTemplate({
      ...this.currentContact, 
      unselectedTags,
    });

    // get form element here and add listener here
  }

  displayNewContactForm(e) {
    e.preventDefault();

    let newContactHandlebar = document.getElementById("new-contact-template");
    let newContactTemplate = Handlebars.compile(newContactHandlebar.innerHTML);

    this.newContactForm.innerHTML = newContactTemplate({allTags: this.allTags});

    this.utilitiesBar.classList.add("hidden");
    this.contactsDisplay.classList.add("hidden");
    this.newContactSection.classList.remove("hidden");
  }

  handleClearSearch(e) {
    this.searchBar.value = "";
    this.displayUI();
  }

  handleCancelButton(e) {
    if (!e.target.classList.contains("cancel-btn")) return;

    e.currentTarget.parentNode.classList.add("hidden");
    this.utilitiesBar.classList.remove("hidden");
    this.contactsDisplay.classList.remove("hidden");
    this.searchBar.value = "";
  }

  processFormValues(form, formData) {   
    let inputs = Array.from(form.getElementsByTagName('input'));                   
    let checkedTags = inputs.filter(input => input.getAttribute("type") === "checkbox" && input.checked)
                            .map(input => input.value);
    let newTag = formData.get("new-tag").trim();                          
    let tags = newTag ? checkedTags.concat(newTag) : checkedTags;

    return {
      full_name: formData.get("full_name"),
      email: formData.get("email"),
      phone_number: formData.get("phone_number"),
      tags: tags
    }              
  }

  async handleUpdatedContact(e) {
    try {
      e.preventDefault();
      let form = e.currentTarget;
      let data = this.processFormValues(form, new FormData(form));
      let edited = await this.editContact(data);
  
      if (edited) {
        this.displayUI();
        this.editContactSection.classList.toggle("hidden");
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
    e.preventDefault();

    let form = e.currentTarget;
    let data = this.processFormValues(form, new FormData(form));

    let added = await this.addContact(data);  
    
    if (added) {
      this.displayUI();
      this.newContactSection.classList.toggle("hidden");
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