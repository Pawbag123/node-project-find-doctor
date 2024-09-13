import React, { ReactNode } from 'react';
import './DoctorItem.css'; // Import the CSS file
import { IDoctorListed } from '../../types';

interface DoctorItemProps {
  doctor: IDoctorListed;
  children?: ReactNode; // This allows the component to accept any JSX as children
}

const DoctorItem: React.FC<DoctorItemProps> = ({ doctor, children }) => {
  return (
    <li className="doctor-item" key={doctor.id}>
      <img src={doctor.image} alt={doctor.name} />
      <div className="doctor-info">
        <div className="main-info">
          <div className="name">{doctor.name}</div>
          <div className="additional-info">
            <div className="specialty">{doctor.specialty.name}</div>
            <div className="causes">
              {doctor.causes.map((cause) => cause.name).join(', ')}
            </div>
          </div>
        </div>
        <div className="place-info">
          <div className="address">{doctor.address}</div>
          {doctor.distance && (
            <div className="distance">{doctor.distance} km away</div>
          )}
          <div className="distance"></div>
        </div>
      </div>
      {children}
    </li>
  );
};

export default DoctorItem;
