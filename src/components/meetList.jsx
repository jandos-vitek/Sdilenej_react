/* eslint-disable jsx-a11y/control-has-associated-label */
import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EditMeetForm from './editMeetForm';
import { useUrl } from './UrlProvider';
import { convertDateTimeToCzech } from '../utils/czechdates';

const MeetList = ({
  firmId, firmName, onClose,
}) => {
  const { apiUrl } = useUrl();
  const [meets, setMeets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { itemId } = useParams();
  const navigate = useNavigate();
  const listPath = `/meets/${firmId}`;
  const selectedMeet = itemId === 'new'
    ? { firm_id: firmId }
    : meets.find((entry) => String(entry.id) === itemId);


  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    const fetchMeets = async () => {
      try {
        const response = await axios.get(`${apiUrl}meets/${firmId}`);
        if (!active) return;
        if (Array.isArray(response.data) && response.data.length === 0
        && response.data.msg !== undefined) {
          setError('Žádné schůzky.');
        } else {
          console.log(response.data);
          setMeets(response.data);
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchMeets();
    return () => { active = false; };
  }, [apiUrl, firmId, itemId]);

  const deleteMeet = async (meetId) => {
    try {
      const response = await axios.delete(`${apiUrl}meets/${meetId}`);
      if (response.status === 200) {
        setMeets((prevMeets) => prevMeets.filter((meet) => meet.id !== meetId));
      } else {
        setError('Smazání kontaktu selhalo');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handledelClick = (meet) => {
    const confirmed = window.confirm('Chceš to fakt vymazat?');
    if (confirmed) {
      deleteMeet(meet.id);
    }
  };
  const handleEditClick = (meet) => {
    navigate(`${listPath}/${meet.id || 'new'}`);
  };
  const handleClose = () => {
    navigate(listPath);
  };
  const handleSave = () => {
    navigate(listPath);
  };

  if (loading) {
    return <p className="no-data">Načítám...</p>;
  }
  if (itemId && !selectedMeet && !error) {
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
        Chyba:
        {error}
      </p>
    );
  }
  return (
    <div>
      {!itemId && <button type="button" onClick={onClose}>Zpět na firmy</button>}
      {selectedMeet ? (
        <EditMeetForm key={itemId} meet={selectedMeet} onSave={handleSave} onClose={handleClose} firmName={firmName.split('/(kont)')[0]} />
      ) : (
        <table className="responsive-table">
          <caption><h3>{`${firmName.split('/(kont)')[0]} - schůzky`}</h3></caption>
          <thead>
            <tr>
              <th>Datum a čas</th>
              <th>Poznámka</th>
              <th />
              <th />
            </tr>
          </thead>
          <tbody>
            {meets.map((meet) => (
              <tr key={meet.id}>
                <td data-label="Datum a čas">{convertDateTimeToCzech(meet.date_time)}</td>
                <td data-label="Poznámka">{meet.notes}</td>
                <td><button type="button" onClick={() => handleEditClick(meet)}>upravit</button></td>
                <td><button type="button" onClick={() => handledelClick(meet)} className="del-btn">smazat</button></td>
              </tr>
            ))}
            <tr>
              <td />
              <td />
              <td />
              <td><button type="button" onClick={() => handleEditClick({ firm_id: firmId })}>Přidat schůzku</button></td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MeetList;

MeetList.propTypes = {
  firmId: PropTypes.string.isRequired,
  firmName: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};
