/* eslint-disable jsx-a11y/control-has-associated-label */
import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EditWSForm from './editWSForm';
import { useUrl } from './UrlProvider';
import convertDateToCzech from '../utils/czechdates';

const WorkshopList = ({
  firmId,
  firmName,
  onClose,
}) => {
  const { apiUrl } = useUrl();
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { itemId } = useParams();
  const navigate = useNavigate();
  const listPath = `/workshops/${firmId}`;
  const selectedContact = itemId === 'new'
    ? { firmId, date: '', type: '', notes: '' }
    : workshops.find((entry) => String(entry.id) === itemId);


  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    const fetchworkshops = async () => {
      try {
        const response = await axios.get(`${apiUrl}workshops/${firmId}`);
        if (!active) return;
        if (Array.isArray(response.data) && response.data.length === 0) {
          setWorkshops([]);
          // setError('errr');
          console.log('WS žádná data');
        } else {
          console.log(response.data);
          setWorkshops(response.data);
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchworkshops();
    return () => { active = false; };
  }, [apiUrl, firmId, itemId]);

  const deleteContact = async (contactId) => {
    try {
      const response = await axios.delete(`${apiUrl}/workshops/${contactId}`);
      if (response.status === 200) {
        setWorkshops((prevworkshops) => prevworkshops
          .filter((contact) => contact.id !== contactId));
      } else {
        setError('Smazání WS selhalo');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handledelClick = (contact) => {
    const confirmed = window.confirm('Chceš to fakt vymazat?');
    if (confirmed) {
      deleteContact(contact.id);
    }
  };

  const handleEditClick = (ws) => {
    navigate(`${listPath}/${ws.id || 'new'}`);
  };
  const handleClose = () => {
    navigate(listPath);
  };
  const handleSave = () => {
    navigate(listPath);
  };

  if (loading) {
    return <p className="no-data">načítání...</p>;
  }

  if (itemId && !selectedContact && !error) {
    return (
      <div>
        <button type="button" onClick={handleClose}>Zpět na seznam</button>
        <p className="no-data">Záznam nebyl nalezen.</p>
      </div>
    );
  }

  return (
    <div>
      {error ? (
        <p className="edit-firm-success edit-firm-error">
          Chyba:&nbsp;
          {error}
        </p>
      ) : ''}
      {!itemId && <button type="button" onClick={onClose}>Zpět na firmy</button>}
      {selectedContact ? (
        <EditWSForm key={itemId} contact={{ ...selectedContact, firmId: selectedContact.firmId || firmId }} onSave={handleSave} onClose={handleClose} />
      ) : (
        <table className="responsive-table">
          <caption><h3>{`Akce s firmou ${firmName.split('/(kont)')[0]}`}</h3></caption>
          <thead>
            <tr>
              <th className="hidden">ID</th>
              <th>Datum</th>
              <th>Typ</th>
              <th>Poznámka</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {workshops.map((workshop) => (
              <tr key={workshop.id}>
                <td data-label="ID" className="hidden">{workshop.id}</td>
                <td data-label="Datum">{convertDateToCzech(workshop.date)}</td>
                <td data-label="Typ">{workshop.type}</td>
                <td data-label="Poznámka">{workshop.notes}</td>
                <td>
                  <button type="button" onClick={() => handleEditClick(workshop)}>Upravit</button>
                </td>
                <td>
                  <button type="button" onClick={() => handledelClick(workshop)} className="del-btn">Smazat</button>
                </td>
              </tr>
            ))}
            <tr>
              <td />
              <td />
              <td />
              <td />
              <td><button type="button" onClick={() => handleEditClick({ firmId })}>Přidat akci</button></td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

WorkshopList.propTypes = {
  firmId: PropTypes.string,
  firmName: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default WorkshopList;
