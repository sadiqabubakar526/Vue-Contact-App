
    
    class ContactService {
  constructor() {
    this.contacts = [];
    this.constraints = {
      name: {
        unique: false,
        empty: false
      },
      phone: {
        unique: true,
        empty: false
      }
    };
  }
  getFieldConstraints(field) {
    return this.constraints[field];
  }
  loadAll() {
 
     if (localStorage.getItem('contacts')) {
      this.contacts = JSON.parse(localStorage.getItem('contacts'));
    }
    this.contacts = [
    {id: 1, name: 'John Wick', phone: '+5911223300'},
    {id: 2, name: 'Pizza', phone: '909'},
    {id: 3, name: 'Jack the giant', phone: '+7776663434'},
    {id: 4, name: '0mo iya', phone: '+16045555555'},
    {id: 5, name: 'Yes', phone: '+27546534'},
    {id: 6, name: 'That guy', phone: '8(029)9999999'},
    {id: 7, name: 'Anna', phone: '+889991100'},
    {id: 8, name: 'Seth Everman', phone: '+996266542'},
    {id: 9, name: 'Bae❤️', phone: '123(345)3464545'},
    {id: 10, name: 'problem Isa', phone: '+000000000'},
    {id: 11, name: 'Sarah', phone: '+67876237865'},
    {id: 12, name: 'Freeman', phone: '+76597823652'}
    ];
  }
  saveAll() {
   
     const parsed = JSON.stringify(this.contacts);
     localStorage.setItem('contacts', parsed);
  }
  getList() {
    return this.contacts;
  }
  saveContact(contact) {
    if (contact.id) {
      this.updateContact(contact);
    } else {
      this.addContact(contact);
    }
    this.saveAll();
  }
  addContact(contact) {
    this.contacts.push({ id: + new Date(), ...contact });
  }
  updateContact(editedContact) {
    this.contacts.splice(
      this.contacts.indexOf(
        this.contacts.find(contact => contact.id === editedContact.id)
      ), 1, editedContact
    );
  }
  removeContact(contact) {
    this.contacts.splice(this.contacts.indexOf(contact), 1);
    this.saveAll();
  }
}

class Validator {
  constructor(service) {
    this.service = service;
  }
  validate(model) {
    const validation = {
      isValid: true,
      messages: [],
    };
    
    model.name ? model.name.trim() : model.name = null;
    model.phone ? model.phone.trim() : model.phone = null;

    for (const p in model) {
      if (p === 'id') continue;

      const constraints = this.service.getFieldConstraints(p);

      if (!constraints.empty && this.isEmpty(model[p])) {
        validation.isValid = false;
        validation.messages.push({ field: p, message: 'This field must be filled' });
      }
      if (constraints.unique && !this.isUnique(p, model.id, model[p])) {
        validation.isValid = false;
        validation.messages.push({ field: p, message: 'This field must be unique' });
      }
    }

    return validation;
  }
  isEmpty(value) {
    return !(value && value.length > 0);
  }
  isUnique(field, id, value) {
    return !this.service.getList().find(contact => contact[field] === value && contact.id !== id);
  }
}

window.onload = () => {

const service = new ContactService();
const validator = new Validator(service);

Vue.component('confirmButton', {
  template:
    `<button class="btn" :class="{ 'btn-danger': isDangerous, 'btn-success': !isDangerous }" @click="$emit('confirm')">
      <slot>Confirm</slot>
    </button>`,
  props: {
    isDangerous: Boolean
  },
});

Vue.component('contactModal', {
  template: '#contact-modal',
  methods: {
    closeModal() {
      $('.modal').modal('hide');
      this.$emit('close');
    },
    doConfirm() {
      if (this.canBeClosed) {
        this.closeModal();
      }
      this.$emit('confirm');
    }
  },
  created() {
    this.$parent.$on('confirm', this.closeModal);
  }
});

Vue.component('contactRemovalModal', {
  template: '#contact-removal-modal-template',
  props: {
    contactName: String
  },
  methods: {
    doConfirm() {
      this.$emit('confirm');
    }
  }
});

Vue.component('contactEditingModal', {
  template: '#contact-editing-modal-template',
  props: {
    contact: Object
  },
  data: () => {
    return {
      editedContact: {},
      validation: { isValid: false, messages: [] },
      errors: {}
    }
  },
  methods: {
    saveContact() {
      this.clearErrors();
      this.validation = validator.validate(this.editedContact);

      if (this.validation.isValid) {
        service.saveContact(this.editedContact);
        this.$emit('confirm');
      } else {
        this.showErrors();
      }
    },
    close() {
      this.clearErrors();
      this.$emit('close');
    },
    clearErrors() {
      for (const p in this.errors) {
        this.$set(this.errors, p, null);
      }
    },
    showErrors() {
      this.validation.messages.forEach(m => {
        this.$set(this.errors, m.field, m.message);
      });
    }
  },
  watch: {
    contact(contact) {
      this.editedContact = Vue.util.extend({}, contact);
    }
  }
});

new Vue({
  el: '#app',
  data: {
    contactToEdit: {},
    phoneBook: [],
    contactValidation: {},
    sortInAscendingOrder: true,
    searchString: ''
  },
  methods: {
    openContactAddingModal() {
      this.contactToEdit = {};
      $('#contact-adding-modal').modal('show');
    },
    setContactToEdit(contact) {
      this.contactToEdit = contact;
      $('#contact-editing-modal').modal('show');
    },
    unsetEditedContact() {
      this.contactToEdit = {};
    },
    setContactToRemove(contact) {
      this.contactToEdit = contact;
      $('#contact-removal-modal').modal('show');
    },
    removeContact() {
      service.removeContact(this.contactToEdit);
    },
    toggleSortingOrder() {
      this.sortInAscendingOrder = !this.sortInAscendingOrder;
    },
    resetSearch() {
      this.searchString = '';
    }
  },
  computed: {
    sortedNames() {
      return this.phoneBook
        .filter((c) => {
          return this.searchString ?
            c.name.toLowerCase().indexOf(this.searchString.toLowerCase()) > -1
            || c.phone.indexOf(this.searchString) > -1
            : true
        })
        .sort((a, b) => {
          return a.name.localeCompare(b.name) * (this.sortInAscendingOrder ? 1 : -1);
        });
    }
  },
  mounted() {
    service.loadAll();
    this.phoneBook = service.getList();
  },
});

}
swal({
        icon:"info",
        text:"This is a contact app created using vuejs !!! 🎉🎊... Hope you like it!  @SURAJ ABUBAKAR 👋"
    })
