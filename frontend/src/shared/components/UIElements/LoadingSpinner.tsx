import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  asOverlay?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ asOverlay }) => {
  return (
    <div className={`${asOverlay ? 'loading-spinner__overlay' : ''}`}>
      <div className="lds-dual-ring"></div>
    </div>
  );
};

export default LoadingSpinner;
