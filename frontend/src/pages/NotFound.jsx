import { Link } from 'react-router-dom';

// 404 page.
const NotFound = () => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
    <p className="text-6xl font-bold text-primary">404</p>
    <h2 className="mt-2 text-xl font-semibold text-secondary dark:text-slate-100">
      Page not found
    </h2>
    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
      The page you are looking for does not exist.
    </p>
    <Link to="/" className="btn-primary mt-6">
      Back to Dashboard
    </Link>
  </div>
);

export default NotFound;
