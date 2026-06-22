// Simple loading spinner.
const Spinner = ({ size = 'md', className = '' }) => {
  const dims = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-4',
  }[size];

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${dims} animate-spin rounded-full border-primary border-t-transparent`}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
};

export default Spinner;
