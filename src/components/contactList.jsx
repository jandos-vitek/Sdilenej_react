/* eslint-disable jsx-a11y/control-has-associated-label */
import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EditContactForm from './editContactForm';
import Notification from './notification';
import { useUrl } from './UrlProvider';

const ContactList = ({
  firmId, firmName, onClose,
}) => {
  const { apiUrl } = useUrl();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);
  const { itemId } = useParams();
  const navigate = useNavigate();
  const listPath = `/contacts/${firmId}`;
  const selectedContact = itemId === 'new'
    ? { id: null, firm_id: firmId, main: !contacts.some((contact) => contact.main === '1') }
    : contacts.find((entry) => String(entry.id) === itemId);


  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    const fetchContacts = async () => {
      try {
        const response = await axios.get(`${apiUrl}contacts/${firmId}`);
        if (!active) return;
        if (Array.isArray(response.data) && response.data.length === 0
        && response.data.msg !== undefined) {
          setError('Žádné kontakty.');
        } else {
          console.log(response.data);
          setContacts(response.data);
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchContacts();
    return () => { active = false; };
  }, [apiUrl, firmId, itemId]);

  const deleteContact = async (contactId) => {
    try {
      const response = await axios.delete(`${apiUrl}contacts/${contactId}`);
      if (response.status === 200) {
        setContacts((prevContacts) => prevContacts.filter((contact) => contact.id !== contactId));
      } else {
        setError('Smazání kontaktu selhalo');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleClose = () => {
    navigate(listPath);
  };

  const handledelClick = (contact) => {
    const confirmed = window.confirm('Chceš to fakt vymazat?');
    if (confirmed) {
      deleteContact(contact.id);
    }
  };
  const handleEditClick = (contact) => {
    navigate(`${listPath}/${contact.id || 'new'}`);
  };

  const handleSave = () => navigate(listPath);

  const handleCopy = (inputValue) => {
    navigator.clipboard.writeText(inputValue).then(() => {
      setMsg('Zkopírováno!');
    }).catch((err) => {
      setError(`Chyba při kopírování: ${err.message}`);
    });
  };

  const Clipboard = (values) => handleCopy(values.filter(Boolean).join(', '));

  if (loading) {
    return <p className="no-data">Načítám...</p>;
  }
  if (itemId && !selectedContact && !error) {
    return (
      <div>
        <button type="button" onClick={handleClose}>Zpět na seznam</button>
        <p className="no-data">Záznam nebyl nalezen.</p>
      </div>
    );
  }
  if (error) {
    return (
      <p className="no-data">
        Error:
        {error}
      </p>
    );
  }
  return (
    <div>
      {msg && (<Notification message={msg} type="edit-firm-success" />)}
      {error && (<Notification message={error} type="edit-firm-error" />)}
      {selectedContact ? (
        <EditContactForm
          key={itemId}
          contact={selectedContact}
          onSave={handleSave}
          onClose={handleClose}
          firmName={firmName}
        />
      ) : (
        <>
          <button type="button" onClick={onClose}>Zpět na firmy</button>
          <table className="responsive-table">
            <caption><h3>{`${firmName.split('/(kont)')[0]} - kontakty`}</h3></caption>
            <thead>
              <tr>
                <th>Hlavní</th>
                <th>Aktivní</th>
                <th>Foto</th>
                <th>Jméno</th>
                <th>E-mail</th>
                <th>Telefon</th>
                <th>LinkedIN</th>
                <th />

              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id}>
                  <td data-label="Hlavní">{contact.main === '1' ? '\u2705' : '\u2610'}</td>
                  <td data-label="Aktivní">{contact.active_c === '1' ? '\u2705' : '\u2610'}</td>
                  <td data-label="Foto"><img src={contact.img} alt="" className="kontakt-img" /></td>
                  <td data-label="Jméno">{contact.surname}</td>
                  <td data-label="E-mail"><a href={`${contact.mailto.replace(/\+/g, ' ')}`}>{contact.email}</a></td>
                  <td data-label="Telefon"><a href={`tel:${contact.phone}`}>{contact.phone}</a></td>
                  <td data-label="LinkedIN">{ contact.linkedin ? (<a href={`${contact.linkedin}`}>LinkedIN</a>) : '\u00A0'}</td>
                  <td>
                    <button type="button" onClick={() => handleEditClick(contact)}>upravit</button>
                    <button type="button" onClick={() => handledelClick(contact)} className="del-btn">smazat</button>
                    <button type="button" onClick={() => Clipboard([contact.surname, contact.email, contact.phone, contact.linkedin])} className="fn-btn">Kontakt do schránky</button>
                  </td>
                </tr>
              ))}
              <tr>
                <td />
                <td />
                <td />
                <td />
                <td />
                <td />
                <td><button type="button" onClick={() => handleEditClick({ id: null, firm_id: firmId, main: !contacts.filter((contact) => contact.main === '1').length })}>Přidat kontakt</button></td>
              </tr>
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default ContactList;

ContactList.propTypes = {
  firmId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  firmName: PropTypes.string.isRequired,
};
