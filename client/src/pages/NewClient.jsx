import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientsApi } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import styles from './NewClient.module.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateForm(data) {
  const errors = {};

  const name = data.name.trim();
  if (!name) {
    errors.name = 'Client name is required';
  } else if (name.length < 2) {
    errors.name = 'Client name must be at least 2 characters';
  } else if (name.length > 100) {
    errors.name = 'Client name must be less than 100 characters';
  }

  const email = data.email.trim();
  if (!email) {
    errors.email = 'Email is required';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (data.notes && data.notes.length > 1000) {
    errors.notes = 'Notes must be less than 1000 characters';
  }

  return errors;
}

export default function NewClient() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    notes: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate form
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setFieldErrors({});

    try {
      const result = await clientsApi.create({
        name: formData.name.trim(),
        email: formData.email.trim(),
        notes: formData.notes.trim(),
      });
      navigate(`/clients/${result.client.id}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Add New Client</h1>
        <p className={styles.subtitle}>Create a new client to begin CAPI setup</p>
      </header>

      <Card className={styles.formCard}>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className={styles.error}>{error}</div>
          )}

          <div className={`${styles.field} ${fieldErrors.name ? styles.fieldError : ''}`}>
            <label htmlFor="name">Client Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Acme Corporation"
              aria-invalid={!!fieldErrors.name}
              aria-describedby={fieldErrors.name ? 'name-error' : undefined}
            />
            {fieldErrors.name && (
              <span id="name-error" className={styles.fieldErrorText}>{fieldErrors.name}</span>
            )}
          </div>

          <div className={`${styles.field} ${fieldErrors.email ? styles.fieldError : ''}`}>
            <label htmlFor="email">Contact Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g., contact@acme.com"
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            />
            {fieldErrors.email && (
              <span id="email-error" className={styles.fieldErrorText}>{fieldErrors.email}</span>
            )}
          </div>

          <div className={`${styles.field} ${fieldErrors.notes ? styles.fieldError : ''}`}>
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional notes about this client..."
              rows={4}
              aria-invalid={!!fieldErrors.notes}
              aria-describedby={fieldErrors.notes ? 'notes-error' : undefined}
            />
            {fieldErrors.notes && (
              <span id="notes-error" className={styles.fieldErrorText}>{fieldErrors.notes}</span>
            )}
          </div>

          <div className={styles.actions}>
            <Button type="button" variant="ghost" onClick={() => navigate('/')}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Create Client
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
