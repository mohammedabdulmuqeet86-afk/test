

document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('contact-form');
  var successDiv = document.getElementById('contact-success');
  var sendAnotherBtn = document.getElementById('send-another');
  var submitBtn = document.getElementById('contact-submit');

  if (!form) return;

  // Field references
  var fields = {
    name: {
      input: document.getElementById('contact-name'),
      error: document.getElementById('error-name'),
      group: document.getElementById('form-group-name')
    },
    email: {
      input: document.getElementById('contact-email'),
      error: document.getElementById('error-email'),
      group: document.getElementById('form-group-email')
    },
    subject: {
      input: document.getElementById('contact-subject'),
      error: document.getElementById('error-subject'),
      group: document.getElementById('form-group-subject')
    },
    message: {
      input: document.getElementById('contact-message'),
      error: document.getElementById('error-message'),
      group: document.getElementById('form-group-message')
    }
  };

  // ── Validation functions ──
  function validateName() {
    var val = fields.name.input.value.trim();
    if (!val) {
      showError('name', 'Please enter your name.');
      return false;
    }
    if (val.length < 2) {
      showError('name', 'Name must be at least 2 characters.');
      return false;
    }
    clearError('name');
    return true;
  }

  function validateEmail() {
    var val = fields.email.input.value.trim();
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!val) {
      showError('email', 'Please enter your email address.');
      return false;
    }
    if (!emailPattern.test(val)) {
      showError('email', 'Please enter a valid email address.');
      return false;
    }
    clearError('email');
    return true;
  }

  function validateSubject() {
    var val = fields.subject.input.value.trim();
    if (!val) {
      showError('subject', 'Please enter a subject.');
      return false;
    }
    if (val.length < 2) {
      showError('subject', 'Subject must be at least 2 characters.');
      return false;
    }
    clearError('subject');
    return true;
  }

  function validateMessage() {
    var val = fields.message.input.value.trim();
    if (!val) {
      showError('message', 'Please enter a message.');
      return false;
    }
    if (val.length < 10) {
      showError('message', 'Message must be at least 10 characters.');
      return false;
    }
    clearError('message');
    return true;
  }

  function showError(fieldName, message) {
    fields[fieldName].error.textContent = message;
    fields[fieldName].input.classList.add('form-input--error');
  }

  function clearError(fieldName) {
    fields[fieldName].error.textContent = '';
    fields[fieldName].input.classList.remove('form-input--error');
  }

  // ── Real-time validation on blur ──
  fields.name.input.addEventListener('blur', validateName);
  fields.email.input.addEventListener('blur', validateEmail);
  fields.subject.input.addEventListener('blur', validateSubject);
  fields.message.input.addEventListener('blur', validateMessage);

  // Clear error on input
  Object.keys(fields).forEach(function (key) {
    fields[key].input.addEventListener('input', function () {
      clearError(key);
    });
  });

  // ── Form submit via AJAX ──
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Run all validations
    var isNameValid = validateName();
    var isEmailValid = validateEmail();
    var isSubjectValid = validateSubject();
    var isMessageValid = validateMessage();

    if (!isNameValid || !isEmailValid || !isSubjectValid || !isMessageValid) {
      // Focus first invalid field
      if (!isNameValid) fields.name.input.focus();
      else if (!isEmailValid) fields.email.input.focus();
      else if (!isSubjectValid) fields.subject.input.focus();
      else fields.message.input.focus();
      return;
    }

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.querySelector('.btn__text').style.display = 'none';
    submitBtn.querySelector('.btn__loader').style.display = 'inline-flex';

    // Prepare data
    var data = {
      name: fields.name.input.value.trim(),
      email: fields.email.input.value.trim(),
      subject: fields.subject.input.value.trim(),
      message: fields.message.input.value.trim()
    };

    // AJAX POST request
    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(function (res) { return res.json(); })
    .then(function (result) {
      if (result.success) {
        // Show success message
        form.style.display = 'none';
        successDiv.style.display = 'block';
      } else {
        // Show server-side errors
        if (result.errors && result.errors.length > 0) {
          alert('Error: ' + result.errors.join('\n'));
        }
      }
    })
    .catch(function (err) {
      console.error('Contact form error:', err);
      alert('An error occurred. Please try again.');
    })
    .finally(function () {
      submitBtn.disabled = false;
      submitBtn.querySelector('.btn__text').style.display = 'inline';
      submitBtn.querySelector('.btn__loader').style.display = 'none';
    });
  });

  // ── Send Another Message ──
  if (sendAnotherBtn) {
    sendAnotherBtn.addEventListener('click', function () {
      form.reset();
      Object.keys(fields).forEach(function (key) { clearError(key); });
      form.style.display = 'block';
      successDiv.style.display = 'none';
    });
  }
});
