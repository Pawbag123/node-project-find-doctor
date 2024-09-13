import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';

import DoctorItem from './DoctorItem';
import './DoctorsList.css';
import { IDoctorListed, LoginState } from '../../types';
import { AuthContext } from '../../shared/context/auth-context';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

interface DoctorsListProps {
  filteredDoctors: IDoctorListed[];
  isLoading: boolean;
}

const DoctorsList: React.FC<DoctorsListProps> = ({
  filteredDoctors,
  isLoading,
}) => {
  const { loginState } = useContext(AuthContext);

  if (isLoading) {
    return (
      <div className="center">
        <LoadingSpinner />
      </div>
    );
  }
  if (filteredDoctors.length === 0) {
    return (
      <div>
        <h2 className="doctors-list"> No doctors found</h2>
      </div>
    );
  }

  return (
    <ul>
      {filteredDoctors.map((doctor) => (
        <DoctorItem key={doctor.id} doctor={doctor}>
          {loginState === LoginState.Patient ? (
            <Link to={`/${doctor.id}/appointment`}>
              <Button variant="contained" color="primary">
                Book visit
              </Button>
            </Link>
          ) : (
            <Link to={`/login`}>
              <Button variant="contained" color="primary">
                Login to book visit
              </Button>
            </Link>
          )}
        </DoctorItem>
      ))}
    </ul>
  );
};

export default DoctorsList;
