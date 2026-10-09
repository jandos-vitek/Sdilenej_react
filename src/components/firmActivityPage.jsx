import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ContactList from './contactList';
import MeetList from './meetList';
import WorkshopList from './workshoplist';
import { useUrl } from './UrlProvider';

const lists = { contacts: ContactList, meets: MeetList, workshops: WorkshopList };

const FirmActivityPage = ({ kind }) => {
  const { firmId } = useParams();
  const navigate = useNavigate();
  const { apiUrl } = useUrl();
  const [firmName, setFirmName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    axios.get(`${apiUrl}firms/list`).then(({ data }) => {
      if (!active) return;
      const firm = Array.isArray(data)
        ? data.find((item) => String(item.id) === firmId) : null;
      if (!firm) {
        setError('Firma nebyla nalezena.');
      } else {
        setFirmName((firm.name || '').split('/(kont)')[0]);
      }
    }).catch((err) => {
      if (active) setError(err.message);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [apiUrl, firmId]);

  const backToFirms = () => navigate('/');
  if (loading) return <p className="no-data">Načítám...</p>;
  if (error) {
    return (
      <div>
        <button type="button" onClick={backToFirms}>Zpět na firmy</button>
        <p className="no-data">{error}</p>
      </div>
    );
  }
  const List = lists[kind];
  return (
    <List
      key={`${kind}/${firmId}`}
      firmId={firmId}
      firmName={firmName}
      onClose={backToFirms}
    />
  );
};

FirmActivityPage.propTypes = { kind: PropTypes.string.isRequired };

export default FirmActivityPage;
